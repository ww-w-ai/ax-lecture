// Single consolidated, race-free generator for the 4-panel timeline (P31, P05-style photo).
const { chromium } = require('./_pw');
const fs = require('fs');
const PROJ = '/Users/taehyoungkim/Documents/덥덥덥/강연/ax-lecture';
const OUT = `${PROJ}/generated/P_timeline.png`;
const log = m => { const s=`[${new Date().toISOString()}] ${m}`; console.log(s); fs.appendFileSync(`${__dirname}/timeline.log`, s+'\n'); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));

const PROMPT = `첨부한 2장은 같은 발표 덱의 슬라이드입니다. 첫 번째(P05)는 스타일 기준(밝은 자연광 에디토리얼 사진, 4개 동일너비 세로 패널이 가는 흰 선으로 나뉜 16:9, 글자 전혀 없음). 두 번째(현재 타임라인)는 지금 만들 이미지의 직전 버전입니다.

이 스타일 그대로, 새 16:9(1920×1080) 이미지 1장을 만들어주세요. 주제는 'AI 코딩에서 도구를 다루는 4단계 기법'이고, 왼→오로 자율성이 커집니다. **두 번째 첨부의 3번·4번 패널(관제 콘솔, 미션컨트롤 관제실)은 거의 그대로 유지**하고, **1번·2번 패널만 아래 내용이 더 분명히 드러나도록 새로** 만들어주세요.

4개 패널(왼→오, 각각 사실적 에디토리얼 사진, 글자 없음):
1) "프롬프트 엔지니어링" = 사람에게 한 문장 지시를 정밀하게 다듬기. 한 사람이 노트북 AI 채팅 화면 앞에서 입력창에 **단 한 줄의 메시지**를 집중해서 또박또박 작성하는 클로즈업 — 화면엔 채팅 입력 UI 느낌(글자는 읽히지 않게 흐릿), 커서·말풍선 하나에 집중. '정밀한 한 줄'의 분위기.
2) "콘텍스트 엔지니어링" = 무엇을 넣고 뺄지 골라 모델에 공급하기. 한 사람이 책상의 여러 자료(문서·메모·코드 출력물·참고 카드)를 **골라서 노트북/컴퓨터에 넣어주는** 모습 — 자료 더미에서 필요한 것만 선별해 화면 쪽으로 건네는/올리는 동작. '맥락을 큐레이션해 공급'하는 느낌.
3) 두 번째 첨부의 3번 패널처럼: 여러 모니터의 관제 콘솔/콕핏에서 진행 중 프로세스를 다이얼·피드백으로 조종.
4) 두 번째 첨부의 4번 패널처럼: 큰 스크린과 아카이브 벽이 있는 미션컨트롤 관제실 — 상태·기억을 관리하며 총괄.

규칙: P05와 동일한 밝은 톤·통일 색감·패널 사이 가는 흰선. 이미지 안 글자/숫자/워터마크 절대 금지. 사실적 사진(플랫 일러스트 아님). 정확히 16:9, 4패널 동일너비.`;

// broad detector: large image hosted on ChatGPT generated-image hosts, ignore alt
async function bigGen(page){
  return page.evaluate(()=>Array.from(document.querySelectorAll('img'))
    .filter(i=>i.naturalWidth>800 && /oaiusercontent|estuary\/content|sdmntpr|files\.oaiusercontent|blob:/i.test(i.src))
    .map(i=>i.src)).catch(()=>[]);
}

(async()=>{
  const b = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = b.contexts()[0];
  for (const pg of ctx.pages()) await pg.close().catch(()=>{});
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil:'domcontentloaded' });
  await sleep(3500);
  const input = page.locator('input[type="file"]').first();
  await input.waitFor({state:'attached',timeout:20000});
  await input.setInputFiles([`${PROJ}/final/P05.png`, `${PROJ}/final/P31-bg.png`]);
  log('refs attached (P05 style + current timeline)'); await sleep(10000);
  const prev = await bigGen(page);
  const composer = page.locator('#prompt-textarea');
  await composer.click();
  await page.keyboard.insertText(PROMPT);
  await sleep(1500);
  const sendBtn = page.locator('[data-testid="send-button"]');
  await sendBtn.waitFor({state:'visible',timeout:20000});
  await sendBtn.click();
  await sleep(2000);
  log('sent, conv='+page.url());
  const start=Date.now(), deadline=start+6*60*1000; let sawGen=false;
  while(Date.now()<deadline){
    await sleep(5000);
    let g=0; try{ g=await page.locator('[data-testid="stop-button"]').count(); }catch(e){ log('crash '+e.message); break; }
    if(g) sawGen=true;
    const cur=(await bigGen(page)).filter(s=>!prev.includes(s));
    log(`gen=${g} newImgs=${cur.length}`);
    if(cur.length && !g && (sawGen || Date.now()-start>50000)){
      const resp=await ctx.request.get(cur[cur.length-1]);
      fs.writeFileSync(OUT, await resp.body());
      log('SAVED '+OUT+' '+fs.statSync(OUT).size+'B');
      process.exit(0);
    }
  }
  log('TIMEOUT'); process.exit(1);
})().catch(e=>{ log('FATAL '+(e.stack||e.message)); process.exit(1); });
