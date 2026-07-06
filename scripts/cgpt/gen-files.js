// 범용 단일-대화 연속 생성기 (병렬 안전판). gen-singlechat.js 로직 복제 + 개선:
//  - 인자 = 프롬프트 파일 스템(정수/문자 무관): `node gen-files.js P61b-craze P65 P68`
//    → 읽기 generated/prompts/<stem>.md, 저장 generated/<stem>.png
//  - `--no-attach` : 디자인시스템 6종 첨부 생략 (사진 모드 = photorealistic, 파스텔 첨부가 방해)
//  - b.close() 호출 안 함 (공유 CDP 병렬 안전 — 자기 탭 p.close()만). 2~3 프로세스 동시 실행 OK.
//  - 로그 = gen-files.<pid>.log (병렬 프로세스별 분리)
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const PROJ = path.resolve(__dirname, '../..');
const ATTACH=[`${PROJ}/슬라이드-디자이너-페르소나.md`,`${PROJ}/슬라이드-디자인-시스템.md`,`${PROJ}/AX 발표 - 라이트모드 디자인 시스템 가이드.png`,`${PROJ}/AX 발표 - 다크모드 디자인 시스템 가이드.png`,`${PROJ}/강연-슬라이드-구성안.md`,`${PROJ}/이미지-제작-가이드.md`];
const args = process.argv.slice(2);
const NO_ATTACH = args.includes('--no-attach');
const STEMS = args.filter(a=>!a.startsWith('--'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LOG=`${__dirname}/gen-files.${process.pid}.log`;
const log=m=>{ const s=`[${new Date().toISOString()}][${process.pid}] ${m}`; console.log(s); fs.appendFileSync(LOG,s+'\n'); };
const genSrcs=p=>p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>/estuary\/content|oaiusercontent/.test(i.src)&&i.naturalWidth>800&&/생성된 이미지|generated/i.test(i.alt||'')).map(i=>i.src)).catch(()=>[]);
const rateModal=p=>p.locator('[data-testid="modal-conversation-history-rate-limit"]').count().catch(()=>0);
async function dismiss(p){ for(const s of ['button:has-text("알겠습니다")','button:has-text("확인")']){ const b=p.locator(s).first(); if(await b.count().catch(()=>0)){ await b.click().catch(()=>{}); await sleep(500);} } }
async function waitRateClear(p, maxMin){ const deadline=Date.now()+maxMin*60000;
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
  if(!STEMS.length){ log('사용법: node gen-files.js [--no-attach] <stem> [<stem>...]'); process.exit(1); }
  const b=await chromium.connectOverCDP('http://127.0.0.1:9333'); const ctx=b.contexts()[0];
  const p=await ctx.newPage();
  log(`전용 탭. 대상 [${STEMS.join(',')}] attach=${!NO_ATTACH}`);
  await p.goto('https://chatgpt.com/',{waitUntil:'domcontentloaded'}); await sleep(2500);
  log('초기 rate 확인/대기(최대 15분)'); await waitRateClear(p, 15);
  if(!NO_ATTACH){
    const input=p.locator('input[type="file"]').first(); await input.waitFor({state:'attached',timeout:20000});
    await input.setInputFiles(ATTACH); await sleep(9000); log('첨부 6종 (챗 1개 재사용)');
  } else { log('첨부 생략 (사진 모드)'); }
  for(const stem of STEMS){
    const out=`${PROJ}/generated/${stem}.png`;
    if(fs.existsSync(out)){ log(`${stem} 있음 skip`); continue; }
    const promptPath=`${PROJ}/generated/prompts/${stem}.md`;
    if(!fs.existsSync(promptPath)){ log(`${stem} 프롬프트 없음 skip`); continue; }
    let done=false;
    for(let att=1; att<=5 && !done; att++){
      try{
        if(await rateModal(p)){ log(`${stem} 전송 전 rate → 대기`); await waitRateClear(p, 15); }
        const prompt=fs.readFileSync(promptPath,'utf8');
        const prev=await genSrcs(p);
        const comp=p.locator('#prompt-textarea'); await comp.click();
        await p.keyboard.press('Meta+A').catch(()=>{}); await p.keyboard.press('Backspace').catch(()=>{}); await sleep(300);
        await p.keyboard.insertText(prompt); await sleep(1200);
        const send=p.locator('[data-testid="send-button"]'); await send.waitFor({state:'visible',timeout:20000}); await send.click();
        log(`${stem} 전송(시도 ${att}, 같은 챗)`);
        const r=await waitImage(p, prev);
        if(r.rate){ log(`${stem} rate → 무요청 대기 후 재시도`); await waitRateClear(p, 15); continue; }
        if(r.crash||!r.src){ log(`${stem} ${r.crash?'crash':'no-img'} → 재시도`); await sleep(8000); continue; }
        const resp=await ctx.request.get(r.src); const buf=await resp.body();
        if(buf.length>80000){ fs.writeFileSync(out,buf); log(`${stem} SAVED ${(buf.length/1024|0)}KB`); done=true; }
        else { log(`${stem} 썸네일(<80KB) → 재시도`); await sleep(4000); }
      }catch(e){ log(`${stem} ERR ${e.message.slice(0,60)}`); await sleep(8000); }
    }
    if(!done) log(`${stem} 실패`);
    await sleep(20000);
  }
  await p.close().catch(()=>{}); log('완료. 자기 탭만 닫음(b.close 안 함=병렬 안전).');
})().catch(e=>{ log('FATAL '+e.message); process.exit(1); });
