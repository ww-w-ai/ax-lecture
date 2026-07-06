// 변경된 모든(또는 지정) 슬라이드를 소스 Pxx.html에 일괄 저장.
// usage: node deck-save-all.js [--dry] [deck-2.html] [P04 P06 ...]
// 라이브 섹션(편집 아티팩트 정리)을 소스의 <section>과 교체.
// deck-2.html 인자를 주면 2번 deck 탭을 대상으로 저장(미지정 시 1번 deck.html).
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const PROJ = path.resolve(__dirname, '../..');
const HTML = PROJ + '/html';
const args = process.argv.slice(2);
const DECK = args.find(a=>/^deck.*\.html$/.test(a)) || 'deck.html'; // 'deck.html'(1번) | 'deck-2.html'(2번)
const BASE = 'file://' + encodeURI(HTML + '/' + DECK);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const dry = args.includes('--dry');
const only = args.filter(a => /^P\d+$/.test(a));

// 페이지에서 실행: 섹션 정리(편집 아티팩트 제거) 후 outerHTML/innerText 반환
const getData = `() => [...document.querySelectorAll('#track > .slide')].map(s=>{
  const c = s.cloneNode(true);
  c.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
  c.removeAttribute('contenteditable');
  c.querySelectorAll('.sel').forEach(e=>e.classList.remove('sel')); c.classList.remove('sel');
  c.querySelectorAll('[data-lh]').forEach(e=>e.removeAttribute('data-lh'));
  const f = c.querySelector('.s-footer'); if(f) f.removeAttribute('style'); // E모드 위치 아티팩트 제거
  return { id: s.id||'', html: c.outerHTML };
})`;

(async()=>{
  const b = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = b.contexts()[0];
  let live=null; for(const p of ctx.pages()){ if(p.url().includes(DECK)){ live=p; break; } }
  if(!live){ console.log('no live deck tab'); process.exit(1); }
  const L = await live.evaluate(eval(getData));
  const base = await ctx.newPage(); await base.goto(BASE,{waitUntil:'load'}); await sleep(900);
  const D = await base.evaluate(eval(getData)); await base.close(); await live.bringToFront();

  const saved=[], skipped=[], nochange=[];
  for(let k=0;k<L.length;k++){
    const id = L[k].id;
    if(!/^P\d+$/.test(id)) continue;               // 이미지 슬라이드 제외
    if(only.length && !only.includes(id)) continue; // 지정 모드면 그것만
    if(L[k].html === (D[k]&&D[k].html)) { nochange.push(id); continue; } // 변경 없음
    const file = HTML + '/' + id + '.html';
    if(!fs.existsSync(file)){ skipped.push(id+'(파일없음)'); continue; }
    const src = fs.readFileSync(file,'utf8');
    const newSrc = src.replace(/<section class="slide[\s\S]*?<\/section>/, L[k].html);
    if(newSrc === src){ skipped.push(id+'(섹션 매칭실패)'); continue; }
    if(!dry) fs.writeFileSync(file, newSrc);
    saved.push(id);
  }
  console.log((dry?'[DRY] ':'')+'저장 대상:', saved.join(', ')||'(없음)');
  if(skipped.length) console.log('스킵:', skipped.join(', '));
  process.exit(0);
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
