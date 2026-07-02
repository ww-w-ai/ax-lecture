const { chromium } = require('./_pw');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const URL = process.argv[2] || 'http://localhost:8765/html/deck.html';
(async()=>{
  const b=await chromium.connectOverCDP('http://localhost:9333');
  const ctx=b.contexts()[0];
  let page=null; for(const p of ctx.pages()){ if(p.url().includes('deck.html')) page=p; }
  if(!page){ page=await ctx.newPage(); }
  await page.goto(URL,{waitUntil:'load'}); await sleep(900);
  // go to P4
  await page.keyboard.press('Home'); await sleep(200);
  for(let k=0;k<3;k++){ await page.keyboard.press('ArrowRight'); await sleep(120); }
  await page.bringToFront();
  const c=await page.evaluate(()=>document.getElementById('counter')?.textContent||'?');
  const imgOk=await page.evaluate(()=>{const i=document.querySelector('.slide img'); return i?{complete:i.complete,w:i.naturalWidth}:null;});
  console.log('now at', URL, '| counter', c, '| sample img', JSON.stringify(imgOk));
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
