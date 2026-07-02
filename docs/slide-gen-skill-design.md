# 슬라이드 생성 스킬 설계 (cowork-gen-studio 완성) — 박제 / 구현 단일 입력

> 상태: ACTIVE-DESIGN (리뷰 대상). 이 문서가 스킬 구현의 단일 입력이다.
> 대상 스킬: `cowork-gen-studio` (ai-native-cowork 플러그인, 현재 SKILL.md 52줄·구현 비어있음).
> 레퍼런스 구현: ax-lecture 강연 덱 (이 스킬을 강의용으로 인스턴스화한 첫 사례).

---

## 0. 핵심 명제

> **생성 AI = 디자이너(일러스트·사진만), 텍스트/UI = 디자인 시스템 기반 HTML/CSS.**
> 일관성은 "고정 레이아웃"이 아니라 "토큰·미학"에서 나온다. 장르(강의/피칭)가 모든 기본값을 가른다.

스킬은 **범용**이다. 디자인 시스템·페이지 분류·프롬프트는 **파라미터화**하고, 생략 시 **현재 ax-lecture 로컬값으로 fallback**한다.

---

## 1. 장르 축 (최상위 파라미터)

| 축 | 강의용 (이 덱) | 피칭용 |
|---|---|---|
| 1순위 | 가독성 · 학습 | 임팩트 · 설득 |
| 텍스트 | 충분 (혼자 읽고 공부) | 최소 |
| 레이아웃 | 구조적 템플릿 우세 | 파격·다양 우세 |
| 인쇄 | MUST (푸터·페이지번호·고정 레이아웃) | 화면 우선 |
| 아키타입 다양성 | 절제 (단조 회피용 소수) | 풍부 |
| 일관성 출처 | 토큰 + 구조 | 토큰 + 미학 |

장르가 정하는 기본값: 가독성 임계(본문 최소 px), 텍스트 밀도, 인쇄 규칙, 푸터/페이지번호 ON/OFF, 아키타입 개수·파격도.

**이 덱 = 강의용.**

---

## 2. 파이프라인 (HTML-first, ChatGPT는 에셋만)

```
[기획]  구성안 · 이미지가이드 · 디자인시스템 · 페르소나
   │
[1. 디자인 시스템 잡기] (reference-first, 게이트)
   타겟 레퍼런스 1벌 → 토큰·아키타입 추출 → SSOT 1벌  (생략 시 로컬 fallback)
   │
[2. 페이지 분류 → 2트랙]
   ├─ 순수 HTML 트랙 (50~70%): 텍스트·도식(CSS/SVG)·표·코드·스크린샷·아이콘
   └─ ChatGPT 에셋 트랙 (30~50%): 일러스트·사진·드라마틱 divider
        프롬프트 조립 → CDP ChatGPT 생성 → crop → HTML 합성
   │
[3. deck 조립·편집·출력]
   build-deck → E모드 편집 → detect/save → PDF/인쇄
```

페이지 타입과 레이아웃 아키타입은 **분리**해 매핑한다 (한 [설명] 페이지가 거대숫자형일 수도, split일 수도).

---

## 3. 디자인 시스템 모델 (스킬 Phase 1)

방법론은 `my-design-system`에서 차용: **Phase 게이트 + "값이 채워진 테이블로 확인받기"(빈 테이블 금지, 제안값+근거) + 단일 SSOT 문서 + 재사용 시 읽고 적용.** 단 슬라이드 도메인으로 치환(앱의 컴포넌트/네비/폼/반응형/모션/z-index/elevation은 버림).

입력: **타겟 레퍼런스 1벌** (Dribbble/Behance/스톡 — 영감용 참고만, 라이선스 경계 준수: 토큰·패턴은 추출 OK, 특정 일러스트·고유 구도 재현 금지).

### 3.1 Foundation (슬라이드용 체크리스트 — 누락 방지)

**(a) 색 — 트라이어드 × 모드3종 × 2렌더**

트라이어드 = 역할로 정의: primary(따뜻한 강조) / secondary(찬 대비) / tertiary(골드).

| 역할 | 일러스트 렌더(파스텔, ChatGPT) | UI 렌더(쨍한 원색, HTML) — 로컬 fallback |
|---|---|---|
| primary | 코랄 `#D97757` | 빨강 `#E60012` |
| secondary | 틸 `#1F6E78` | 파랑 `#0B5FD9` |
| tertiary | 앰버 `#8F6410` (다크 `#E6A93C`) | 골드 `#E8920A` |

모드 3종 (배경 톤):

| 모드 | 배경 | 텍스트 | 언제 |
|---|---|---|---|
| 라이트 | `#FFFFFF` | `#1B1B1D`(생성 시 `#000`) | 짝수 설명 |
| 다크 | `#141417` | `#F4F4F1` | 표지·divider |
| 포토 | 사진+스크림 | `#FBFAF6` | 홀수 이미지 |

원칙: 모드 = 배경 톤일 뿐, 액센트·따뜻한 일러스트는 전 모드 공통. 다크는 흑백이 아니라 니어블랙 배경 + 밝게 보정한 액센트.

**(b) 타입 스케일** — 로컬 fallback = components.css 실제값 (제목 84px / 본문 43px / 서브 36px / 푸터 22px). ※ 디자인시스템.md의 64/36은 stale → §8 정합 대상.

**(c) 레이아웃 그리드** — 1920×1080, 마진 좌120/우1800(콘텐츠 1680), 12col(118/gutter24), baseline 12px, 분할 트랙(1/2: x120 w828 + x972 w828 / 3분할 / 4분할), 우측 일러스트 존 x972~1800.

**(d) 레이아웃 아키타입 라이브러리 — 장르로 스케일**

강의용 기본 세트:
- 콘텐츠형(1~2): 설명(제목+본문+우측 일러스트), 도식/표 중심
- 강조형(3~4, 리듬용): chapter divider, 거대 인용(quote), 핵심 한 문장(statement), 거대 숫자(bignum)

각 아키타입 = 마스터의 레이아웃 클래스(`layout-*`). 페이지는 아키타입 선택 + 콘텐츠 채움. 통일성=토큰 공유, 다양성=아키타입 선택.

**(e) 일러스트 스타일 (ChatGPT 프리픽스) — 모드별 3변형**

색 외엔 현재 그대로 유지(사용자 확정). ChatGPT엔 **파스텔 단일 톤만** 지시(원색/파스텔 분기 지시 금지 — 쨍한 원색은 HTML 재구성에서만 입힘).

- 라이트: `Flat 2.5D editorial illustration (Anthropic/Claude aesthetic), warm ivory base + coral #D97757 accent, soft simple shapes, generous whitespace, premium and restrained. NOT photorealistic, NO 3D render, NO isometric, NO glassmorphism, NO neon. no watermark, no garbled extra text, no fake logos. Strict 16:9 aspect ratio, 1920×1080 landscape — NOT 4:3, NOT square.`
- 다크(divider): `... near-black #141417~#0E0E11 background + warm coral #D97757 accent glints, cinematic, restrained ...`
- 포토: `Natural photorealistic photograph, realistic lighting and true-to-life colors (no color grading, no warm tone overlay, no filter), 16:9 1920×1080 full bleed, no watermark, no garbled text, no fake logos.`

절제 규칙(§182): 일러스트 액센트 기본=코랄, 틸·앰버는 **색이 의미를 나를 때만**(카테고리·비교·구분). 장식적 다색 남발 금지. 한 슬라이드 강조색 ≤3.

**(f) 푸터·페이지번호** (강의용 = ON, 인쇄용): 구분선 y:976 / 푸터 `주식회사 덥덥덥 · ww-w.ai` 좌하단 / 페이지번호 2자리 우하단 1곳만 / 도메인은 `ww-w.ai`만(임의 도메인 생성 금지) / 표지·divider·포토는 푸터 없음.

### 3.2 산출물

디자인 시스템 SSOT 1벌 (`docs/design-system.md` 또는 기존 `슬라이드-디자인-시스템.md` 정합본) + 마스터 CSS(`components.css`) 토큰. 재사용 시: 있으면 읽고 적용("결정은 이미 내려진 것").

---

## 4. 페이지 분류 → 2트랙 (스킬 Phase 2)

| 타입 | 콘텐츠 | 트랙 | 모드 |
|---|---|---|---|
| 표지 | 제목+대표이미지 | ChatGPT(포토)+HTML 텍스트 | 포토+다크 |
| 챕터 divider | 번호·제목+드라마틱 이미지 | ChatGPT(다크)+HTML | 다크 |
| 이미지(풀블리드) | 사진 | ChatGPT(포토) | 포토 |
| 도식·코드 | 다이어그램·코드블록 | **순수 HTML/CSS/SVG** | 라이트/다크박스 |
| 설명 | 제목·본문+액센트 일러스트 | **HTML** + (일러스트만 ChatGPT) | 라이트 |
| 소개 | 스크린샷 | **순수 HTML**(스크린샷 프레임) | 라이트 |

순수 HTML 재구성 작전 = `docs/slide-rebuild-spec.md` (단 §8 정합 후: 값 복사→마스터 참조). 일러스트 정책의 지혜 유지: **깨끗한 소스 못 구하면 억지 crop 금지, 텍스트 중심으로.** 본문 넘치면 폰트 줄이지 말고 줄 수/폭 조정.

---

## 5. ChatGPT 자동화 (일러스트/사진 포함 페이지 — 에셋 트랙)

CDP로 로그인된 실제 ChatGPT를 구동해 일러스트/사진을 생성한다. (Playwright 직접 띄우면 Cloudflare 봇차단 → 반드시 CDP.)

### 5.1 연결

```
일반 Chrome을 --remote-debugging-port=9333 + 전용 영속 프로필로 띄움
  → connectOverCDP('http://localhost:9333')  (사람이 로그인한 진짜 세션)
  → 전용 프로필(~/.cache/cgpt-cdp-profile)이라 로그인·확장 영속
_pw.js: playwright 바이너리 없이 npx 캐시에서 모듈 경로만 해석 (vmux 우회)
  → require('./_pw')의 chromium 사용. 연결 클라이언트로만 쓰니 바이너리 불필요.
```

### 5.2 프롬프트 조립 (build-prompts)

- 구성안 + 이미지가이드의 해당 `### Pxx` 섹션 병합 → 페이지별 자기완결 프롬프트.
- **자기완결 원칙**: 공통 프리픽스를 참조로 두지 말고 매 페이지에 전부 인라인(생성기가 기억 못 함).
- 모드 판별 → 일러스트 프리픽스 3변형 중 선택(§3.1e).
- **색은 파라미터 1개(파스텔 코랄)만**. build-prompts의 "일러스트 쨍한 액센트/파스텔 금지" 모순 문구 삭제(§8 정합).
- 강사 메모("(강사 메모:)") 슬라이드에 안 넣음.

### 5.3 생성 전략 (상황별 선택)

| 전략 | 동작 | 언제 |
|---|---|---|
| `loop` | 같은 챗 최대 7장 재사용(메모리), rate면 새 챗 | 대량 연속 |
| `gen-dedicated` | 전용 탭, 장마다 새 챗, rate면 즉시 새 챗 | 섞임 방지 |
| `gen-singlechat` | 전용 탭, 챗 1개 재사용, rate면 **무요청 대기 후** 재시도 | rate-limit 심할 때 / 소수 |

### 5.4 CDP 안정 규칙 (피로 배운 함정 — MUST)

1. **`browser.close()` 절대 금지** — 공유 CDP에서 다른 node를 죽여 "target closed" 연쇄. `page.close()`만.
2. **`ctx.pages()` 전체 닫기 금지** — 사용자 작업 탭까지 날림. 새 탭 1개만 만들어 그 안에서만, 끝나면 그 전용 탭만 정리.
3. **단일 node 보장** — 좀비 node 누적이 충돌 원인. 점검 시 CDP에 붙지 말고 `pgrep`/`ls`만(읽기 전용).
4. **rate-limit = 모달이 화면을 덮어 클릭을 막는 것** — 모달 존재로 감지 + 자동 해제(`알겠습니다`/`확인`/`OK`). 빠른 재시도는 한도를 더 두드림 → 무요청 대기.
5. **이미지 감지** = URL `estuary/content`|`oaiusercontent` + `naturalWidth>800` + alt "생성된 이미지". 완료조건 = 새 이미지 ∧ 생성중 아님 ∧ (생성 봤거나 40초 경과). 5분 타임아웃.
6. **이미지 검증** = 다운로드 바이트 > 80KB(썸네일/placeholder 거름).
7. **크래시/closed 복구** = 새 챗 또는 Chrome 재시작(로그인은 프로필에 보존).

### 5.5 첨부 정책

- 첫 챗: 디자인 시스템 전체(페르소나 + 디자인시스템.md + 라이트/다크 가이드 png + 구성안 + 가이드).
- 연속 챗: 디자인시스템.md만 재첨부(1·2·3번째 + 이후 5번마다 — 맥락 리프레시. LLM 중복 입력이 이행 정확도↑).
- 섞임/실패 시: 새 챗.

### 5.6 회수 (재생성 대신)

이미 생성한 이미지는 ChatGPT 히스토리에 있음. **토큰+API**(`/api/auth/session` accessToken을 헤더에) 로 대화 JSON에서 페이지번호+이미지 asset pointer 회수(스크롤 불필요=크래시 없음). 재생성보다 회수 우선.

### 5.7 처리 (crop → HTML 합성)

- `crop_illust.py`: 생성 이미지 → bbox 자동 감지 + flood-fill 배경 투명화 → `assets/Pxx-illust.png`.
- bake-first 변형: 텍스트 포함 생성 → 한글 깨지면 텍스트만 제거(표준 영문 프롬프트) → 좌표 실측 → HTML이 텍스트 복원.
- 합성: 페이지 HTML의 우측 존(또는 풀블리드)에 일러스트 배치, 텍스트는 마스터 컴포넌트.

---

## 6. deck 시스템 (스킬 Phase 3)

- **마스터↔페이지 분리**: 마스터 `components.css`(토큰 + `.s-*` 컴포넌트 + `layout-*` 아키타입), 페이지 `Pxx.html`(아키타입 선택 + 콘텐츠 + `#Pxx` 스코프 override만).
- **build-deck.js**: Pxx.html → deck.html 조립(플레이어 + 편집기 일체). 수동 deck 편집 금지, Pxx.html만.
- **편집기**: E모드(드래그·스냅라인·더블클릭 텍스트) + 포맷 툴바(볼드/색/크기/줄간격/정렬) + **페이지별 독립 무제한 undo/redo** + Lucide 아이콘.
- **저장 워크플로**: 라이브 편집은 DOM에만 존재 → reload 전 캡처 필수. **소스 반영은 사용자 "저장" 지시 때만**(자동 금지). detect(감지) → save-all(소스 반영) → git diff/소스 재로드(증명).
- **출력**: `@media print`(Cmd+P = 현재 1장만 = 빠름) + `deck-pdf.js`(전체 벡터 PDF) + 글로벌 `~/.claude/scripts/html2pdf.cjs`.

(편집 규율은 글로벌 룰 `live-edit-persistence-discipline`·`browser-extension-file-vs-http` 준수.)

---

## 7. 범용(스킬) vs 로컬(ax-lecture) 분리

| 범용 = cowork-gen-studio 스킬 | 로컬 = ax-lecture repo + 로컬 rules |
|---|---|
| 하이브리드 파이프라인·장르 축·방법론 | 이 강연 디자인 시스템 구체값(fallback) |
| 디자인 시스템 잡는 절차(reference-first·게이트) | 페이지 분류(홀짝 페어)·페이지별 프롬프트 |
| CDP 자동화 규칙·생성 전략·_pw 패턴 | 강연 특화 스크립트(check_slide_coverage·gen-timeline) → 로컬 rules |
| crop·bake-first·deck 편집·출력 | 구성안·이미지가이드·페르소나·핸드아웃 |
| 마스터 CSS 템플릿 + 아키타입 라이브러리 골격 | components.css 실제 토큰 |

스킬 구조(제안):
```
cowork-gen-studio/
  SKILL.md                  (3 Phase 워크플로 · 트리거 · 장르)
  references/
    design-system.md        (reference-first·토큰·모드·아키타입·일러스트 프리픽스)
    pipeline.md             (2트랙·페이지 분류·bake-first·crop)
    chatgpt-automation.md   (CDP 규칙·생성 전략·_pw·회수·첨부 정책)
    deck-system.md          (마스터/페이지·build-deck·편집·저장·출력)
  scripts/                  (범용판: _pw·build-deck·crop_illust·shot-html·deck-pdf·deck-detect·deck-save-all·gen-singlechat·build-prompts)
  assets/
    components.css.template (토큰 변수 + .s-* + layout-* 골격)
    Pxx.html.template
```

---

## 8. SSOT 정합 (스킬화 전제 — 먼저 처리)

세 문서가 서로 다른 진실을 말함. **최신 진실 = `components.css`**. 이 기준으로 수렴:

| 항목 | 진실(components.css) | 고칠 곳 |
|---|---|---|
| 색 | 원색(빨강/파랑/골드) | 디자인시스템.md(코랄→원색), build-prompts §44 모순 삭제 |
| 타입 | 제목 84 / 본문 43 | 디자인시스템.md(64/36), slide-rebuild-spec(76/36) |
| 마스터 CSS명 | `components.css` | slide-rebuild-spec 템플릿(`slides.css`→components.css) |
| 앵커 값 | 마스터가 소유 | slide-rebuild-spec: 값 복사 → **마스터 참조**로 |

원칙: 작전 스펙·프롬프트는 앵커값을 복사하지 말고 디자인 시스템 SSOT를 **참조**(계약 표면 동기화).

---

## 9. 잔재 정리

- **삭제**(안 쓰는 소스): `render_slides.py`(구형 PIL), `shot-live.js`·`deck-nav.js`·`deck-key.js`·`download-last.js`(상위호환 존재).
- **로컬 rules로**(범용 아님): `check_slide_coverage.js`(페이지 범위 하드코딩), `gen-timeline.js`(P31 전용).
- **범용 스킬로 승격**: §7 표의 범용 스크립트.

---

## 10. 리뷰 후 결정 대기

- 타겟 레퍼런스 1벌 선택(강의용 = 가독성+구조 레퍼런스). 사용자 후보 있으면 분석, 없으면 제안.
- UI 원색 다크 모드 보정값(현재 components.css는 다크 보정 없음 — 공통 둘지 보정 추가할지).
- 디자인 시스템 SSOT 저장 위치(기존 `슬라이드-디자인-시스템.md` 정합 vs 새 `docs/design-system.md`).
