# Slide Production Status

Status date: 2026-07-02

> **진실의 소스 = `scripts/build-deck.js`의 `SLIDES` 배열** (덱 구성·순서·제작방식의 단일 권위). 이 문서를 믿지 말고 `node scripts/build-deck.js`로 재빌드해 `html/deck.html`(현재 **78장**, P1~P78)로 재확인할 것. 라이브 편집은 리로드 전 캡처(라이브 편집 규율).

## 제작 방식 (legend)

- **photo/final** — `final/Pxx.png` 풀블리드 이미지(사진·통이미지). `{ img: '../final/..' }`.
- **HTML텍스트+배경** — HTML 텍스트 레이어 + `final/Pxx.png` 배경. `{ file, img: '../final/..' }`. (기초 설명 페이지)
- **HTML(순수/하이브리드)** — `html/Pxx.html`. 순수 HTML이거나, HTML 텍스트 + `assets/`의 일러스트 crop 하이브리드. `{ file }` (또는 `{ file, img: '../generated/..' }`).
- **baked 생성 이미지** — `generated/Pxx.png`를 그대로 풀블리드. **텍스트가 이미지에 구워져 있음**(crisp·디자인가이드 정합이 HTML만 못함 → 하이브리드 변환 후보). `{ img: '../generated/..' }`.
- **placeholder(MISSING)** — `generated/Pxx-placeholder.png`. 원 자료가 없어 미완.

## Current Matrix (덱 78장 실제 상태)

| Slide | 제작 방식 | 상태 |
|---|---|---|
| P01·P03·P07·P09 | photo 풀블리드(final) | done |
| P02 | HTML 챕터 divider | done |
| P04·P06 | HTML 설명(순백) | done |
| P05(+P05.5) | 애니메이션(final P05·P5_5) | done |
| P08·P10·P12–P27·P29 | HTML 텍스트 + final 배경 | done |
| P11 | photo divider(final) | done |
| P28 | 통이미지(final) | done |
| P30·P31 | HTML(챕터3 divider·하네스 타임라인) | done |
| P32 | HTML(bkit GitHub 스크린샷) | done |
| P33·P35·P36 | 하이브리드(HTML + 도식 crop) | done |
| P34 | 순수 HTML(matchRate 7축 채점) | done |
| P37 | 순수 HTML(개념② PRD 5부) | done |
| P38 | 하이브리드(개념③ 7-Layer QA · 아이콘 crop + HTML) | done |
| P39 | 완전 HTML(개념④ Trust range-bar 다이얼) | done |
| P40 | 하이브리드(개념⑤ 측정&안전벨트 · 게이지/iterate/칩 crop + HTML) | done |
| P41–P44 | 하이브리드(HTML + 도식 crop) | done |
| **P45–P51** | **baked 생성 이미지** | in-deck · 하이브리드 변환 후보 |
| P52 | HTML(bkit Quick Start README) | done |
| P53 | HTML(코깎노 스크린샷) | done |
| **P54–P56** | **baked 생성 이미지** | in-deck · 변환 후보 |
| P57–P59 | HTML(tene 스크린샷 ①②③) | done |
| **P60** | **placeholder — MISSING 자료** | 미완 |
| **P61–P75** | **baked 생성 이미지**(챕터4 수지) | in-deck · 변환 후보 |
| **P76·P77** | **placeholder — MISSING 자료** | 미완 |
| P78 | baked 생성 이미지(마무리) | in-deck |
| P79–P90 | 구성안/가이드에만 존재 · **덱(SLIDES) 미포함** | 미배치(Part3+마무리) |

## Outstanding Work (우선순위)

1. **placeholder 3장 채우기 — P60·P76·P77** (원 자료 필요: P60 챕터3 마무리, P76 실습, P77 tene 결). 자료 확보 후 슬라이드 제작.
2. **baked 생성 이미지 → 하이브리드/HTML 변환**(선택·품질 패스): P45–P51 · P54–P56 · P61–P75 · P78. 이유 = 텍스트가 이미지에 구워져 crisp·디자인가이드 정합이 낮음(P33~44·P38~40에서 검증된 방식대로 텍스트만 HTML로 교체). 대량이라 라운드로 분할.
3. **P79–P90 덱 배치 결정** — 현재 덱은 78장(P1~78, 챕터1~4). P79~90(Part3 + 마무리)은 구성안/가이드에만 있고 `SLIDES`에 없음. 진행 여부·범위 결정 필요(html/prompts 없음).

## 제작 도구 (참고)

- 덱 조립: `node scripts/build-deck.js` → `html/deck.html` (SLIDES 배열이 순서·표시번호).
- 슬라이드 단독 렌더 검증: `node scripts/cgpt/shot-html.js P<NN>` → `html/P<NN>-render.png` (라이브 덱 미접촉).
- 라이브 반영(9333 CDP): `node scripts/cgpt/deck-goto.js <N>` (리로드+점프 — **라이브 편집 있으면 먼저 캡처**).
- 이미지 생성(ChatGPT CDP): `node scripts/cgpt/gen-singlechat.js <NN...>` (프롬프트 = `generated/prompts/P<NN>.md`, 디자인시스템 6종 첨부).

## 문서 정합 (2026-07-02 기준)

- `강연-슬라이드-구성안.md`·`이미지-제작-가이드.md` — 챕터3 Sprint 개념(P36~40) 최신 모델 반영 완료(개념 넘버 ①~⑤, P40 iterate→3한계·③=PRD 정의 항목·S1 100%).
- `generated/prompts/P39.md` — OBSOLETE 표기(P39는 완전 HTML로 전환).
