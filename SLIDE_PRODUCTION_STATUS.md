# Slide Production Status

Status date: 2026-07-06

> **2026-07-06 변경 요약**: 덱 77→**83장**. 수지 소개 섹션(deck 69~76) **재편** — 기존 "일곱 얼굴"(Ppillars 8기둥·P70 일곱얼굴·Pcombo 무한조합·P71~P75)을 창업자 스토리텔링 **8장**(Pcost·Pdaily·Pdash·Pdata·Papps·Pauto·Psafe·Pworld)으로 대체. 일러 6장 재활용(P68·P69·P72·P73·P74·P75-illust) + 대시보드 실스크린샷(Pdash-screen.png) + generated/P72.png 크롭. 푸터 전체 "주식회사 덥덥덥 · ww-w.ai"→**"에이전트 수지 · sooji.ai"**. 라이브편집 저장 캐노니컬=`scripts/cgpt/save-live-edits.js`(undo 기반), 매직지우개=base64 에셋 추출, imgframe 크롭 규율(상하좌우 +15% 숨김) — 상세 `docs/skill-baseline/pipeline-and-automation.md §4`. 옛 파일(Ppillars·Pcombo·P68~P75)은 SLIDES에서 빠졌으나 디스크에 잔존.

> **진실의 소스 = `scripts/build-deck.js`의 `SLIDES` 배열** (덱 구성·순서·제작방식의 단일 권위). 이 문서를 믿지 말고 `node scripts/build-deck.js`로 재빌드해 `html/deck.html`(현재 **83장**)로 재확인할 것. 라이브 편집은 리로드 전 캡처(라이브 편집 규율).
>
> **번호·순서 주의**: (1) 챕터3가 재정렬돼 **파일 P번호(예: P33.html) ≠ 덱 위치**가 됐다 — 순서·표시번호의 권위는 오직 `SLIDES` 배열. (2) footer 페이지 번호는 build가 **덱 위치로 자동 주입**(수동 s-pagenum 유지 불필요, 재정렬해도 재빌드로 자동 정정 · 이미지 baked 번호는 예외).

## 제작 방식 (legend)

- **photo/final** — `final/Pxx.png` 풀블리드 이미지(사진·통이미지). `{ img: '../final/..' }`.
- **HTML텍스트+배경** — HTML 텍스트 레이어 + `final/Pxx.png` 배경. `{ file, img: '../final/..' }`. (기초 설명 페이지)
- **HTML(순수/하이브리드)** — `html/Pxx.html`. 순수 HTML이거나, HTML 텍스트 + `assets/`의 일러스트 crop 하이브리드. `{ file }` (또는 `{ file, img: '../generated/..' }`).
- **baked 생성 이미지** — `generated/Pxx.png`를 그대로 풀블리드. **텍스트가 이미지에 구워져 있음**(crisp·디자인가이드 정합이 HTML만 못함 → 하이브리드 변환 후보). `{ img: '../generated/..' }`.
- **placeholder(MISSING)** — `generated/Pxx-placeholder.png`. 원 자료가 없어 미완.

## Current Matrix (덱 83장 실제 상태)

> 행 = 파일(제작방식) 기준. 덱 순서·표시번호는 `SLIDES`가 권위(파일 P번호 ≠ 덱 위치).

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
| **P33-arch** (bkit 시스템 아키텍쳐) | 하이브리드(4축 HTML + METHODOLOGY 일러스트 crop) | done · 원 **P50 '박제 개발론' 이동·재구성** |
| P33·P35·P36 | 하이브리드(HTML + 도식 crop) | done |
| P34 | 순수 HTML(matchRate 7축 채점) | done |
| P37 | 순수 HTML(개념② PRD 5부) | done |
| P38 | 하이브리드(개념③ 7-Layer QA · 아이콘 crop + HTML) | done |
| P39 | 완전 HTML(개념④ Trust range-bar 다이얼) | done |
| P40 | 하이브리드(개념⑤ 측정&안전벨트 · 게이지/iterate/칩 crop + HTML) | done |
| P41·P43·P44 | 하이브리드/HTML(P43 게이지 제거 · P44 Flutter Tier1·밴드 삭제) | done · **P42 삭제**(기획서 슬라이드 덱 제거) |
| **P45–P49·P51** | **baked 생성 이미지** | in-deck · 변환 후보 · **P50 → P33-arch로 이동**(P50.png 덱 제외) |
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
3. **P79–P90 덱 배치 결정** — 현재 덱은 **77장**(챕터1~4). P79~90(Part3 + 마무리)은 구성안/가이드에만 있고 `SLIDES`에 없음. 진행 여부·범위 결정 필요(html/prompts 없음).
4. **최종 renumber·문서 정합** — 덱 순서 안정화 후 `강연-슬라이드-구성안.md`·강사노트의 P번호 서술을 현 `SLIDES` 순서로 일괄 정합(재정렬·P33-arch 이동 반영).

## 제작 도구 (참고)

- 덱 조립: `node scripts/build-deck.js` → `html/deck.html` (SLIDES 배열이 순서·표시번호).
- 슬라이드 단독 렌더 검증: `node scripts/cgpt/shot-html.js P<NN>` → `html/P<NN>-render.png` (라이브 덱 미접촉).
- 라이브 반영(9333 CDP): `node scripts/cgpt/deck-goto.js <N>` (리로드+점프 — **라이브 편집 있으면 먼저 캡처**).
- 이미지 생성(ChatGPT CDP): `node scripts/cgpt/gen-singlechat.js <NN...>` (프롬프트 = `generated/prompts/P<NN>.md`, 디자인시스템 6종 첨부).
- **페이지 번호 자동**: build가 HTML 슬라이드 footer(`.s-pagenum`)를 **덱 위치로 자동 주입** — 수동 유지 불필요(재정렬해도 재빌드로 자동 정정 · 이미지 baked 번호는 예외).
- **페이지 재정렬**: 라이브 덱에서 **M** = 이동 모드(필름스트립 축소로 앞뒷장 노출 · ←/→ 재배치 · 번호 라이브 싱크 · Enter/M 적용 · Esc 취소). 확정 = `node scripts/deck-save-order.js`(라이브 순서 `window.deckOrder()` → `SLIDES` 재작성 + 재빌드).

## 문서 정합 (2026-07-03 기준)

- 이번 세션 변경: **P42 삭제** · **P50(박제 개발론) → P33 'bkit 시스템 아키텍쳐'(P33-arch.html) 이동·재구성** · P43(게이지 제거)·P44(Flutter Tier1·타이틀·밴드) · P40·P41 정리 · **챕터3 19장 재정렬**(SLIDES 확정) · 빌드 신기능(footer 자동번호 + M-재정렬 + `deck-save-order.js`).
- **미반영(의도적 defer)**: `강연-슬라이드-구성안.md`·`강사노트`·`이미지-제작-가이드.md`의 **P번호별 서술은 이번 재정렬·P33-arch 이동을 아직 반영 안 함** — 덱 순서가 아직 유동적이라 최종 안정화 후 일괄 renumber 예정. 그때까지 **순서·번호 권위 = `SLIDES` 배열**.
- (이전) `강연-슬라이드-구성안.md`·`이미지-제작-가이드.md` — 챕터3 Sprint 개념(P36~40) 최신 모델 반영 완료. `generated/prompts/P39.md` — OBSOLETE.
