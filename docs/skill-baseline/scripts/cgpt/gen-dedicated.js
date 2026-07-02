// 전용 탭 단일 생성기 — 기존 탭 절대 안 닫음. 새 탭 1개에서만 navigate로 새 챗 열고 한 장씩.
// rate limit이면 즉시 재시도 대신 대기. 끝나면 전용 탭만 닫음.
const { chromium } = require('./_pw');
const fs = require('fs');
const PROJ = '/Users/taehyoungkim/Documents/덥덥덥/강연/ax-lecture';
const PERSONA=`${PROJ}/슬라이드-디자이너-페르소나.md`, DSYS=`${PROJ}/슬라이드-디자인-시스템.md`;
const LIGHT=`${PROJ}/AX 발표 - 라이트모드 디자인 시스템 가이드.png`, DARK=`${PROJ}/AX 발표 - 다크모드 디자인 시스템 가이드.png`;
const GUSUNGAN=`${PROJ}/강연-슬라이드-구성안.md`, GUIDE=`${PROJ}/이미지-제작-가이드.md`;
const ATTACH=[PERSONA,DSYS,LIGHT,DARK,GUSUNGAN,GUIDE];
const PAGES = (process.argv.slice(2).map(Number).filter(Boolean));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=m=>{ const s=`[${new Date().toISOString()}] ${m}`; console.log(s); fs.appendFileSync(`${__dirname}/gen-dedicated.log`, s+'\n'); };
const genSrcs=p=>p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>/estuary\/content|oaiusercontent/.test(i.src)&&i.naturalWidth>800&&/생성된 이미지|generated/i.test(i.alt||'')).map(i=>i.src)).catch(()=>[]);
const rateModal=p=>p.locator('[data-testid="modal-conversation-history-rate-limit"]').count().catch(()=>0);
async function dismiss(p){ if(await rateModal(p)){ for(const s of ['button:has-text("알겠습니다")','button:has-text("확인")','button:has-text("OK")']){ const b=p.locator(s).first(); if(await b.count().catch(()=>0)){ await b.click().catch(()=>{}); break; } } await sleep(800); } }
async function waitImage(p, prev){
  const start=Date.now(), deadline=start+5*60*1000; let sawGen=false;
  while(Date.now()<deadline){ await sleep(5000);
    if(await rateModal(p)) return {rate:true};
    let gen=0; try{ gen=await p.locator('[data-testid="stop-button"]').count(); }catch(e){ return {crash:true}; }
    if(gen) sawGen=true;
    const cur=await genSrcs(p); const fresh=cur.filter(s=>!prev.includes(s));
    if(fresh.length&&!gen&&sawGen) return {src:fresh[fresh.length-1]};
    if(fresh.length&&!gen&&Date.now()-start>40000) return {src:fresh[fresh.length-1]};
  }
  return {};
}
async function newChat(p){
  await p.goto('https://chatgpt.com/',{waitUntil:'domcontentloaded'}); await sleep(2500); await dismiss(p);
  const input=p.locator('input[type="file"]').first(); await input.waitFor({state:'attached',timeout:20000});
  await input.setInputFiles(ATTACH); await sleep(9000); log('  새 챗 + 첨부 6종');
}
(async()=>{
  const b=await chromium.connectOverCDP('http://127.0.0.1:9333'); const ctx=b.contexts()[0];
  const myPage=await ctx.newPage();   // 전용 탭 (기존 탭 안 닫음)
  log(`전용 탭 생성. 대상: [${PAGES.join(',')}]`);
  for(const n of PAGES){
    if(fs.existsSync(`${PROJ}/generated/P${n}.png`)){ log(`P${n} 이미 있음, skip`); continue; }
    let done=false;
    for(let att=1; att<=4 && !done; att++){
      try{
        await newChat(myPage);
        const prompt=fs.readFileSync(`${PROJ}/generated/prompts/P${n}.md`,'utf8');
        const prev=await genSrcs(myPage);
        const comp=myPage.locator('#prompt-textarea'); await comp.click();
        await myPage.keyboard.press('Meta+A').catch(()=>{}); await myPage.keyboard.press('Backspace').catch(()=>{}); await sleep(300);
        await myPage.keyboard.insertText(prompt); await sleep(1200);
        const send=myPage.locator('[data-testid="send-button"]'); await send.waitFor({state:'visible',timeout:20000}); await send.click();
        log(`P${n} 전송 (시도 ${att})`);
        const r=await waitImage(myPage, prev);
        if(r.rate){ log(`P${n} rate limit → 3분 대기 후 재시도`); await sleep(180000); continue; }
        if(r.crash){ log(`P${n} crash → 재시도`); await sleep(5000); continue; }
        if(!r.src){ log(`P${n} no image → 재시도`); continue; }
        const resp=await ctx.request.get(r.src); const buf=await resp.body();
        if(buf.length>80000){ fs.writeFileSync(`${PROJ}/generated/P${n}.png`,buf); log(`P${n} SAVED ${(buf.length/1024|0)}KB`); done=true; }
      }catch(e){ log(`P${n} ERROR ${e.message.slice(0,50)}`); await sleep(6000); }
    }
    if(!done) log(`P${n} 실패 (4시도)`);
    await sleep(15000); // 장 간 간격
  }
  await myPage.close().catch(()=>{});   // 전용 탭만 정리
  log('완료. 전용 탭 닫음. 다른 탭은 안 건드림.');
  await b.close();
})().catch(e=>{ log('FATAL '+e.message); process.exit(1); });
