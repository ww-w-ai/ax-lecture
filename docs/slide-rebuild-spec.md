# [설명] 슬라이드 HTML 재구성 스펙 (서브에이전트용)

목표: 완성본 이미지(`final/Pxx.png`)의 [설명] 페이지를 **디자인 시스템 HTML 슬라이드**로 재구성한다. 목적 = 크리스프(또렷)한 텍스트 + 원색 시스템 + 전 페이지 통일.

## 아키텍처 (마스터 ↔ 페이지 분리 — 반드시 준수)
- **마스터 = `html/components.css`** (수정 금지, 표준 소유): 제목·본문·푸터 위치/크기, `.s-*` 컴포넌트, 모드별 색.
- **페이지 = `html/Pxx.html`**: 그 페이지 고유만. 위치 override는 `<section>` 안 `<style>` 블록에 `#Pxx` 스코프로.
- **표준 앵커 (마스터가 줌 — 페이지에서 위치 다시 쓰지 말 것)**:
  - 제목 `.s-title`: x:120, y:120, 76px/88, weight700. (긴 제목만 `#Pxx .s-title{font-size:..}` 축소)
  - 본문 `.s-body`: x:120, y:300 시작, 불릿 간 gap 34. (폭만 `#Pxx .s-body{width:..}` override)
  - 본문 글자 `.s-bullet`: 36px, dot 첫 줄 center 자동.
  - 서브 `.s-subs`/`.s-sub`: 30px, 들여쓰기 48.
  - 푸터 `.s-footer`: 구분선 y:976. 페이지번호 = 2자리(예 `15`).
  - 마진: 좌 120 / 우 1800 (콘텐츠 1680). 우측 일러스트 존 x:972~1800.
- 색: 원색 — 빨강 `var(--c1)`, 파랑 `var(--c2)`, 골드 `var(--c3)`. 강조 빨강=`.acc`, 형광 하이라이트=`.hl`, 취소선=`.strike`, 약하게=`color:var(--muted)`.

## 템플릿 (P06.html / P04.html 그대로 복제해 시작)
```html
<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>Pxx — 제목</title><link rel="stylesheet" href="slides.css"></head>
<body><div class="fit">
  <section class="slide light" id="Pxx">
    <style>
      /* 페이지 고유 위치만 */
      #Pxx .s-illust{ right:..px; top:..px; width:..px; }
      #Pxx .s-body{ width:..px; }
    </style>
    <h1 class="s-title">제목</h1>
    <img class="s-illust" src="assets/Pxx-illust.png" alt="">   <!-- 일러스트 있을 때만 -->
    <div class="s-body">
      <div class="s-bullet"><span class="dot"></span><span class="btxt">…</span></div>
      …
      <div class="s-subs"><div class="s-sub"><span class="dash">–</span><span>…</span></div>…</div>  <!-- 보조줄 있을 때만 -->
    </div>
    <div class="s-footer"><span>주식회사 덥덥덥 · ww-w.ai</span><span class="s-pagenum">xx</span></div>
  </section>
</div></body></html>
```
- 강조 박스가 필요하면 `.s-qbox`(핵심질문형) 컴포넌트 참고(P06). 표/특수 레이아웃은 페이지 `<style>`에 직접.

## 일러스트 정책 (중요 — 깨끗한 소스 없으면 텍스트 중심으로)
1. `backgrounds/Pxx.png` 존재 → `python3 scripts/crop_illust.py backgrounds/Pxx.png html/assets/Pxx-illust.png --transparent` 로 크롭(투명배경). 위치는 우측 존.
2. 소스 없음 + `final/Pxx.png`의 일러스트가 **우측에 깔끔히 분리**돼 있으면 → 그 영역만 crop 시도(텍스트 안 섞이게). 애매하면 하지 말 것.
3. **일러스트를 깨끗이 못 구하면 → 일러스트 없이 텍스트 중심으로** 재구성(디자인 시스템은 텍스트만으로도 좋게 나옴). 억지 crop(텍스트 섞임) 금지.
4. 내용 = `강연-슬라이드-구성안.md`의 해당 `### Pxx` 섹션. 강사 메모(괄호 "강사 메모:")는 슬라이드에 넣지 말 것.
   → **구성안 본문은 그대로 복사 금지.** 밀도 상한(SSOT §2.5: 제목1 + 불릿3~5개 각1줄 + 선택 띠1 = ~40~60단어)으로 **증류**해서 넣는다. 문단·괄호부연·인용·서사는 슬라이드 금지 = 구두. 구성안 불릿(문단형)을 그대로 넣으면 과밀.

## 프로세스 (각 페이지)
1. `강연-슬라이드-구성안.md`에서 `### Pxx` 섹션 읽어 제목·본문 추출.
2. `final/Pxx.png` Read해서 현재 디자인·강조 위치·일러스트 유무 파악.
3. 일러스트 정책대로 자산 준비.
4. `html/Pxx.html` 작성(템플릿). 본문 폭은 일러스트 회피하게.
5. 렌더: `node scripts/cgpt/shot-html.js Pxx` → `html/Pxx-render.png` 를 Read해 검증.
6. 점검: 제목 64~76·본문 36 통일 / 잘림·넘침 없음 / 원색 / 푸터(에이전트 수지 · sooji.ai) 2자리 / 일러스트 안 잘림 / **★ 라이트 일러스트 배경 = 순수 흰 `#FFFFFF` (근흰색·아이보리 카드 금지 — 화면엔 안 보여도 인쇄 시 회색 카드로 렌더됨, design-system §6 강제사항). 의심되면 코너 픽셀 샘플링(≥243 근흰색이면 흰색화)**. 문제 있으면 페이지 `<style>` 좌표·폭 조정 후 재렌더.
7. 본문이 4줄 초과로 넘치면 폰트 줄이지 말고 줄 수를 줄이거나 본문 폭을 넓혀라(디자인시스템 §3.2). 정 안 되면 그대로 두고 보고.

## 산출
- `html/Pxx.html` (+ 필요시 `html/assets/Pxx-illust.png`).
- deck 조립은 메인이 `node scripts/build-deck.js`로 일괄. (서브에이전트는 deck.html 건드리지 말 것.)
- 최종 보고: 페이지별 (a) 재구성함/이미지유지 (b) 일러스트 처리(크롭/없음) (c) 특이사항.
