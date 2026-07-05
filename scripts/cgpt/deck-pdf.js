// deck → PDF 빠른 내보내기 (headless Chrome — 브라우저 Cmd+P 미리보기보다 빠르고 안정적).
// usage:
//   node scripts/cgpt/deck-pdf.js                  → out/deck.pdf (1번 deck)
//   node scripts/cgpt/deck-pdf.js deck-2.html      → out/deck-2.pdf (2번 deck)
//   node scripts/cgpt/deck-pdf.js out/강연.pdf      → 출력 경로 지정
// 인쇄 CSS(@media print, 16:9 1장=1페이지)는 deck.html에 들어있어 그대로 적용된다.
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const PROJ = '/Users/taehyoungkim/Documents/덥덥덥/강연/ax-lecture';
const HTML = PROJ + '/html';

const deckFile = process.argv.find(a => /^deck.*\.html$/.test(a)) || 'deck.html';
const outArg = process.argv.find(a => /\.pdf$/.test(a));
const out = outArg
  ? (path.isAbsolute(outArg) ? outArg : path.join(PROJ, outArg))
  : path.join(PROJ, 'out', deckFile.replace(/\.html$/, '') + '.pdf');

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const t0 = Date.now();
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await b.newPage();
  await page.goto('file://' + encodeURI(HTML + '/' + deckFile), { waitUntil: 'load' });
  await page.waitForTimeout(800);            // 배경 이미지 디코드 여유
  // 전체 모드 + 애니메이션 프레임 확장. 접기 여부는 각 페이지의 data-print-collapse 속성이 결정(결정론적).
  const nPages = await page.evaluate(() => {
    document.body.classList.add('print-all');
    return window.__buildPrintPages ? window.__buildPrintPages() : 0;
  });
  // ★ 모든 이미지 강제 로드 + 디코드 완료 대기 (lazy-load data-src → PDF 뒷장 빈 이미지 방지)
  await page.evaluate(async () => {
    if (window.__loadAllImages) window.__loadAllImages();
    document.querySelectorAll('img[data-src]').forEach(img => { if (!img.getAttribute('src')) img.src = img.getAttribute('data-src'); });
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(imgs.map(img => (img.complete && img.naturalWidth)
      ? null
      : new Promise(res => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); })));
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(700);            // 디코드 여유
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await b.close();
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`PDF 완료 (${((Date.now() - t0) / 1000).toFixed(1)}s): ${out}  [${mb}MB, ${nPages}p]`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
