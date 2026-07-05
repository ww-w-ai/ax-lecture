// 라이브 편집 캡처 (reload 전 필수) — 임의 slide id (숫자·비숫자 모두, deck-save-all.js가 못 하는 Pcases/Ppillars 등).
// usage: node scripts/cgpt/read-live.js <SECTION_ID>   예: node scripts/cgpt/read-live.js P66  /  Pcases
// 출력: /tmp/deck-live-<ID>.html (탭 편집분, 정리됨) + /tmp/deck-base-<ID>.html (현재 소스 빌드본).
//   → 두 파일 diff 해서 유저 편집분만 골라 소스 html/<ID>.html 에 반영.
// 안전: 자기 base 탭만 열고 닫음(공유 CDP 안전). deck 탭은 안 건드림(reload 안 함).
const { chromium } = require('./_pw');
const fs = require('fs');
const HTML = require('path').resolve(__dirname, '../../html');
const BASE = 'file://' + encodeURI(HTML + '/deck.html');
const ID = process.argv[2];
if (!ID) { console.error('usage: node read-live.js <SECTION_ID>'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
// 페이지 컨텍스트에서 실행: E모드 편집 아티팩트(contenteditable/sel/data-lh) 제거 후 섹션 outerHTML 반환.
// Playwright evaluate 에 함수를 직접 전달(문자열+eval 아님 — 안전).
const clean = (id) => {
  const s = document.getElementById(id); if (!s) return null;
  const c = s.cloneNode(true);
  c.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
  c.removeAttribute('contenteditable');
  c.querySelectorAll('.sel').forEach(e => e.classList.remove('sel')); c.classList.remove('sel');
  c.querySelectorAll('[data-lh]').forEach(e => e.removeAttribute('data-lh'));
  return c.outerHTML;
};
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = b.contexts()[0];
  let live = null;
  for (const p of ctx.pages()) { if (p.url().includes('deck.html')) { live = p; break; } }
  if (!live) { console.log('NO_LIVE_DECK_TAB (deck.html 탭 없음)'); process.exit(1); }
  const liveHtml = await live.evaluate(clean, ID);
  const base = await ctx.newPage();
  await base.goto(BASE, { waitUntil: 'domcontentloaded' }); await sleep(700);
  const baseHtml = await base.evaluate(clean, ID);
  await base.close();
  fs.writeFileSync(`/tmp/deck-live-${ID}.html`, liveHtml || 'NULL');
  fs.writeFileSync(`/tmp/deck-base-${ID}.html`, baseHtml || 'NULL');
  console.log(ID, 'LIVE_LEN', (liveHtml || '').length, 'BASE_LEN', (baseHtml || '').length, 'IDENTICAL', liveHtml === baseHtml);
  // 매직지우개 감지: 라이브 img 의 src/data-src 가 base64 인라인이면 픽셀이 편집된 것(build-deck.js 728).
  //   diff 로는 긴 base64 라 놓치기 쉬움 → 여기서 명시 경고. 저장은 save-live-images.js 가 담당.
  const bakedCount = ((liveHtml || '').match(/(?:src|data-src)="data:image\//g) || []).length;
  if (bakedCount) {
    console.log(`⚠ 매직지우개 감지: base64 인라인 이미지 ${bakedCount}개 — reload 시 소실. 지금 저장:`);
    console.log(`   node scripts/cgpt/save-live-images.js ${ID}   (편집본 → 에셋 저장, 원본 .orig 백업)`);
  }
  console.log('diff: sed "s/></>\\\\n</g" /tmp/deck-base-' + ID + '.html > /tmp/b.txt; sed "s/></>\\\\n</g" /tmp/deck-live-' + ID + '.html > /tmp/l.txt; diff /tmp/b.txt /tmp/l.txt');
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
