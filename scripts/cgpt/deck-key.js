// send a key to the deck tab in CDP Chrome. usage: node deck-key.js Home|End|ArrowRight|ArrowLeft
const { chromium } = require('./_pw');
const key = process.argv[2] || 'Home';
(async()=>{
  const b = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = b.contexts()[0];
  let page=null; for(const p of ctx.pages()){ if(p.url().includes('deck.html')) page=p; }
  if(!page){ console.log('no deck tab'); process.exit(1); }
  await page.bringToFront();
  await page.keyboard.press(key);
  await new Promise(r=>setTimeout(r,400));
  const c = await page.evaluate(()=>document.getElementById('counter')?.textContent||'?');
  console.log('pressed',key,'→ counter',c);
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
