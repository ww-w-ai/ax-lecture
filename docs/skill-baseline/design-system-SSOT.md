# 디자인 시스템 SSOT (정합본) — 슬라이드 생성 스킬 baseline

> 이 문서 = 단일 진실. 값 출처 = `html/components.css`(실제 구현 = 최신 진실)를 정본으로,
> `슬라이드-디자인-시스템.md`(코랄·64/36 stale)·`slide-rebuild-spec.md`(76/36 stale)를 이쪽으로 수렴시킨다.
> 앞으로 앵커값은 이 문서/마스터 CSS를 **참조**하고 복사하지 않는다(드리프트 방지).
> 강의용 장르 기준. 스킬에선 파라미터화, 생략 시 아래 값이 fallback.

---

## 0. 원칙

- 일관성 = 토큰·미학 공유 (고정 레이아웃 아님). 다양성 = 아키타입 선택.
- 모드 = 배경 톤일 뿐, 액센트·따뜻한 일러스트는 전 모드 공통. 다크는 흑백 아님(니어블랙 배경).
- 생성 AI(ChatGPT)엔 **파스텔 일러스트 한 톤만** 지시. 쨍한 원색은 HTML 재구성(텍스트/UI)에서만.

---

## 1. 색 토큰 (components.css 실제값 = 정본)

### 1.1 UI 원색 트라이어드 (HTML 텍스트/UI — 쨍한 원색)

| 역할 | base | deep | soft | 별칭 |
|---|---|---|---|---|
| PRIMARY 빨강 | `#E60012` | `#C10010` | `#FCE3E6` | `--c1` / `--accent` |
| SECONDARY 파랑 | `#0B5FD9` | `#0A4DB0` | `#E3ECFB` | `--c2` / `--accent2` |
| TERTIARY 골드(앰버) | `#E8920A` | `#9C6200` | `#FBEBCF` | `--c3` / `--accent3` |

형광 하이라이트 `--highlight:#FFE15A` (노랑). 강조색 ≤3종/슬라이드.

### 1.2 배경·텍스트·메타 (모드별)

| 토큰 | 라이트(:root) | 다크(.slide.dark) | 포토(.slide.photo) |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#141417` | (이미지) |
| `--text` | `#000000` | `#F4F4F1` | `#F4F4F1` |
| `--secondary` | `#3A3A3A` | `#C8C8C4` | `#E8E8E4` |
| `--muted` | `#6E6D72` | `#8C8C89` | — |
| `--footer` | `#8B8A8E` | `#8C8C89` | — |
| `--rule` | `#E2E1DD` | `#2A2A2E` | — |

**드리프트 메모**: 현재 다크 모드는 `--c1/c2/c3`(원색)를 밝기 보정하지 **않음**(라이트와 동일). 다크 배경 대비가 필요하면 스킬 디자인 시스템 단계에서 다크용 원색 보정을 정하거나 "공통 유지"로 확정.

### 1.3 일러스트 파스텔 트라이어드 (ChatGPT 생성 — CSS 아님, 프롬프트용)

| 역할 | 파스텔(따뜻) |
|---|---|
| primary | 코랄 `#D97757` |
| secondary | 틸 `#1F6E78` |
| tertiary | 앰버 `#8F6410` (다크 `#E6A93C`) |

UI 원색과 **1:1 역할 대응**(코랄↔빨강, 틸↔파랑, 앰버↔골드). 기본 코랄, 틸·앰버는 **의미 단위만**(§6 절제).

---

## 2. 타입 스케일 (components.css 실제값)

| 역할 | 클래스 | size | line-height | weight | 비고 |
|---|---|---|---|---|---|
| 제목 | `.s-title` | **84px** | 97px | 700 | 긴 제목만 페이지에서 축소 override. (주석 76은 stale) |
| eyebrow | `.s-eyebrow` | 30px | — | 600 | color=accent |
| 서브타이틀 | `.s-subtitle` | (페이지 지정) | 1.4 | 500 | color=secondary |
| 본문 불릿 | `.s-bullet` | **43px** | 1.444 | 400 | dot 첫 줄 세로중앙 자동 |
| 서브 불릿 | `.s-sub` | 36px | 1.4 | 400 | 들여쓰기 48, color=secondary |
| 질문박스 | `.s-qbox-text` | 42px | 1.15 | 700 | |
| 칩 | `.chip` | 24px | 1 | 600 | |
| 푸터 | `.s-footer`/`.s-pagenum` | 22px | — | 500 | |

폰트: `--sans` = Pretendard / `--serif` = Noto Serif KR(표지·divider 번호·제목용).
규칙: 본문 넘치면 폰트 줄이지 말고 줄 수/폭 조정(디자인시스템 §3.2).

---

## 2.5 텍스트 밀도 상한 (온-슬라이드 = 앵커, 상세는 구두) — P1~P60 실측 기준

슬라이드는 "읽기 자료"가 아니라 **앵커**다. 발표자가 말로 풀고, 슬라이드엔 뼈대만 남긴다. 한 장의 온-슬라이드 텍스트 상한(P1~P60에서 실제로 잘 나온 밀도):

| 요소 | 상한 |
|---|---|
| 제목 | 1줄, ≤ ~18자 |
| 부제(선택) | 1줄, ≤ ~30자 |
| 본문 불릿 | **3~5개**, 각 **1줄 ≤ ~35자** |
| 키메시지 띠(선택) | 1줄, ≤ ~40자 |
| **합계(온-슬라이드)** | **한국어 ~40~60단어 / ~90~170자** |

- **문단형 산문 금지.** 불릿 하나가 한 문장을 넘기면 자른다. 괄호 부연·근거·서사·수치 출처는 슬라이드에 넣지 말고 **구두**로.
- **인용**은 예외적으로만(거대 인용 아키타입), 한 장 최대 2개. 도식·구조도 라벨 = "이름 + 3~5단어"(문장 금지).
- 초과하면 → (a) 구두 이관 또는 (b) 페이지 분할. **폰트 축소로 욱여넣기 금지**(§2 오버플로 규칙과 동일 정신).
- **⚠ 이중 스펙 랜드마인**: 기획 문서(`강연-슬라이드-구성안.md`)의 `### Pxx` 본문 불릿은 한 개가 40~90자 문단형이다 → **그대로 슬라이드/프롬프트에 옮기면 전 페이지 과밀.** 구성안은 *소스*일 뿐, 반드시 위 상한으로 **증류**(산문→짧은 불릿, 상세→구두)해서 넣는다.

---

## 3. 레이아웃 그리드

- 캔버스 1920×1080 (16:9). 마진 좌 120 / 우 1800 (콘텐츠 폭 1680). 상 96.
- 제목 앵커 `.s-title` x:120 y:120.
- 본문 `.s-body` x:120 y:300 시작, 폭 1100(일러스트 폭 따라 페이지 override), 불릿 간 gap 34.
- 서브 `.s-subs` 들여쓰기 48, gap 16. (`.s-subs1` = 위 불릿에 붙임 margin-top -22)
- dot 18px 원, 색=accent.
- 우측 일러스트 존 x:972~1800. `.s-illust` z-index 5(텍스트 위), 페이지에서 위치·크기 지정.
- 푸터 `.s-footer` left120 right120 top976 + border-top 1px rule, padding-top16.
- 분할 트랙: 1/2(x120 w828 + x972 w828, gutter24) / 3분할 / 4분할.

---

## 4. 컴포넌트 카탈로그 (components.css `.s-*` + 유틸)

- **텍스트**: `.s-title` `.s-eyebrow` `.s-subtitle` `.s-body`>`.s-bullet`(>`.dot`+`.btxt`) `.s-subs`>`.s-sub`(>`.dash`)
- **인라인 강조**: `.hl`(형광) `.acc`(빨강) `.acc2`(파랑) `.strike`(취소선)
- **질문박스**: `.s-qbox`(테두리 c1 + `.s-qbox-badge` ? 원형 + `.s-qbox-eyebrow` + `.s-qbox-text`)
- **일러스트/배경**: `.s-illust`(crop) `.s-bg`(풀블리드) `.s-cover`/`.s-overtext`(오타 덮어쓰기)
- **아이콘**: `.s-ic`(Lucide 인라인 SVG, currentColor 상속, stroke-width 2)
- **칩**: `.chip--key`(c1 배경) `.chip--sec`(c2 보더) `.chip--ter`(c3 보더) `.chip--neutral`
- **버튼**: `.btn--primary` `.btn--ghost` `.btn--text`
- **박스**: `.box--plain` `.box--emph`(c1-soft) `.box--quote`(c1 좌바)
- **KEY MESSAGE 띠**: `.keymsg`(c1-soft + `.tag`)
- **구분선**: `.rule` `.rule--dashed`
- **카테고리 유틸**: `.cat1/2/3` `.bg-cat1/2/3` `.soft-cat1/2/3`

주의(§0 마스터 CSS): 전역 `*{}` 리셋 금지(reveal 스케일 충돌). border-box는 `.slide *`에만.

---

## 5. 레이아웃 아키타입 라이브러리 (신규 — 스킬에서 구축)

현재 마스터엔 `.s-*` 컴포넌트만 있고 `layout-*` 아키타입은 없음(설명 페이지가 다 two-column으로 수렴 = 단조 원인). 강의용 절제 세트를 마스터에 추가:

| 아키타입 | 용도 | 톤 |
|---|---|---|
| `layout-content` | 설명(제목+본문+우측 일러스트) | 기본 콘텐츠 |
| `layout-diagram` | 도식·표 중심 | 콘텐츠 |
| `layout-divider` | 챕터 전환 | 강조(리듬) |
| `layout-quote` | 거대 인용 | 강조 |
| `layout-statement` | 핵심 한 문장 | 강조 |
| `layout-bignum` | 거대 숫자 | 강조 |

통일성=토큰 공유, 다양성=아키타입 선택. 콘텐츠 페이지는 가독성 우선, 강조 아키타입은 전환·리듬용.

---

## 6. 일러스트 프롬프트 (ChatGPT — 색 외 현행 유지, 모드별 3변형)

**파스텔 단일 톤만 지시**(원색/파스텔 분기 지시 금지). 자기완결(매 페이지 인라인).

- **라이트**: `Flat 2.5D editorial illustration (Anthropic/Claude aesthetic), PURE WHITE #FFFFFF backdrop (NOT ivory, NOT off-white, NO card/panel behind the content), coral #D97757 accent, soft simple shapes, generous whitespace, premium and restrained. NOT photorealistic, NO 3D render, NO isometric, NO glassmorphism, NO neon. no watermark, no garbled extra text, no fake logos. Strict 16:9 aspect ratio, 1920×1080 landscape — NOT 4:3, NOT square.`
- **다크(divider)**: `... near-black #141417~#0E0E11 background + warm coral #D97757 accent glints, cinematic, restrained ...` (나머지 동일)
- **포토**: `Natural photorealistic photograph, realistic lighting and true-to-life colors (no color grading, no warm tone overlay, no filter), 16:9 1920×1080 full bleed, no watermark, no garbled text, no fake logos.`

**★ 순수 흰 배경 강제 (MUST — 라이트 슬라이드에 얹는 일러스트/다이어그램 crop)**: 콘텐츠 뒤 **배경(백드롭)은 정확히 `#FFFFFF` 순수 흰색**(또는 투명)이어야 한다. `warm ivory`·`off-white`·근흰색(예: 249,247,244 / 254,254,254) **카드/패널 금지**. **이유**: 근흰색은 화면(흰 슬라이드)에선 안 보이지만 **Chrome 인쇄(PDF)가 회색 카드로 렌더**한다(실사례: bkit 다이어그램 P40-diagram 등 7장 회색 카드). 프롬프트에 `PURE WHITE #FFFFFF backdrop, no card panel` 명시. 콘텐츠 도형·아이콘은 코랄/따뜻해도 되나 **최외곽 배경만은 순수 흰**. (사후 보정: `min(RGB)≥243`&저채도 픽셀 → 255 흰색화, 인쇄 CSS `box-shadow:none` — 하지만 생성 단계 강제가 근본.)

**절제 규칙(§182)**: 액센트 기본=코랄. 틸·앰버는 색이 의미를 나를 때만(카테고리·비교·구분, 예: 캐싱=틸 "안정", P21 토큰=다색). 장식적 다색 남발·무지개·광택·네온 금지. 매트(무광). 조각 구분은 코랄 농담+아이보리 뉴트럴 우선.

일러스트·UI 내부 라벨(도식 글자)은 그래픽 일부 → 보존. 슬라이드 타이포(제목·본문·푸터)만 HTML이 소유.

---

## 7. 푸터·페이지번호 규칙 (강의용 = ON, 인쇄용)

- 라이트 콘텐츠 페이지만: 구분선 y:976 + 좌하단 `주식회사 덥덥덥 · ww-w.ai` + 우하단 페이지번호 **2자리 1곳만**.
- 도메인은 `ww-w.ai`만 (임의 도메인 생성 금지). 전체 페이지수(/56 등) 표기 금지.
- 표지·divider·포토 = 푸터·페이지번호·구분선 없음.

---

## 8. 파라미터화 (스킬용)

생략 시 위 값이 fallback. 스킬 디자인 시스템 단계에서 사용자가 바꿀 수 있는 것:
- UI 원색 트라이어드(§1.1) · 일러스트 파스텔 트라이어드(§1.3) · 다크 원색 보정 여부(§1.2 드리프트 메모)
- 타입 스케일 · 그리드 마진 · 아키타입 세트 크기(장르 스케일) · 푸터 문자열·도메인

reference-first: 타겟 1벌에서 색·타입·아키타입·리듬 추출 → 위 표를 채움(값+근거) → SSOT 확정.
