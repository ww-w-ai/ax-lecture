// reload deck tab, navigate to a 1-based slide page, screenshot the live view.
// usage: node deck-goto.js 4 [reload]
const { chromium } = require('./_pw');
const HTML = '/Users/taehyoungkim/Documents/덥덥덥/강연/ax-lecture/html';
const target = parseInt(process.argv[2]||'1',10);
const doReload = process.argv[3] !== 'noreload';
const DECK = process.argv.find(a=>/^deck.*\.html$/.test(a)) || 'deck.html'; // 'deck.html'(1번) | 'deck-2.html'(2번)
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.connectOverCDP('http://localhost:9333');
  const ctx=b.contexts()[0];
  let page=null; for(const p of ctx.pages()){ if(p.url().includes(DECK)) page=p; }
  if(!page){ console.log('no deck tab'); process.exit(1); }
  await page.bringToFront();
  if(doReload){ await page.reload({waitUntil:'load'}); await sleep(700); }
  await page.keyboard.press('Home'); await sleep(250);
  const num = async()=>parseInt((await page.evaluate(()=>document.getElementById('counter')?.textContent||'1/1')).split('/')[0],10);
  let guard=0;
  while(await num() < target && guard++ < 80){ await page.keyboard.press('ArrowRight'); await sleep(120); }
  await sleep(400);
  const c = await page.evaluate(()=>document.getElementById('counter')?.textContent||'?');
  // capture the 1920x1080 slide region precisely from the live viewport via DOM screenshot of #viewport content
  // simplest: full-page screenshot then note; but better—render the current Pxx.html standalone is already separate.
  await page.screenshot({ path: HTML + '/_deck-view.png' });
  console.log('counter', c, '-> shot _deck-view.png');
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
