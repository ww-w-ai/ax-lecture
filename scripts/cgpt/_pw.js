// playwright 모듈 위치 자동 해석 — 프로젝트에 미설치라 npx 캐시(~/.npm/_npx/*)에서 찾는다.
// connectOverCDP(로그인된 시스템 Chrome에 붙기)만 쓰므로 브라우저 바이너리는 불필요.
const fs = require('fs'), os = require('os'), path = require('path');
function resolvePw() {
  try { return require('playwright'); } catch (_) {}
  const base = path.join(os.homedir(), '.npm', '_npx');
  const dirs = fs.existsSync(base) ? fs.readdirSync(base) : [];
  for (const d of dirs) {
    const p = path.join(base, d, 'node_modules', 'playwright');
    try { return require(p); } catch (_) {}
  }
  throw new Error('playwright 모듈을 못 찾음. 한번 `npx playwright --version` 실행해 캐시를 채우세요.');
}
const pw = resolvePw();

// ─────────────────────────────────────────────────────────────────────────────
// CDP 안전장치 — hung-script 로 인한 Chrome 렌더러 CPU 폭주 방지 (근본 해결).
//
// 원인: connectOverCDP 는 브라우저에 라이브 소켓으로 붙는다. 스크립트가 일을 끝내고도
//   process.exit() 를 안 부르면 그 소켓이 node 이벤트루프를 살려둬 프로세스가 hang 하고,
//   매달린 채 물고 있는 Chrome 렌더러가 CPU 를 계속 잡아먹는다(실측: 렌더러 125%).
//
// 방어(연결 시 자동 주입 — 모든 cgpt 스크립트가 이 connectOverCDP 를 거치므로 스크립트
//   한 줄도 안 고치고 전부 보호된다):
//   1) disconnected → exit : 붙은 브라우저/탭이 닫히면(=CDP 소켓 드롭) 즉시 self-exit.
//      "탭 닫으면 자동 kill" — 폴링 대신 Playwright 의 disconnected 이벤트(이게 정석).
//   2) watchdog(최대 수명) : 브라우저는 살아있는데 스크립트가 exit 를 안 부른 채 매달린
//      경우를 잡는다. unref() 라 정상 종료는 절대 막지 않고(자기 혼자면 안 뜸), 소켓이
//      루프를 살려둔 hang 상태에서만 발화해 강제 종료한다. 기본 20분, CDP_MAX_MS 로 조정
//      (loop.js·gen-* 처럼 길게 도는 스크립트는 CDP_MAX_MS 를 크게 주거나 0=비활성).
//
// browser.close() 는 절대 부르지 않는다 — 공유 CDP 라 다른 탭까지 죽인다. 종료는 오직
// process.exit(소켓은 프로세스와 함께 사라짐)로만 한다.
// ─────────────────────────────────────────────────────────────────────────────
const CDP_MAX_MS = process.env.CDP_MAX_MS !== undefined ? Number(process.env.CDP_MAX_MS) : 20 * 60 * 1000;

function armCdpSafety(browser, { maxMs = CDP_MAX_MS } = {}) {
  // (1) 붙은 브라우저/탭이 사라지면 자동 종료.
  browser.on('disconnected', () => {
    console.error('[_pw] CDP disconnected (탭/브라우저 닫힘) — self-exit');
    process.exit(0);
  });
  // (2) 최대 수명 watchdog — hang 방어. unref 로 정상 종료는 안 막음.
  if (maxMs && maxMs > 0) {
    const t = setTimeout(() => {
      console.error(`[_pw] CDP watchdog fired after ${maxMs}ms (스크립트가 exit 안 함 — hang 방어) — force exit`);
      process.exit(1);
    }, maxMs);
    t.unref && t.unref();
  }
  return browser;
}

// connectOverCDP 를 감싸 연결 즉시 안전장치를 자동 부착 (기존 스크립트 무수정 보호).
const _origConnect = pw.chromium.connectOverCDP.bind(pw.chromium);
pw.chromium.connectOverCDP = async function connectOverCDPSafe(...args) {
  const browser = await _origConnect(...args);
  armCdpSafety(browser);
  return browser;
};

// 신규/즉석(node -e) 스크립트용 — 붙기 → 작업 → 무조건 종료 를 보장하는 러너.
//   require('./_pw').withCDP(async (browser) => { ...작업... }, { endpoint, timeoutMs })
// 작업이 끝나거나 던지거나 timeout 이면 반드시 process.exit 한다(browser.close 안 함).
pw.withCDP = async function withCDP(fn, opts = {}) {
  const endpoint = opts.endpoint || process.env.CDP_URL || 'http://127.0.0.1:9333';
  const timeoutMs = opts.timeoutMs || 60000;
  const guard = setTimeout(() => {
    console.error(`[_pw] withCDP timeout ${timeoutMs}ms — force exit`);
    process.exit(opts.timeoutCode !== undefined ? opts.timeoutCode : 1);
  }, timeoutMs);
  guard.unref && guard.unref();
  let code = 0;
  try {
    const browser = await pw.chromium.connectOverCDP(endpoint); // 위 patch 로 안전장치 자동
    await fn(browser);
  } catch (e) {
    console.error('[_pw] withCDP error:', (e && e.stack) || String(e));
    code = 1;
  } finally {
    clearTimeout(guard);
    process.exit(code); // 공유 브라우저라 close 대신 프로세스만 종료
  }
};

pw.armCdpSafety = armCdpSafety;
module.exports = pw;
