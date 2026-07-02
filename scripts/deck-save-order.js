// 라이브 덱에서 M-이동으로 재정렬한 페이지 순서를 build-deck.js의 SLIDES 배열에 확정 저장.
// 유저가 "저장"이라 말할 때만 실행. 절차: window.deckOrder()(순열) 읽기 → SLIDES 엔트리 라인 재정렬
// (챕터 구분 주석은 같은 위치 슬롯에 보존) → 파일 기록 → deck 재빌드(footer 번호는 위치기반 자동주입이라 자동 정정).
// usage: node scripts/deck-save-order.js [--dry]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('./cgpt/_pw');

const BUILD = path.join(__dirname, 'build-deck.js');
const DRY = process.argv.includes('--dry');

(async () => {
  // 1) 라이브 순열 읽기
  const b = await chromium.connectOverCDP('http://localhost:9333');
  const ctx = b.contexts()[0];
  let page = null;
  for (const p of ctx.pages()) { if (p.url().includes('deck.html')) { page = p; break; } }
  if (!page) { console.error('NO_DECK_TAB — deck.html 탭을 찾을 수 없음'); process.exit(1); }
  const perm = await page.evaluate(() => (window.deckOrder ? window.deckOrder() : null));
  if (!Array.isArray(perm)) { console.error('window.deckOrder() 없음 — 덱 재빌드 후 리로드했는지 확인'); process.exit(1); }

  // 2) build-deck.js에서 SLIDES 블록 파싱
  const src = fs.readFileSync(BUILD, 'utf8');
  const lines = src.split('\n');
  const start = lines.findIndex(l => /const SLIDES\s*=\s*\[/.test(l));
  if (start < 0) { console.error('SLIDES 선언을 못 찾음'); process.exit(1); }
  let end = -1;
  for (let k = start + 1; k < lines.length; k++) { if (/^\s*\];\s*$/.test(lines[k])) { end = k; break; } }
  if (end < 0) { console.error('SLIDES 종료 ]를 못 찾음'); process.exit(1); }

  const body = lines.slice(start + 1, end); // 배열 내부 라인들
  const entries = [];        // 엔트리 라인(순서 = 원래 data-idx)
  const dividers = [];       // {before: 앞선 엔트리 수, text: 주석/빈줄}
  for (const l of body) {
    if (/^\s*\{/.test(l)) entries.push(l);
    else dividers.push({ before: entries.length, text: l });
  }

  // 3) 검증: perm이 0..N-1의 순열인지
  const N = entries.length;
  const ok = perm.length === N && [...perm].sort((a, z) => a - z).every((v, k) => v === k);
  if (!ok) {
    console.error(`순열 불일치: SLIDES 엔트리 ${N}개 vs deckOrder ${perm.length}개(중복/누락). 저장 중단.`);
    process.exit(1);
  }

  // 변경 없으면 조용히 종료
  if (perm.every((v, k) => v === k)) { console.log('순서 변경 없음 — 저장 스킵.'); process.exit(0); }

  // 4) 재정렬 + 구분 주석 슬롯 보존
  const reordered = perm.map(k => entries[k]);
  const out = [];
  const divAt = new Map();
  for (const d of dividers) { if (!divAt.has(d.before)) divAt.set(d.before, []); divAt.get(d.before).push(d.text); }
  for (let k = 0; k <= N; k++) {
    if (divAt.has(k)) for (const t of divAt.get(k)) out.push(t);
    if (k < N) out.push(reordered[k]);
  }

  const newSrc = [...lines.slice(0, start + 1), ...out, ...lines.slice(end)].join('\n');

  // 이동 요약 (사람 확인용)
  const moved = perm.map((v, k) => ({ from: v, to: k })).filter(m => m.from !== m.to);
  console.log(`재정렬: ${moved.length}개 위치 변동. 예) idx ${moved[0].from} → 위치 ${moved[0].to + 1}`);

  if (DRY) { console.log('[--dry] 파일 미기록.'); process.exit(0); }

  // 5) 기록 + 재빌드
  fs.writeFileSync(BUILD, newSrc);
  console.log('build-deck.js SLIDES 재작성 완료.');
  const r = execFileSync('node', [BUILD], { cwd: path.join(__dirname, '..') }).toString().trim();
  console.log(r);
  process.exit(0);
})();
