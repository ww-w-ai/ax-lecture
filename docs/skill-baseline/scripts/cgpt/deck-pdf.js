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
  await page.evaluate(() => document.body.classList.add('print-all')); // 전체 31장 모드(Cmd+P는 현재 1장만)
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await b.close();
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`PDF 완료 (${((Date.now() - t0) / 1000).toFixed(1)}s): ${out}  [${mb}MB]`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
