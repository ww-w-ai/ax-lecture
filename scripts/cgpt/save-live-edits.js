// 라이브 편집 → 소스 저장 (캐노니컬·rule-executable). reload 전 실행.
// 방식(사용자 확정): ① undo 스택이 비지 않은 페이지 = 편집됨(window.__deckEdits, 상세 히스토리 안 봄)
//   → ② 그 페이지 "최종 상태"(현재 outerHTML)로 소스 html/<ID>.html 의 <section> 을 통째로 덮어쓴다.
//   → ③ 매직지우개 base64 img 는 에셋으로 추출(원본 .orig 백업), 소스 src 는 에셋 경로.
// diff·아티팩트 필터링 불필요: clean() 이 편집 잔재(contenteditable/sel/data-lh/cur/data-idx)만 제거하고,
//   위치·크롭·patch 등 실제 편집은 최종 상태 그대로 보존한다.
// usage: node scripts/cgpt/save-live-edits.js [--dry] [ID ...]
//   인자 없으면 __deckEdits() 의 편집된 페이지 전부. ID 주면 그 페이지들만(강제).
// 안전: deck 탭 reload 안 함. __deckEdits 없으면(구버전 빌드) 중단하고 재빌드 안내.
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const HTML = path.resolve(__dirname, '../../html');
const ASSETS = path.resolve(__dirname, '../../assets');
const GEN = path.resolve(__dirname, '../../generated');
const DRY = process.argv.includes('--dry');
const FORCE_IDS = process.argv.slice(2).filter(a => !a.startsWith('--'));

// 페이지 컨텍스트: 섹션 outerHTML 을 편집 잔재 제거 후 반환(소스에 넣을 형태).
//   제거: contenteditable/sel/data-lh(편집 UI 잔재) + cur/data-idx(빌드가 부여, 소스엔 없어야).
const cleanSection = (id) => {
  const s = document.getElementById(id); if (!s) return null;
  const c = s.cloneNode(true);
  c.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
  c.removeAttribute('contenteditable');
  c.querySelectorAll('.sel').forEach(e => e.classList.remove('sel')); c.classList.remove('sel');
  c.classList.remove('cur'); c.removeAttribute('data-idx');
  c.querySelectorAll('[data-lh]').forEach(e => e.removeAttribute('data-lh'));
  return c.outerHTML;
};

function decodeDataUri(v) {
  const m = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s.exec(v || '');
  if (!m) return null;
  return { ext: m[1] === 'jpeg' ? 'jpg' : m[1], buf: Buffer.from(m[2], 'base64') };
}
function resolveAssetPath(relSrc) {
  if (relSrc.startsWith('../assets/')) return path.join(ASSETS, relSrc.slice(10));
  if (relSrc.startsWith('../generated/')) return path.join(GEN, relSrc.slice(13));
  return null;
}
// 소스 파일에서 alt→에셋경로 매핑(매직지우개 base64 를 어느 에셋에 저장할지).
function sourceAssetMap(id) {
  const p = path.join(HTML, id + '.html'); const map = [];
  if (!fs.existsSync(p)) return map;
  const re = /<img\b[^>]*>/g, html = fs.readFileSync(p, 'utf8'); let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src = (/\bsrc="([^"]+)"/.exec(tag) || [])[1] || (/\bdata-src="([^"]+)"/.exec(tag) || [])[1] || '';
    const alt = (/\balt="([^"]*)"/.exec(tag) || [])[1] || '';
    if (/^\.\.\/(assets|generated)\//.test(src)) map.push({ alt, src });
  }
  return map;
}

// outerHTML 안의 img 를 정규화: (a) base64(매직지우개) → 에셋 추출·저장, (b) 최종적으로 src 하나만 남김(data-src 제거).
//   빌드가 src→data-src 로 다시 변환하므로 소스 컨벤션 = src 단일. data-src 를 남기면 빌드 후 data-src 중복.
function extractImages(id, outer, report) {
  const srcMap = sourceAssetMap(id);
  return outer.replace(/<img\b[^>]*>/g, (tag) => {
    const srcM = /\bsrc="([^"]*)"/.exec(tag), dsM = /\bdata-src="([^"]*)"/.exec(tag);
    const altM = /\balt="([^"]*)"/.exec(tag); const alt = altM ? altM[1] : '';
    const data = decodeDataUri(srcM && srcM[1]) || decodeDataUri(dsM && dsM[1]);
    let rel;
    if (data) {
      // 매직지우개 편집분 → 에셋으로 저장(원본 .orig 백업), src 는 에셋 경로.
      let target = srcMap.find(s => s.alt && s.alt === alt) || (srcMap.length === 1 ? srcMap[0] : null);
      rel = target ? target.src : `../assets/${id}-baked.${data.ext}`;
      const abs = resolveAssetPath(rel);
      if (abs) {
        const same = fs.existsSync(abs) && fs.readFileSync(abs).equals(data.buf);
        if (!same) {
          if (!DRY) {
            const orig = abs.replace(/(\.[^.]+)$/, '.orig$1');
            if (fs.existsSync(abs) && !fs.existsSync(orig)) { fs.copyFileSync(abs, orig); report.push(`    (원본 백업: ${path.basename(orig)})`); }
            fs.writeFileSync(abs, data.buf);
          }
          report.push(`  · 매직지우개 이미지 → ${rel} (${data.buf.length}b)${DRY ? ' [--dry]' : ' 저장'}`);
        } else report.push(`  · 이미지 ${rel}: 픽셀 동일 — 건너뜀`);
      }
    } else {
      // base64 아님 → 파일 경로 확정(src 우선, 없으면 data-src). 정규화만.
      rel = (srcM && !/^data:/.test(srcM[1])) ? srcM[1] : (dsM ? dsM[1] : null);
      if (!rel) return tag; // 경로 못 찾으면 원본 유지
    }
    // src 하나로 정규화: data-src 제거, src=rel.
    let t = tag.replace(/\s*\bdata-src="[^"]*"/, '');
    if (/\bsrc="/.test(t)) t = t.replace(/\bsrc="[^"]*"/, `src="${rel}"`);
    else t = t.replace(/<img\b/, `<img src="${rel}"`);
    return t;
  });
}

// 소스 html/<ID>.html 의 <section id="ID" ...>...</section> 을 새 outerHTML 로 교체.
function overwriteSection(id, outer) {
  const p = path.join(HTML, id + '.html');
  if (!fs.existsSync(p)) return `소스 없음: ${id}.html`;
  const src = fs.readFileSync(p, 'utf8');
  const re = new RegExp(`<section\\b[^>]*\\bid="${id}"[\\s\\S]*?<\\/section>`);
  if (!re.test(src)) return `<section id="${id}"> 못 찾음`;
  if (!DRY) fs.writeFileSync(p, src.replace(re, outer));
  return null;
}

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = b.contexts()[0];
  let live = null;
  for (const p of ctx.pages()) { if (p.url().includes('deck.html')) { live = p; break; } }
  if (!live) { console.log('NO_LIVE_DECK_TAB (deck.html 탭 없음)'); process.exit(1); }

  let edits = await live.evaluate(() => (window.__deckEdits ? window.__deckEdits() : null));
  if (edits === null) { console.log('⚠ window.__deckEdits 없음 — build-deck.js 재빌드 후 reload 필요(구버전 빌드).'); process.exit(3); }

  let ids = edits.map(e => e.id);
  if (FORCE_IDS.length) ids = FORCE_IDS;              // 강제 지정
  if (!ids.length) { console.log('편집된 페이지 없음 (undo 스택 전부 비어있음). 저장할 것 없음.'); process.exit(0); }

  console.log(`편집된 페이지 ${ids.length}개: ${ids.join(', ')}${DRY ? '  [--dry: 저장 안 함]' : ''}`);
  for (const id of ids) {
    const report = [];
    let outer = await live.evaluate(cleanSection, id);
    if (!outer) { console.log(`[${id}] 섹션 없음 — 건너뜀`); continue; }
    outer = extractImages(id, outer, report);
    const err = overwriteSection(id, outer);
    console.log(`[${id}] ${err ? '실패: ' + err : '소스 <section> 덮어쓰기' + (DRY ? ' (dry)' : ' 완료')}`);
    report.forEach(r => console.log(r));
  }
  console.log(`\n다음: node scripts/build-deck.js → deck-goto 로 확인. (에셋 미추적이면 .orig 백업이 유일 복구수단)`);
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
