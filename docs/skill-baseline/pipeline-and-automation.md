# 파이프라인 + ChatGPT 자동화 — 슬라이드 생성 스킬 baseline

> HTML-first. ChatGPT는 일러스트/사진 타입에만. 스크립트 실체 = `scripts/`·`scripts/cgpt/`(이 baseline에 복사됨).
> 앵커값은 design-system-SSOT.md / components.css를 **참조**(복사 금지).

---

## 1. 페이지 분류 → 2트랙

| 타입 | 트랙 | 모드 | 아키타입(§5) |
|---|---|---|---|
| 표지 | ChatGPT(포토)+HTML 텍스트 | 포토+다크 | — |
| 챕터 divider | ChatGPT(다크)+HTML | 다크 | layout-divider |
| 이미지(풀블리드) | ChatGPT(포토) | 포토 | full-bleed |
| 도식·코드 | **순수 HTML/CSS/SVG** | 라이트/다크박스 | layout-diagram |
| 설명 | **HTML** + (일러스트만 ChatGPT) | 라이트 | layout-content |
| 소개 | **순수 HTML**(스크린샷 프레임) | 라이트 | layout-content |
| 강조·전환 | HTML | 라이트/다크 | quote / statement / bignum |

페이지 타입 ≠ 아키타입 (분리 매핑). 홀짝 페어 룰(강의 구성안): 홀수=이미지, 짝수=설명, divider=섹션 구분.

---

## 2. HTML 재구성 작전 (순수 HTML 트랙 — slide-rebuild-spec 정합본)

**아키텍처(마스터↔페이지 분리)**: 마스터 `components.css`(토큰·`.s-*`·`layout-*` 소유, 수정 금지), 페이지 `Pxx.html`(아키타입 선택 + 콘텐츠 + `#Pxx` 스코프 override만).

**템플릿** (`assets/Pxx.html.template` 참고, P04/P06 골격):
```html
<section class="slide light" id="Pxx">
  <style>#Pxx .s-illust{right:..;top:..;width:..} #Pxx .s-body{width:..}</style>
  <h1 class="s-title">제목</h1>
  <img class="s-illust" src="assets/Pxx-illust.png" alt="">   <!-- 일러스트 있을 때만 -->
  <div class="s-body">
    <div class="s-bullet"><span class="dot"></span><span class="btxt">…</span></div>
  </div>
  <div class="s-footer"><span>주식회사 덥덥덥 · ww-w.ai</span><span class="s-pagenum">xx</span></div>
</section>
```
- 마스터 링크: `components.css` (구 `slides.css` 아님 — slide-rebuild-spec 드리프트 수정됨).
- 앵커(제목 84 @120,120 / 본문 43 @120,300 / 푸터 y976)는 마스터가 소유 → 페이지에서 다시 쓰지 말 것. 폭·일러스트 위치만 override.

**일러스트 정책**(중요 — 지혜):
1. `backgrounds/Pxx.png` 있으면 → `crop_illust.py ... --transparent`로 크롭(투명배경), 우측 존.
2. 소스 없고 `final/Pxx.png`에 일러스트가 우측 분리돼 있으면 → 그 영역만 crop(텍스트 안 섞이게). 애매하면 금지.
3. **깨끗이 못 구하면 일러스트 없이 텍스트 중심**으로. 억지 crop(텍스트 섞임) 금지. 디자인 시스템은 텍스트만으로도 좋음.
4. 내용 = 구성안 `### Pxx` 섹션. 강사 메모("(강사 메모:)") 슬라이드에 넣지 말 것. → **구성안 본문 그대로 복사 금지, 밀도 상한(SSOT §2.5)으로 증류**(제목1+불릿3~5 각1줄+선택 띠1; 문단·인용·서사는 구두).

**프로세스(페이지별)**: 구성안 읽기 → `final/Pxx.png` 파악 → 자산 준비 → `Pxx.html` 작성 → `node scripts/cgpt/shot-html.js Pxx` 렌더 → `Pxx-render.png` Read 검증 → 좌표 조정 재렌더. 병렬 시 페이지별 파일 소유권 분리(충돌 없음), deck.html은 메인만.

**검증 체크**: 제목·본문 통일 / 잘림·넘침 없음 / 원색 / 푸터 2자리 / 일러스트 안 잘림. 넘치면 폰트 유지 + 줄 수·폭 조정.

---

## 3. ChatGPT 자동화 (에셋 트랙)

### 3.1 연결 (CDP — Playwright 직접 띄우면 Cloudflare 봇차단)

```
일반 Chrome --remote-debugging-port=9333 + 전용 영속 프로필(~/.cache/cgpt-cdp-profile)
  → connectOverCDP('http://localhost:9333')   # 사람이 로그인한 진짜 세션
_pw.js: playwright 바이너리 없이 npx 캐시에서 모듈 경로 해석(vmux 우회)
  → require('./_pw')의 chromium. 연결 클라이언트로만 쓰니 바이너리 불필요.
```

### 3.2 프롬프트 조립 (`build-prompts.js`)

- 구성안 + 이미지가이드의 `### Pxx` 병합 → `generated/prompts/Pxx.md` (P30~74). **구성안 본문은 밀도 상한(SSOT §2.5)으로 증류해 넣는다 — 문단형 원문을 그대로 프롬프트에 넣지 말 것(이중 스펙 랜드마인, 전 페이지 과밀 원인).**
- 자기완결(공통 프리픽스 참조 금지, 매 페이지 인라인). 모드 판별 → 일러스트 프리픽스 3변형 선택.
- **정합 필요**: 헤더 §44 "일러스트 쨍한 액센트/파스텔 금지" 문구 **삭제**(파스텔-only 원칙과 모순). 색 파라미터=파스텔 코랄만.

### 3.3 생성 전략 (`scripts/cgpt/`)

| 전략 | 동작 | 언제 |
|---|---|---|
| `loop.js` | 같은 챗 최대 7장 재사용, rate면 새 챗 | 대량 연속 |
| `gen-dedicated.js` | 전용 탭, 장마다 새 챗, rate면 즉시 새 챗 | 섞임 방지 |
| `gen-singlechat.js` | 전용 탭, 챗 1개, rate면 무요청 대기 후 재시도 | rate 심할 때/소수 |

### 3.4 CDP 안정 규칙 (MUST — 피로 배운 함정)

1. `browser.close()` 금지 → 다른 node 죽여 "target closed" 연쇄. `page.close()`만.
2. `ctx.pages()` 전체 닫기 금지 → 사용자 탭까지 날림. 새 탭 1개만, 끝나면 그 탭만 정리.
3. 단일 node 보장. 점검은 CDP 비접속(`pgrep`/`ls`만).
4. rate-limit = 모달이 클릭 막는 것 → 모달 존재로 감지+자동해제(`알겠습니다`/`확인`/`OK`). 빠른 재시도 금지, 무요청 대기.
5. 이미지 감지 = URL `estuary/content`|`oaiusercontent` + `naturalWidth>800` + alt "생성된 이미지". 완료 = 새이미지 ∧ 생성중아님 ∧ (생성봤거나 40초). 5분 타임아웃.
6. 이미지 검증 = 다운로드 바이트 > 80KB.
7. 크래시/closed → 새 챗 또는 Chrome 재시작(로그인은 프로필 보존).

### 3.5 첨부 정책

- 첫 챗: 페르소나 + 디자인시스템.md + 라이트/다크 가이드 png + 구성안 + 가이드(6파일).
- 연속: 디자인시스템.md만 재첨부(1·2·3번째 + 이후 5번마다 — 맥락 리프레시).
- 섞임/실패 → 새 챗.

### 3.6 회수 (재생성보다 우선)

이미 생성분은 히스토리에 있음. **토큰+API**(`/api/auth/session` accessToken 헤더) → 대화 JSON에서 페이지번호+이미지 asset pointer 회수(스크롤 불필요=크래시 없음). 재생성 전에 회수 먼저.

### 3.7 처리 (crop → HTML 합성)

- `crop_illust.py`: 생성 이미지 → bbox 자동 감지 + flood-fill 배경 투명화 → `assets/Pxx-illust.png`.
- bake-first 변형: 텍스트 포함 생성 → 한글 깨지면 텍스트만 제거(표준 영문 프롬프트) → 좌표 실측 → HTML 텍스트 복원.
- 합성: 페이지 HTML 우측 존/풀블리드에 일러스트, 텍스트는 마스터 컴포넌트.

---

## 4. deck 조립·편집·출력

- `build-deck.js`: Pxx.html → deck.html 조립(플레이어+편집기 일체). 수동 deck 편집 금지.
- 편집: E모드(드래그·스냅·더블클릭 텍스트) + 포맷 툴바 + 페이지별 무제한 undo/redo + Lucide.
- 저장: 라이브 편집은 DOM에만 → reload 전 캡처 필수. **소스 반영은 "저장" 지시 때만**.
  - **★ 캐노니컬 = `save-live-edits.js` (undo 기반, rule-executable).** 방식: ① `window.__deckEdits()`(build-deck.js 노출 — undo 스택 비지 않은 슬라이드 = 편집됨)로 **편집 페이지를 확정**(diff·아티팩트 필터링 불필요, 상세 히스토리 안 봄, 토큰 절약, 누락 0) → ② 각 페이지 **최종 상태(outerHTML)로 소스 `html/<ID>.html`의 `<section>`을 통째 덮어씀**(clean이 `contenteditable`/`sel`/`data-lh`/`cur`/`data-idx` 잔재만 제거, 위치·크롭·patch는 그대로) → ③ 매직지우개 base64 img는 에셋으로 추출(원본 `.orig` 백업), 소스 src는 에셋 경로. 사용: `node scripts/cgpt/save-live-edits.js [--dry] [ID…]`. reload 전 실행(reload=hist 소실).
  - **매직지우개(AI 이미지 편집)** = build-deck.js 686~728(ONNX 마스크), `toDataURL`로 `img.src`+`data-src`를 base64로 구움(line 728) → reload 시 소실. `save-live-edits.js`가 자동 추출·저장. base64 인라인 존재 = 매직지우개 썼다는 확실한 흔적.
  - 하위 도구(수동): `read-live.js <ID>`(단일 페이지 diff·base64 경고), `save-live-images.js <ID>`(이미지만), `deck-detect`→`deck-save-all`(숫자 id 일괄). 캐노니컬은 위 `save-live-edits.js`.
- **이미지 크롭(imgframe) 규율 (MUST — 사용자 지시 2026-07-06)**:
  1. **크롭 영역 주변에 다른 텍스트·이미지가 들어와도 OK** — 덱엔 덮개(`.patch`)와 매직지우개(ONNX)가 있어 후편집으로 지운다. 주변 텍스트 제외하려고 크롭을 타이트하게 조이지 말 것(핵심 일러가 잘리는 게 더 나쁨).
  2. **항상 상하좌우에 ~15% 여백을 숨겨두고 크롭** — imgframe(`overflow:hidden`) 안에서 `img`를 프레임보다 크게(각 변으로 ~15% 더 나가게) 배치해, 안 보이지만 숨겨진 여백을 남긴다 → 나중에 크롭 미세조정(팬/리빌) 여지. **예외**: 이미지 자체 끝(그 방향에 콘텐츠 없음)이면 프레임을 이미지 가장자리에 붙여도 OK.
  3. 함정: 좌상단 텍스트를 빼려고 **위를 자르면** 같은 높이의 **폰/피사체 상단도 잘린다**(제목=좌상단, 피사체=우측이 같은 y). → 위아래는 피사체 온전히 두고 **좌우 크롭 + 주변 텍스트는 덮개로**.
  - 원본 자산은 `generated/<Pxx>.png`(풀 슬라이드), `assets/<Pxx>-illust.png`는 이미 크롭된 파생본일 수 있음 → 안 잘린 원본이 필요하면 `generated/`를 imgframe로 크롭해 쓴다.
- 출력: `@media print`(Cmd+P=현재 1장) + `deck-pdf.js`(전체 벡터 PDF) + 글로벌 `~/.claude/scripts/html2pdf.cjs`.
- 편집 규율: 글로벌 룰 `live-edit-persistence-discipline`·`browser-extension-file-vs-http`.
