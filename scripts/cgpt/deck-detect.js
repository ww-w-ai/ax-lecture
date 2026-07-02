// Detect live edits without touching the live tab: text line-breaks + image sizes + inline-style changes.
const { chromium } = require('./_pw');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const DECK = process.argv.find(a=>/^deck.*\.html$/.test(a)) || 'deck.html'; // 'deck.html'(1번) | 'deck-2.html'(2번)
const BASE = 'http://localhost:8765/html/' + DECK;
const grab = () => [...document.querySelectorAll('#track > .slide')].map(s => {
  const styled = {};
  [...s.querySelectorAll('*')].forEach(el => {
    const st = el.getAttribute('style') || '';
    const isImg = el.tagName === 'IMG';
    if (!st && !isImg) return;
    const cls = (el.className && String(el.className).trim().split(' ')[0]) || '';
    const key = el.tagName.toLowerCase() + (el.id?('#'+el.id):'') + (cls?('.'+cls):'') +
                (isImg ? '['+((el.getAttribute('src')||'').split('/').pop())+']' : '') +
                '~' + (el.innerText||'').replace(/\s+/g,' ').slice(0,16);
    styled[key] = { style: st, w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) };
  });
  return {
    id: s.id || '(img)',
    html: s.innerHTML,
    text: s.innerText.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').replace(/^\n+|\n+$/g,''),
    styled
  };
});
(async()=>{
  const b=await chromium.connectOverCDP('http://localhost:9333');
  const ctx=b.contexts()[0];
  let live=null; for(const p of ctx.pages()){ if(p.url().includes(DECK)) { live=p; break; } }
  const L = await live.evaluate(grab);
  const base = await ctx.newPage(); await base.goto(BASE,{waitUntil:'load'}); await sleep(900);
  const D = await base.evaluate(grab); await base.close(); await live.bringToFront();

  for(let k=0;k<Math.max(L.length,D.length);k++){
    const a=L[k]||{}, d=D[k]||{};
    if(a.html===d.html) continue;
    console.log('\n=== 슬라이드 '+(k+1)+' ('+a.id+') ===');
    if(a.text!==d.text){
      console.log(' [텍스트 줄바꿈 변화]');
      console.log('   before: '+JSON.stringify(d.text));
      console.log('   after : '+JSON.stringify(a.text));
    }
    // styled/size diffs
    const keys=new Set([...Object.keys(a.styled||{}),...Object.keys(d.styled||{})]);
    keys.forEach(key=>{
      const av=a.styled?.[key], dv=d.styled?.[key];
      if(!av||!dv){ console.log('   [요소 추가/삭제] '+key+' '+JSON.stringify(av||dv)); return; }
      if(av.style!==dv.style || av.w!==dv.w || av.h!==dv.h){
        console.log('   [스타일/크기] '+key);
        console.log('      before: style="'+dv.style+'" ('+dv.w+'×'+dv.h+')');
        console.log('      after : style="'+av.style+'" ('+av.w+'×'+av.h+')');
      }
    });
  }
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
