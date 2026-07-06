// Clean diff: live deck tab (user edits) vs a freshly-loaded disk baseline tab. innerText both sides.
const { chromium } = require('./_pw');
const path = require('path');
const HTML = path.resolve(__dirname, '../../html');
const DECK = 'file://' + encodeURI(HTML + '/deck.html');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const perSlide = () => {
  return [...document.querySelectorAll('#track > .slide')].map(s => s.innerText.replace(/\s+/g,' ').trim());
};
(async()=>{
  const b=await chromium.connectOverCDP('http://localhost:9333');
  const ctx=b.contexts()[0];
  let live=null; for(const p of ctx.pages()){ if(p.url().includes('deck.html')) { live=p; break; } }
  if(!live){ console.log('no live deck tab'); process.exit(1); }
  const liveTexts = await live.evaluate(perSlide);
  // baseline in a separate tab (fresh disk load)
  const base = await ctx.newPage();
  await base.goto(DECK, { waitUntil:'load' }); await sleep(900);
  const baseTexts = await base.evaluate(perSlide);
  await base.close();
  await live.bringToFront();
  const changed=[];
  for(let k=0;k<Math.max(liveTexts.length,baseTexts.length);k++){
    if((liveTexts[k]||'')!==(baseTexts[k]||'')) changed.push({slide:k+1, before:(baseTexts[k]||''), after:(liveTexts[k]||'')});
  }
  console.log('CHANGED slides:', changed.length, changed.map(c=>c.slide).join(','));
  changed.forEach(c=>{ console.log('\n=== 슬라이드 '+c.slide+' ===\n  before: '+c.before.slice(0,500)+'\n  after : '+c.after.slice(0,500)); });
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
