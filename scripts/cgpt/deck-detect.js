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
  if(!live){ console.log('✋ 라이브 '+DECK+' 탭을 못 찾음 — CDP 9333에 덱 탭이 열려 있는지 확인. (열린 탭: '+ctx.pages().map(p=>p.url().split('/').pop()).join(', ')+')'); process.exit(2); }
  const L = await live.evaluate(grab);
  const base = await ctx.newPage(); await base.goto(BASE,{waitUntil:'load'}); await sleep(900);
  const D = await base.evaluate(grab); await base.close(); await live.bringToFront();

  // 슬라이드 수 불일치 = 라이브(탭)와 소스(빌드)의 구조가 어긋남 → 리로드로 편집 소실됐거나 배열이 바뀐 신호.
  if(L.length !== D.length){
    console.log('⚠️  슬라이드 수 불일치 — 라이브 '+L.length+'장 vs 소스빌드 '+D.length+'장.');
    console.log('    (라이브 탭이 리로드돼 편집이 사라졌거나, SLIDES 배열이 재빌드로 바뀐 상태일 수 있음. 인덱스 어긋남 주의.)');
  }
  let diffCount=0;
  for(let k=0;k<Math.max(L.length,D.length);k++){
    const a=L[k]||{}, d=D[k]||{};
    if(a.html===d.html) continue;
    diffCount++;
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
  // 명시적 요약 — 빈 출력의 모호함(편집없음 vs 연결실패 vs 리로드소실) 제거.
  console.log('\n----------');
  if(diffCount===0){
    console.log('✅ 라이브 편집 없음 — 탭 DOM == 소스빌드('+DECK+'). 저장할 것 없음.');
    if(L.length===D.length) console.log('   (리로드했다면 미저장 편집은 이미 사라진 상태 — 소스가 곧 현재 화면.)');
  } else {
    console.log('📝 라이브 편집 '+diffCount+'개 슬라이드에서 감지됨 — 위 diff를 소스에 반영할 것. (imgframe = 크롭 프레임, 내부 img left/top = 크롭 오프셋)');
  }
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
