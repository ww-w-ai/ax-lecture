// Same-chat continuous generation, with new-chat fallback on bleed/failure/crash.
// Attach policy: fresh chat = 4 files; continuation = design-system.md only (slides 1-3 every time, then every 5th).
const { chromium } = require('./_pw');
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const PROJ = path.resolve(__dirname, '../..');
const PERSONA = `${PROJ}/슬라이드-디자이너-페르소나.md`;
const DSYS = `${PROJ}/슬라이드-디자인-시스템.md`;
const LIGHT = `${PROJ}/AX 발표 - 라이트모드 디자인 시스템 가이드.png`;
const DARK = `${PROJ}/AX 발표 - 다크모드 디자인 시스템 가이드.png`;
const GUSUNGAN = `${PROJ}/강연-슬라이드-구성안.md`;  // 전체 구성안 (강연 흐름)
const GUIDE = `${PROJ}/이미지-제작-가이드.md`;        // 전체 제작 가이드 (강연 흐름)
// 첫 챗(새 챗 첫 장)에만 6개 전부 첨부: 디자인 4종 + 구성안·가이드 전체(전체 흐름 인지). 각 프롬프트는 해당 페이지 발췌만.
const ATTACH_FULL = [PERSONA, DSYS, LIGHT, DARK, GUSUNGAN, GUIDE];

const PAGES = [
  30, 31, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 50, 51, 52,
  57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 74,
];

const MAX_PER_CHAT = 7;     // memory reset: new chat after this many slides
const GAP_MS = 8000;        // Pro: no rate limit, small gap
const MAX_ATTEMPTS = 3;     // per-slide attempts before giving up

const log = (m) => { const s = `[${new Date().toISOString()}] ${m}`; console.log(s); fs.appendFileSync(`${DIR}/loop.log`, s + '\n'); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getGenSrcs(page) {
  return page.evaluate(() => {
    const out = [];
    Array.from(document.querySelectorAll('img'))
      .filter(i => /estuary\/content|oaiusercontent/i.test(i.src) && i.naturalWidth > 800 && /생성된 이미지|generated/i.test(i.alt))
      .forEach(i => { if (!out.includes(i.src)) out.push(i.src); });
    return out;
  }).catch(() => []);
}
async function rateModal(page) {
  return (await page.locator('[data-testid="modal-conversation-history-rate-limit"]').count().catch(() => 0)) > 0;
}
async function dismissModal(page) {
  if (await rateModal(page)) {
    for (const sel of ['button:has-text("알겠습니다")', 'button:has-text("확인")', 'button:has-text("OK")']) {
      const b = page.locator(sel).first();
      if (await b.count().catch(() => 0)) { await b.click().catch(() => {}); break; }
    }
    await sleep(1200);
  }
}

async function openFreshChat(ctx, oldPage) {
  if (oldPage) { await oldPage.close().catch(() => {}); }
  const page = await ctx.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await dismissModal(page);
  const input = page.locator('input[type="file"]').first();
  await input.waitFor({ state: 'attached', timeout: 20000 });
  await input.setInputFiles(ATTACH_FULL);
  await sleep(9000); // wait uploads to settle (4 files incl. 2 png ~3MB)
  log('fresh chat opened, 4 design files attached');
  return page;
}

// returns {src} success | {rate:true} | {crash:true} | {} timeout/no-image
async function waitImage(page, prevSet) {
  const start = Date.now();
  const deadline = start + 5 * 60 * 1000;
  let sawGen = false;
  while (Date.now() < deadline) {
    await sleep(5000);
    if (await rateModal(page)) return { rate: true };
    let generating = 0;
    try { generating = await page.locator('[data-testid="stop-button"]').count(); }
    catch (e) { return { crash: true }; }
    if (generating) sawGen = true;
    const cur = await getGenSrcs(page);
    const fresh = cur.filter(s => !prevSet.includes(s));
    if (fresh.length && !generating && sawGen) return { src: fresh[fresh.length - 1] };
    if (fresh.length && !generating && Date.now() - start > 40000) return { src: fresh[fresh.length - 1] };
  }
  return {};
}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = browser.contexts()[0];
  // close existing tabs for a clean start
  for (const pg of ctx.pages()) { await pg.close().catch(() => {}); }
  log(`loop start (same-chat continuous), ${PAGES.length} candidate slides`);

  const todo = PAGES.filter(n => !fs.existsSync(`${PROJ}/generated/P${n}.png`));
  log(`todo: ${todo.length} slides [${todo.join(',')}]`);

  let page = null, chatCount = 0;
  const attempts = {}, failed = [];
  let i = 0;
  while (i < todo.length) {
    const n = todo[i];
    attempts[n] = (attempts[n] || 0) + 1;
    if (attempts[n] > MAX_ATTEMPTS) { log(`P${n} give up after ${MAX_ATTEMPTS} attempts`); failed.push(n); i++; continue; }
    try {
      // ensure a chat (fresh if none / memory cap reached)
      if (page === null || chatCount >= MAX_PER_CHAT) { page = await openFreshChat(ctx, page); chatCount = 0; }
      chatCount++;
      // attach policy for continuation slides (fresh chat's 1st slide already has 4 files)
      if (chatCount > 1) {
        if (chatCount <= 3 || (chatCount - 3) % 5 === 0) {
          const input = page.locator('input[type="file"]').first();
          await input.setInputFiles([DSYS]);
          await sleep(4000);
          log(`P${n} re-attached design-system.md (chat slide ${chatCount})`);
        }
      }
      // prompt + send
      const prompt = fs.readFileSync(`${PROJ}/generated/prompts/P${n}.md`, 'utf8');
      const prevSet = await getGenSrcs(page);
      const composer = page.locator('#prompt-textarea');
      await composer.click();
      await page.keyboard.press('Meta+A').catch(() => {});
      await page.keyboard.press('Backspace').catch(() => {});
      await sleep(300);
      await page.keyboard.insertText(prompt);
      await sleep(1200);
      const sendBtn = page.locator('[data-testid="send-button"]');
      await sendBtn.waitFor({ state: 'visible', timeout: 20000 });
      await sendBtn.click();
      log(`P${n} sent (chat slide ${chatCount}, attempt ${attempts[n]})`);

      const r = await waitImage(page, prevSet);
      if (r.rate) { log(`P${n} rate modal → fresh chat, retry`); page = await openFreshChat(ctx, page); chatCount = 0; continue; }
      if (r.crash) { log(`P${n} page crash → fresh chat, retry`); try { page = await openFreshChat(ctx, null); } catch (e) { page = null; } chatCount = 0; continue; }
      if (!r.src) { log(`P${n} NO_IMAGE/bleed → fresh chat, retry`); page = await openFreshChat(ctx, page); chatCount = 0; continue; }
      // success
      const resp = await ctx.request.get(r.src);
      fs.writeFileSync(`${PROJ}/generated/P${n}.png`, await resp.body());
      log(`P${n} SAVED (chat slide ${chatCount})`);
      i++;
      await sleep(GAP_MS);
    } catch (e) {
      log(`P${n} ERROR ${e.message}`);
      if (/crash|closed|detached|Target/i.test(e.message)) { try { page = await openFreshChat(ctx, null); } catch (e2) { page = null; } chatCount = 0; }
      else { page = null; chatCount = 0; }
      await sleep(8000);
    }
  }
  const remaining = PAGES.filter(n => !fs.existsSync(`${PROJ}/generated/P${n}.png`));
  log(`loop done. failed=[${failed.join(',')}] remaining=${remaining.length} [${remaining.join(',')}]`);
})().catch(e => { log('LOOP_FATAL ' + (e.stack || e.message)); process.exit(1); });
