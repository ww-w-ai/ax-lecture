// HTML 슬라이드 → 1920×1080 PNG 캡처.
// 사용: node shot-html.js [P04]   (인자 없으면 P04)
// 렌더링은 로컬 file://이라 ChatGPT 로그인이 불필요 → 공유 CDP Chrome(실창 2560×1440·DPR 0.75라
// viewport 제어 불가) 대신, 시스템 Chrome을 headless로 직접 띄워 viewport 1920×1080·DPR 1을 강제한다.
// (channel:'chrome' = 바이너리 다운로드 없이 설치된 Chrome 사용. ChatGPT 생성용 CDP와 별개 프로세스라 충돌 없음.)
const { chromium } = require('./_pw');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../html');
const page = process.argv[2] || 'P04';
const fp = `${ROOT}/${page}.html`;
const out = `${ROOT}/${page}-render.png`;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const p = await ctx.newPage();
  await p.goto('file://' + encodeURI(fp), { waitUntil: 'load', timeout: 25000 })
    .catch(e => console.log('goto:', e.message));

  // 표시용 레이아웃(.fit 고정·중앙정렬·scale)을 캡처용으로 중화: .slide를 좌상단 원본 1920×1080으로.
  await p.addStyleTag({ content: `
    html,body{background:#fff!important;margin:0!important;padding:0!important;}
    .fit{position:static!important;display:block!important;inset:auto!important;
         background:#fff!important;overflow:visible!important;place-items:initial!important;}
    .fit>.slide{transform:none!important;box-shadow:none!important;}
  `});

  // 폰트 + 일러스트 이미지 로드 대기 (빈 캡처 방지)
  await p.evaluate(async () => {
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    const imgs = [...document.images].map(img => img.complete ? null :
      new Promise(r => { img.onload = img.onerror = r; }));
    await Promise.all(imgs.filter(Boolean));
  }).catch(e => console.log('wait:', e.message));
  await p.waitForTimeout(400);

  // 고정 1920×1080 clip 캡처 (viewport·DPR이 결정론적이라 좌표가 HTML과 1:1)
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  console.log('SHOT done:', out);
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
