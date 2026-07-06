// Build generated/prompts/P{n}.md for P30..P74 by merging 구성안 + 가이드 sections.
const fs = require('fs');
const path = require('path');
const PROJ = path.resolve(__dirname, '../..');
const gusungAn = fs.readFileSync(`${PROJ}/강연-슬라이드-구성안.md`, 'utf8');
const guide = fs.readFileSync(`${PROJ}/이미지-제작-가이드.md`, 'utf8');

// split into sections keyed by page number, on lines like "### P30 ..."
function sectionMap(text) {
  const lines = text.split('\n');
  const map = {};
  let cur = null, buf = [];
  const headRe = /^###\s+P(\d+)\b/;
  for (const ln of lines) {
    const m = ln.match(headRe);
    if (m) {
      if (cur !== null) map[cur] = buf.join('\n').trim();
      cur = parseInt(m[1], 10); buf = [ln];
    } else if (cur !== null) {
      buf.push(ln);
    }
  }
  if (cur !== null) map[cur] = buf.join('\n').trim();
  return map;
}

const gMap = sectionMap(gusungAn);
const guMap = sectionMap(guide);

const footerLight = (n) => `
**필수 — 푸터/페이지번호 (이 페이지는 라이트 콘텐츠 페이지):**
- 좌하단에 푸터 텍스트를 정확히 이 문자열로 넣으세요: \`주식회사 덥덥덥 · ww-w.ai\` (좌측 정렬, 화면 하단 가장자리에서 약 60px 위, 작은 muted 회색, 그 위에 얇은 구분선). 가짜 도메인 생성 절대 금지 — 도메인은 오직 ww-w.ai.
- 우하단에 현재 페이지 번호 \`${n}\`만 넣으세요 (우측 정렬, 하단, 작은 muted 회색). 전체 페이지 수(/56 등) 표기 금지.
- **페이지 번호는 오직 우하단 1곳에만.** 우상단·상단·중앙 등 다른 어떤 위치에도 페이지 번호를 절대 넣지 마세요.`;

const footerNone = () => `
**필수 — 이 페이지는 표지/divider/hero 계열 페이지입니다: 푸터·페이지번호·구분선을 모두 넣지 마세요 (시각 노이즈 제거, 디자인 규칙 §7).**`;

const header = (n, mode) => `# 슬라이드 P${n} 생성 프롬프트

다음은 'AI 시대의 바이브코딩과 에이전트 활용법' 강연의 ${n}페이지 슬라이드입니다. 첨부(또는 앞서 첨부)한 디자인 시스템(페르소나, 디자인 시스템 .md, 라이트/다크 모드 가이드 png)을 엄격히 준수하여 1920×1080(16:9) 슬라이드 이미지 1장을 생성해주세요.

**디자인 규칙 (첨부한 디자인 시스템 .md + 라이트/다크 가이드 png를 유일한 기준으로 엄격히 준수):**
- 배경·텍스트색·일러스트색·폰트 등 모든 색·타이포는 **첨부 디자인 시스템에 정의된 값을 정확히** 따른다. 가이드에 없는 임의 색 생성 금지.
- 방향(첨부 가이드와 동일): 배경은 순백, 텍스트는 강한 색(연한 회색·파스텔 틴트 금지), 일러스트·아이콘·도형은 쨍한 액센트 톤(파스텔·뮤트 금지), 폰트는 가이드 지정(한글 또렷).
- 스타일: flat 2.5D 에디토리얼 일러스트, 넉넉한 여백.${mode === 'nofooter' ? footerNone() : footerLight(n)}`;

const results = [];
for (let n = 30; n <= 74; n++) {
  const g = gMap[n], gu = guMap[n];
  if (!g && !gu) { results.push({ n, status: 'MISSING' }); continue; }
  const headLine0 = (gu || '').split('\n')[0] || '';
  const mode = /다크|divider|hero|표지|cover|포토|풀블리드/.test(headLine0) ? 'nofooter' : 'light';
  const body = `${header(n, mode)}

---
## [강연-슬라이드-구성안.md] 해당 페이지

${g || '(구성안 섹션 없음)'}

---
## [이미지-제작-가이드.md] 해당 페이지

${gu || '(가이드 섹션 없음)'}
`;
  fs.writeFileSync(`${PROJ}/generated/prompts/P${n}.md`, body);
  // classify type from guide heading
  const headLine = (gu || '').split('\n')[0] || '';
  let type = 'generate';
  if (/실화면 입력|스크린샷/.test(headLine)) type = 'screenshot-input';
  results.push({ n, status: 'OK', bytes: body.length, type, head: headLine.replace(/^###\s*/, '') });
}
console.log(JSON.stringify(results, null, 1));
