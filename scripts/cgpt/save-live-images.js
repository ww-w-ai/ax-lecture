// 매직지우개(AI 이미지 편집) 결과 저장 — reload 전 필수.
// 배경: build-deck.js 매직지우개(686~728)는 캔버스로 픽셀을 편집한 뒤 toDataURL 로 img.src + data-src 를
//   둘 다 base64 로 굽는다(line 728). 이 base64 = 편집 결과이며, reload 하면 소실된다(메모리 DOM에만 존재).
//   즉 "라이브 img 의 src/data-src 가 data:image base64" = 매직지우개로 픽셀이 바뀌었다는 확실한 흔적.
// 이 도구: 라이브 탭의 <ID> 섹션에서 base64 인라인 img 를 찾아 → 디코드 → 에셋 파일로 저장(원본은 .orig 백업)
//   → 소스 html/<ID>.html 의 그 img src 는 에셋 경로 그대로 두면 됨(base64 를 소스에 넣지 않는다).
// usage: node scripts/cgpt/save-live-images.js <SECTION_ID>            예: node scripts/cgpt/save-live-images.js P67
//        node scripts/cgpt/save-live-images.js <SECTION_ID> --apply    (기본=감지+저장. --dry 면 저장 안 하고 감지만)
// 안전: deck 탭은 reload 안 함. 원본 에셋이 이미 백업(.orig)되어 있으면 다시 안 덮음(첫 원본 보존).
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const HTML = path.resolve(__dirname, '../../html');
const ASSETS = path.resolve(__dirname, '../../assets');
const GEN = path.resolve(__dirname, '../../generated');
const ID = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!ID) { console.error('usage: node save-live-images.js <SECTION_ID> [--dry]'); process.exit(1); }

// 페이지 컨텍스트: <ID> 섹션의 모든 img 에서 {alt, src, dataSrc} 수집(정리 없이 원본).
const grab = (id) => {
  const s = document.getElementById(id); if (!s) return null;
  return [...s.querySelectorAll('img')].map(im => ({
    alt: im.getAttribute('alt') || '',
    src: im.getAttribute('src') || '',
    dataSrc: im.getAttribute('data-src') || ''
  }));
};

// data:image/<fmt>;base64,<data> → {ext, buf}   아니면 null
function decodeDataUri(v) {
  const m = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s.exec(v || '');
  if (!m) return null;
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  return { ext, buf: Buffer.from(m[2], 'base64') };
}

// 소스 html/<ID>.html 에서 alt→에셋경로(../assets|../generated) 매핑 추출.
function sourceAssetMap(id) {
  const p = path.join(HTML, id + '.html');
  const map = [];
  if (!fs.existsSync(p)) return map;
  const html = fs.readFileSync(p, 'utf8');
  const re = /<img\b[^>]*>/g; let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src = (/\bsrc="([^"]+)"/.exec(tag) || [])[1] || (/\bdata-src="([^"]+)"/.exec(tag) || [])[1] || '';
    const alt = (/\balt="([^"]*)"/.exec(tag) || [])[1] || '';
    if (/^\.\.\/(assets|generated)\//.test(src)) map.push({ alt, src });
  }
  return map;
}

function resolveAssetPath(relSrc) {
  // ../assets/x.png → 절대경로.  ../generated/x.png → generated.
  if (relSrc.startsWith('../assets/')) return path.join(ASSETS, relSrc.slice('../assets/'.length));
  if (relSrc.startsWith('../generated/')) return path.join(GEN, relSrc.slice('../generated/'.length));
  return null;
}

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = b.contexts()[0];
  let live = null;
  for (const p of ctx.pages()) { if (p.url().includes('deck.html')) { live = p; break; } }
  if (!live) { console.log('NO_LIVE_DECK_TAB (deck.html 탭 없음)'); process.exit(1); }

  const imgs = await live.evaluate(grab, ID);
  if (!imgs) { console.log('NO_SECTION', ID); process.exit(1); }

  const srcMap = sourceAssetMap(ID);
  const baked = imgs
    .map((im, idx) => ({ im, idx, data: decodeDataUri(im.src) || decodeDataUri(im.dataSrc) }))
    .filter(x => x.data);

  if (!baked.length) {
    console.log(`[${ID}] base64 인라인 img 없음 → 매직지우개 편집 아님 (이미지 저장할 것 없음).`);
    process.exit(0);
  }

  console.log(`[${ID}] ⚠ base64 인라인 img ${baked.length}개 = 매직지우개 편집 감지.`);
  let saved = 0;
  for (const { im, idx, data } of baked) {
    // 대상 에셋: (1) alt 일치하는 소스 img 의 경로, (2) 소스 img 가 1개뿐이면 그거, (3) 실패 시 파생 파일명.
    let target = srcMap.find(s => s.alt && s.alt === im.alt);
    if (!target && srcMap.length === 1) target = srcMap[0];
    let assetAbs, relForReport;
    if (target) { assetAbs = resolveAssetPath(target.src); relForReport = target.src; }
    if (!assetAbs) {
      // 매핑 실패 → 파생 파일명으로 저장(소스 src 를 수동으로 이 경로로 바꿔야 함).
      assetAbs = path.join(ASSETS, `${ID}-baked-${idx}.${data.ext}`);
      relForReport = `../assets/${ID}-baked-${idx}.${data.ext}`;
      console.log(`  · img[${idx}] (alt="${im.alt.slice(0,30)}…") 소스 매핑 실패 → 파생 저장: ${relForReport} (소스 src 수동 교체 필요)`);
    }
    const same = fs.existsSync(assetAbs) && fs.readFileSync(assetAbs).equals(data.buf);
    if (same) { console.log(`  · img[${idx}] → ${relForReport} : 픽셀 동일(재인코딩만) — 건너뜀`); continue; }
    if (DRY) { console.log(`  · img[${idx}] → ${relForReport} : 저장 대상(${data.buf.length}b) [--dry, 저장 안 함]`); continue; }
    // 원본 백업(첫 원본만 — .orig 이미 있으면 보존).
    const orig = assetAbs.replace(/(\.[^.]+)$/, '.orig$1');
    if (fs.existsSync(assetAbs) && !fs.existsSync(orig)) { fs.copyFileSync(assetAbs, orig); console.log(`    (원본 백업: ${path.basename(orig)})`); }
    fs.writeFileSync(assetAbs, data.buf);
    console.log(`  · img[${idx}] → ${relForReport} 저장 완료 (${data.buf.length}b)`);
    saved++;
  }
  console.log(`\n[${ID}] 완료: ${saved}개 저장. 소스 html/${ID}.html 의 img src 는 에셋 경로면 그대로 OK.`);
  console.log(`  다음: node scripts/build-deck.js (이미지 ?v=mtime 캐시버스트) → deck-goto 로 확인.`);
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
