// Download the most recent generated image to OUT.
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const OUT = process.env.OUT || path.resolve(__dirname, '../../generated/P30.png');
(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => /chatgpt\.com/.test(p.url())) || ctx.pages()[0];
  const src = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const gen = imgs.filter(i => /estuary\/content|oaiusercontent/i.test(i.src) && i.naturalWidth > 800 && /생성된 이미지|generated/i.test(i.alt));
    return gen.length ? gen[gen.length - 1].src : null;
  });
  if (!src) { console.log('NO_IMAGE'); process.exit(2); }
  const resp = await ctx.request.get(src);
  const buf = await resp.body();
  fs.writeFileSync(OUT, buf);
  console.log('SAVED', OUT, buf.length, 'bytes');
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
