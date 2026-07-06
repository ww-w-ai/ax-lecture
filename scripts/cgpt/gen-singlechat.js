// 챗 1개 재사용 단일 생성기 — 기존 탭 안 닫음, 새 대화 최소화(1개), rate면 길게 대기.
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const PROJ = path.resolve(__dirname, '../..');
const ATTACH=[`${PROJ}/슬라이드-디자이너-페르소나.md`,`${PROJ}/슬라이드-디자인-시스템.md`,`${PROJ}/AX 발표 - 라이트모드 디자인 시스템 가이드.png`,`${PROJ}/AX 발표 - 다크모드 디자인 시스템 가이드.png`,`${PROJ}/강연-슬라이드-구성안.md`,`${PROJ}/이미지-제작-가이드.md`];
const PAGES=process.argv.slice(2).map(Number).filter(Boolean);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=m=>{ const s=`[${new Date().toISOString()}] ${m}`; console.log(s); fs.appendFileSync(`${__dirname}/gen-singlechat.log`,s+'\n'); };
const genSrcs=p=>p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>/estuary\/content|oaiusercontent/.test(i.src)&&i.naturalWidth>800&&/생성된 이미지|generated/i.test(i.alt||'')).map(i=>i.src)).catch(()=>[]);
const rateModal=p=>p.locator('[data-testid="modal-conversation-history-rate-limit"]').count().catch(()=>0);
async function dismiss(p){ for(const s of ['button:has-text("알겠습니다")','button:has-text("확인")']){ const b=p.locator(s).first(); if(await b.count().catch(()=>0)){ await b.click().catch(()=>{}); await sleep(500);} } }
async function waitRateClear(p, maxMin){ // 요청 없이 모달만 폴링하며 풀릴 때까지 대기
  const deadline=Date.now()+maxMin*60000;
  while(Date.now()<deadline){ if(!(await rateModal(p))) return true; await dismiss(p); log('  rate 활성 → 60s 무요청 대기'); await sleep(60000); }
  return !(await rateModal(p));
}
async function waitImage(p, prev){ const start=Date.now(), dl=start+5*60000; let saw=false;
  while(Date.now()<dl){ await sleep(5000);
    if(await rateModal(p)) return {rate:true};
    let gen=0; try{ gen=await p.locator('[data-testid="stop-button"]').count(); }catch(e){ return {crash:true}; }
    if(gen) saw=true; const cur=await genSrcs(p); const fr=cur.filter(s=>!prev.includes(s));
    if(fr.length&&!gen&&saw) return {src:fr[fr.length-1]};
    if(fr.length&&!gen&&Date.now()-start>40000) return {src:fr[fr.length-1]};
  } return {};
}
(async()=>{
  const b=await chromium.connectOverCDP('http://127.0.0.1:9333'); const ctx=b.contexts()[0];
  const p=await ctx.newPage(); // 전용 탭, 기존 탭 안 닫음
  log(`전용 탭. 대상 [${PAGES.join(',')}]`);
  await p.goto('https://chatgpt.com/',{waitUntil:'domcontentloaded'}); await sleep(2500);
  log('초기 rate 확인/대기(최대 15분)'); await waitRateClear(p, 15);
  // 챗 1개 + 첨부 (한 번만)
  const input=p.locator('input[type="file"]').first(); await input.waitFor({state:'attached',timeout:20000});
  await input.setInputFiles(ATTACH); await sleep(9000); log('첨부 6종 (챗 1개 재사용)');
  for(const n of PAGES){
    if(fs.existsSync(`${PROJ}/generated/P${n}.png`)){ log(`P${n} 있음 skip`); continue; }
    let done=false;
    for(let att=1; att<=5 && !done; att++){
      try{
        if(await rateModal(p)){ log(`P${n} 전송 전 rate → 대기`); await waitRateClear(p, 15); }
        const prompt=fs.readFileSync(`${PROJ}/generated/prompts/P${n}.md`,'utf8');
        const prev=await genSrcs(p);
        const comp=p.locator('#prompt-textarea'); await comp.click();
        await p.keyboard.press('Meta+A').catch(()=>{}); await p.keyboard.press('Backspace').catch(()=>{}); await sleep(300);
        await p.keyboard.insertText(prompt); await sleep(1200);
        const send=p.locator('[data-testid="send-button"]'); await send.waitFor({state:'visible',timeout:20000}); await send.click();
        log(`P${n} 전송(시도 ${att}, 같은 챗)`);
        const r=await waitImage(p, prev);
        if(r.rate){ log(`P${n} rate → 무요청 대기 후 같은 챗 재시도`); await waitRateClear(p, 15); continue; }
        if(r.crash||!r.src){ log(`P${n} ${r.crash?'crash':'no-img'} → 재시도`); await sleep(8000); continue; }
        const resp=await ctx.request.get(r.src); const buf=await resp.body();
        if(buf.length>80000){ fs.writeFileSync(`${PROJ}/generated/P${n}.png`,buf); log(`P${n} SAVED ${(buf.length/1024|0)}KB`); done=true; }
      }catch(e){ log(`P${n} ERR ${e.message.slice(0,50)}`); await sleep(8000); }
    }
    if(!done) log(`P${n} 실패`);
    await sleep(20000);
  }
  await p.close().catch(()=>{}); log('완료. 전용 탭만 닫음.');
  await b.close();
})().catch(e=>{ log('FATAL '+e.message); process.exit(1); });
