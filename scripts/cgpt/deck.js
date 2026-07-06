// Interactive deck bridge over the CDP Chrome (port 9333).
// usage: node deck.js open | state | goto P31 | shot
const { chromium } = require('./_pw');
const path = require('path');
const HTML = path.resolve(__dirname, '../../html');
const DECK = 'file://' + encodeURI(HTML + '/deck.html');
const cmd = process.argv[2] || 'state';
const arg = process.argv[3];
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function deckTab(ctx){
  for (const p of ctx.pages()) { if (p.url().includes('deck.html')) return p; }
  return null;
}
(async()=>{
  const b = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = b.contexts()[0];
  let page = await deckTab(ctx);
  if (cmd === 'open' || !page) {
    if (!page) { page = await ctx.newPage(); }
    await page.goto(DECK, { waitUntil:'load' });
    await sleep(800);
    await page.bringToFront();
    console.log('deck open');
  }
  if (cmd === 'goto') {
    // navigate by pressing End or stepping; here jump via keyboard to a page index by label match
    await page.bringToFront();
    // press End to go last (P31 is last). For specific, send Home then ArrowRight N times.
    await page.keyboard.press('End');
    await sleep(500);
    console.log('jumped End (last slide)');
  }
  // report state
  const st = await page.evaluate(() => {
    const counter = document.getElementById('counter')?.textContent || '?';
    const slides = [...document.querySelectorAll('#track > .slide')];
    // figure current index from track transform
    const tx = document.getElementById('track')?.style.transform || '';
    const m = tx.match(/-?\d+/); const i = m ? Math.round(Math.abs(parseInt(m[0]))/1920) : 0;
    const cur = slides[i];
    const els = cur ? [...cur.children].map(c => ({
      tag:c.tagName.toLowerCase(),
      cls:(c.className&&String(c.className).trim().split(' ')[0])||'',
      id:c.id||'', x:Math.round(c.offsetLeft), y:Math.round(c.offsetTop), w:Math.round(c.offsetWidth), h:Math.round(c.offsetHeight),
      txt:(c.innerText||'').replace(/\s+/g,' ').slice(0,30)
    })) : [];
    return { counter, index:i, slideId:cur?.id||'(img)', els };
  });
  console.log(JSON.stringify(st, null, 1));
  if (cmd === 'shot') {
    await page.screenshot({ path: HTML + '/_deck-view.png' });
    console.log('shot -> _deck-view.png');
  }
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
