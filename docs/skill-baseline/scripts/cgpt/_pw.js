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
module.exports = resolvePw();
