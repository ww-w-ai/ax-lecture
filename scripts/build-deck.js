// deck.html 자동 조립 — 개별 Pxx.html의 <section class="slide">를 추출해 deck 셸에 끼워넣는다.
// 수동 동기화 제거: 슬라이드는 Pxx.html에서 편집 → `node scripts/build-deck.js`로 deck 재생성.
// 사용: node scripts/build-deck.js
const fs = require('fs');
const path = require('path');
const HTML = path.join(__dirname, '..', 'html');

// 슬라이드 순서. file이 있으면 그 <section> 추출, 없으면 img 폴백. p05=애니메이션, img=완성본 이미지.
// file이 있으면 그 <section> 추출(HTML 재구성), 없으면 img 폴백(완성본 이미지).
// [설명] 페이지는 {file, img}로 — Pxx.html 빌드 전엔 이미지, 빌드되면 자동 교체.
const SLIDES = [
  { img: '../final/P01.png' },                       // P01 표지
  { file: 'P02.html' },                              // P02 챕터(부제 오타수정)
  { img: '../final/P03.png' },                       // P03 이미지
  { file: 'P04.html' },                              // P04 설명 ✓
  { p05: true },                                     // P05+P05.5 애니메이션
  { file: 'P06.html' },                              // P06 설명 ✓
  { img: '../final/P07.png' },                       // P07 이미지
  { file: 'P08.html', img: '../final/P08.png' },     // P08 설명
  { img: '../final/P09.png' },                       // P09 이미지
  { file: 'P10.html', img: '../final/P10.png' },     // P10 설명
  { img: '../final/P11.png' },                       // P11 챕터
  { file: 'P12.html', img: '../final/P12.png' },     // P12 설명
  { file: 'P13.html', img: '../final/P13.png' },     // P13 설명(도식+텍스트화)
  { file: 'P14.html', img: '../final/P14.png' },     // P14 설명(6단계 도식+텍스트화)
  { file: 'P15.html', img: '../final/P15.png' },     // P15 설명
  { file: 'P16.html', img: '../final/P16.png' },     // P16 설명
  { file: 'P17.html', img: '../final/P17.png' },     // P17 설명
  { file: 'P18.html', img: '../final/P18.png' },     // P18 설명 ★척추
  { file: 'P19.html', img: '../final/P19.png' },     // P19 도식+설명
  { file: 'P20.html', img: '../final/P20.png' },     // P20 설명
  { file: 'P21.html', img: '../final/P21.png' },     // P21 설명
  { file: 'P22.html', img: '../final/P22.png' },     // P22 설명(표)
  { file: 'P23.html', img: '../final/P23.png' },     // P23 설명
  { file: 'P24.html', img: '../final/P24.png' },     // P24 설명
  { file: 'P25.html', img: '../final/P25.png' },     // P25 설명(체크리스트)
  { file: 'P26.html', img: '../final/P26.png' },     // P26 설명
  { file: 'P27.html', img: '../final/P27.png' },     // P27 설명
  { img: '../final/P28.png' },                        // P28 정리(통이미지 — 텍스트 레이어 없이)
  { file: 'P29.html', img: '../final/P29.png' },     // P29 실습
  { file: 'P30.html' },                               // P30 챕터3 divider(다크) + 'bkit 이용 가이드' 텍스트(원 bkit 이미지 마스킹)
  { file: 'P31.html' },                               // P31 4분할 풀블리드 타임라인(하네스 진화)
  // ── 2부 챕터3 (만들기 자율주행 — bkit) P32~P60 ──
  { file: 'P32.html' },                               // P32 소개 스크린샷(bkit GitHub) ✓html
  { file: 'P33-arch.html' },                          // P33 bkit 시스템 아키텍쳐(원 P50 '박제 개발론' 이동) — 좌 4축 HTML + 우 METHODOLOGY 일러스트 crop ✓
  { file: 'P43.html' },                               // P43 설명(오버엔지니어링) — 하이브리드(제목·헤더 HTML + 좌우 이미지 crop) ✓
  { img: '../generated/P49.png' },                    // P49 도식(아키텍처)
  { img: '../generated/P51.png' },                    // P51 도식(pipeline)
  { file: 'P33.html' },                               // P34(위치) PDCA — 하이브리드(텍스트 HTML + 링 이미지 crop) ✓
  { file: 'P34.html' },                               // P34 신규(도식) — matchRate 7축 가중 채점 · 순수 HTML ✓
  { img: '../generated/P48.png' },                    // P48 도식(전문가 군단)
  { img: '../generated/P45.png' },                    // P45 도식(오케스트레이션)
  { img: '../generated/P46.png' },                    // P46 도식(3중 검증)
  { file: 'P35.html' },                               // P35 도식(PDCA 사례) — 하이브리드(제목·결론 HTML + 4카드 이미지 crop) ✓
  { img: '../generated/P47.png' },                    // P47 설명(무인 검증)
  { file: 'P36.html' },                               // P36 도식(Sprint ①) — 하이브리드(텍스트 HTML + Sprint 컨테이너 이미지 crop) ✓
  { file: 'P37.html' },                               // P37 개념② — PRD 5부 구조 · 순수 HTML ✓
  { file: 'P38.html' },                               // P38 개념③ — 7-Layer dataFlow QA · 하이브리드(아이콘 crop + HTML) ✓
  { file: 'P39.html' },                               // P39 개념④ — Sprint 단계 × Trust · 무인범위 다이얼 · 완전 HTML(CSS 바/점/점선) ✓
  { file: 'P40.html' },                               // P40 개념⑤ — 측정 & 안전벨트 · 하이브리드(게이지/iterate/칩 crop + HTML 제목·헤더·resume·메시지) ✓
  { file: 'P41.html' },                               // P41 사례 — 자체 HTML(요약명령+컨테이너 crop + 마스터플랜 문서) ✓
  { file: 'P44.html', img: '../generated/P44.png' },  // P44 도식(프레임워크) — HTML 재현(로고만 이미지) ✓
  { file: 'P53.html' },                               // P53 소개 스크린샷(코깎노) ✓html
  { file: 'P52.html' },                               // P52 🔧실습 — bkit Quick Start (README) ✓html
  { img: '../generated/P54.png' },                    // P54 설명(커스텀 가이드)
  { img: '../generated/P55.png' },                    // P55 설명(ai-native-cowork ①)
  { img: '../generated/P56.png' },                    // P56 설명(ai-native-cowork ②)
  { file: 'P57.html' },                               // P57 소개 스크린샷(tene ①) ✓html
  { file: 'P58.html' },                               // P58 소개 스크린샷(tene ②) ✓html
  { file: 'P59.html' },                               // P59 소개 스크린샷(tene ③) ✓html
  { img: '../generated/P60-placeholder.png' },        // P60 설명 마무리 [MISSING 자료]
  // ── 2부 챕터4 (운영 자율주행 — 수지) P61~P78 ──
  { img: '../generated/P61.png' },                    // P61 챕터4 divider(다크)
  { img: '../generated/P62.png' },                    // P62 설명(隨智)
  { img: '../generated/P63.png' },                    // P63 설명(나만의 자비스)
  { img: '../generated/P64.png' },                    // P64 설명(데이터 주권)
  { img: '../generated/P65.png' },                    // P65 도식(5모드)
  { img: '../generated/P66.png' },                    // P66 도식(3층 세계관)
  { img: '../generated/P67.png' },                    // P67 도식(지식 사서)
  { img: '../generated/P68.png' },                    // P68 도식(앱스토어)
  { img: '../generated/P69.png' },                    // P69 도식(시간 비서)
  { img: '../generated/P70.png' },                    // P70 도식(편재성)
  { img: '../generated/P71.png' },                    // P71 도식(페르소나 진화)
  { img: '../generated/P72.png' },                    // P72 설명(위임)
  { img: '../generated/P73.png' },                    // P73 도식(하루 사례)
  { img: '../generated/P74.png' },                    // P74 도식(리서치 위임)
  { img: '../generated/P75.png' },                    // P75 설명(예약 운영)
  { img: '../generated/P76-placeholder.png' },        // P76 🔧실습 [MISSING 자료]
  { img: '../generated/P77-placeholder.png' },        // P77 소개(결: tene) [MISSING 자료]
  { img: '../generated/P78.png' },                    // P78 설명(마무리)
];

function extractSection(file) {
  const full = path.join(HTML, file);
  if (!fs.existsSync(full)) return null;
  const html = fs.readFileSync(full, 'utf8');
  const m = html.match(/<section class="slide[^"]*"[\s\S]*?<\/section>/);
  if (!m) throw new Error(`no <section class="slide"> in ${file}`);
  return m[0];
}

function slideMarkup(s, idx) {
  // footer 페이지 번호 = 덱 위치(1-based)로 자동 주입. 개별 Pxx.html의 하드코딩 s-pagenum은 무시하고 덮어씀.
  // (이미지 슬라이드는 baked 번호라 대상 아님 — 무시.)
  const pageNo = idx + 1;
  if (s.p05) {
    return `      <!-- P05 (애니메이션: 전부 컬러 → [→] 좌측 흑백 + 라벨 크로스페이드) -->
      <section data-idx="${idx}" class="slide">
        <img class="s-bg" src="../final/P05.png" alt="">
        <img class="s-bg frag" src="../final/P5_5.png" alt="">
      </section>`;
  }
  if (s.file) {
    let sec = extractSection(s.file);
    if (sec) {
      // 위치 기반 자동 번호 (하드코딩 값 덮어씀)
      sec = sec.replace(/(<span class="s-pagenum">)[^<]*(<\/span>)/, '$1' + pageNo + '$2');
      sec = sec.replace(/<section class="slide/, '<section data-idx="' + idx + '" class="slide');
      return '      <!-- ' + s.file + ' -->\n      ' + sec.replace(/\n/g, '\n      ');
    }
    // 폴백
  }
  const src = s.img;
  return `      <!-- 이미지 ${src} -->\n      <section data-idx="${idx}" class="slide"><img class="s-bg" src="${src}" alt=""></section>`;
}

const sectionsHtml = SLIDES.map((s, idx) => slideMarkup(s, idx)).join('\n\n');

const deck = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AX 강연 — 슬라이드</title>
<link rel="stylesheet" href="slides.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{height:100%;background:#0a0a0a;overflow:hidden;font-family:var(--sans);}
  /* 뷰포트에 맞춰 16:9 슬라이드를 통째 scale. 절대배치+translate(-50%,-50%)로 중앙정렬 */
  #stage{position:fixed;inset:0;overflow:hidden;background:#0a0a0a;}
  #viewport{position:absolute;top:50%;left:50%;width:1920px;height:1080px;overflow:hidden;background:#fff;
            box-shadow:0 12px 70px rgba(0,0,0,.55);transform-origin:center center;}
  #track{position:absolute;top:0;left:0;height:1080px;display:flex;
         transition:transform .45s cubic-bezier(.45,0,.2,1);}
  #track>.slide{box-shadow:none;}
  /* 슬라이드 내 단계 노출(fragment) */
  .frag{opacity:0;transition:opacity .55s ease;}
  .frag.shown{opacity:1;}
  /* 좌우 네비 영역 */
  .nav{position:fixed;top:0;bottom:0;width:11%;border:0;background:transparent;cursor:pointer;z-index:10;
       display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity .2s;}
  body:hover .nav{opacity:.55;}
  .nav:hover{opacity:1!important;background:rgba(0,0,0,.06);}
  .nav.prev{left:0;justify-content:flex-start;padding-left:22px;}
  .nav.next{right:0;justify-content:flex-end;padding-right:22px;}
  .nav span{font-size:46px;line-height:1;text-shadow:0 1px 6px rgba(0,0,0,.5);}
  /* 편집(E)·VisBug 활성 중엔 좌우 네비 영역 숨김 (페이지 이동 잠금은 JS에서) */
  body.editing .nav, body.visbug .nav{display:none!important;}
  /* 선택 영역 포맷 툴바 */
  #fmtbar{position:fixed;z-index:60;display:none;gap:2px;align-items:center;
    background:#1c1c1f;border:1px solid #3a3a3e;border-radius:10px;padding:5px 7px;
    box-shadow:0 8px 28px rgba(0,0,0,.45);font-family:var(--sans);}
  #fmtbar.on{display:flex;}
  #fmtbar button{min-width:32px;height:30px;border:0;background:transparent;color:#ededed;
    font-size:15px;border-radius:6px;cursor:pointer;padding:0 7px;line-height:30px;}
  #fmtbar button:hover{background:#37373c;}
  #fmtbar button.sw{min-width:22px;width:22px;height:22px;border-radius:50%;padding:0;border:1px solid #666;}
  #fmtbar i{width:1px;height:20px;background:#3a3a3e;margin:0 4px;display:inline-block;}
  #counter{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);color:#fff;
           background:rgba(0,0,0,.42);padding:6px 16px;border-radius:999px;font-size:15px;
           letter-spacing:.04em;z-index:10;opacity:.5;transition:opacity .2s;}
  body:hover #counter{opacity:1;}
  /* ===== 편집 모드 (E 토글) ===== */
  body.editing #track{transition:none;}
  body.editing .slide > *{outline:1px dashed rgba(230,0,18,.45);cursor:move;}
  body.editing .slide > *.sel{outline:2px solid #E60012;}
  /* 텍스트 직접 편집(더블클릭) */
  .slide > *[contenteditable="true"]{outline:2px solid #0B5FD9!important;cursor:text!important;}
  body.text-editing .slide > *{cursor:default;}
  /* 페이지 이동 모드 — 축소 필름스트립(앞/뒷장 노출) + 옮기는 슬라이드 강조 */
  #viewport{transition:transform .3s cubic-bezier(.45,0,.2,1);}
  body.moving #viewport{overflow:visible;}
  body.moving #track{transition:transform .28s cubic-bezier(.45,0,.2,1);}
  body.moving #track>.slide{opacity:.5;outline:2px solid rgba(0,0,0,.14);outline-offset:-2px;}
  body.moving #track>.slide.cur{opacity:1;outline:6px solid #0B5FD9;outline-offset:-6px;box-shadow:0 24px 80px rgba(0,0,0,.55);}
  #edit-hud{position:fixed;top:10px;left:50%;transform:translateX(-50%);display:none;
    background:rgba(0,0,0,.82);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;z-index:50;white-space:nowrap;}
  #rz-handle{position:fixed;width:16px;height:16px;background:#E60012;border:2px solid #fff;border-radius:50%;
    cursor:nwse-resize;z-index:51;display:none;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  /* ===== 마스터 가이드 보조선 (G 토글) — 디자인시스템 §1 그리드/마진 ===== */
  #guide{position:absolute;inset:0;pointer-events:none;z-index:40;display:none;}
  body.show-guide #guide{display:block;}
  #guide .gv{position:absolute;top:0;bottom:0;width:2px;background:rgba(11,95,217,.45);}
  #guide .gh{position:absolute;left:0;right:0;height:2px;background:rgba(11,95,217,.45);}
  #guide .gcol{background:rgba(11,95,217,.22);}
  #guide .gbox{position:absolute;left:120px;top:96px;width:1680px;height:888px;border:2px solid rgba(232,92,52,.5);}
  #guide .glabel{position:absolute;font:600 18px/1 var(--sans);color:rgba(11,95,217,.85);
    background:rgba(255,255,255,.85);padding:2px 6px;border-radius:4px;}

  /* ===== 인쇄 (Cmd+P) — 현재 보는 슬라이드 1장만, 16:9 한 페이지 ===== */
  /* 전체 31장 인쇄는 무겁고 느려서 미리보기가 멈춘다 → Cmd+P는 현재 1장만(가볍고 빠름). 전체 PDF는 deck-pdf.js CLI. */
  @media print {
    @page { size: 13.333in 7.5in; margin: 0; }   /* 1280×720 @96dpi = 16:9 (PPT 표준) */
    html, body { width:auto !important; height:auto !important; overflow:visible !important;
      background:#fff !important; }
    #stage { position:static !important; inset:auto !important; overflow:visible !important; background:#fff !important; }
    #viewport { position:static !important; inset:auto !important; top:auto !important; left:auto !important;
      width:1920px !important; height:auto !important; transform:none !important; zoom:0.66667;
      box-shadow:none !important; overflow:visible !important; background:#fff !important; }
    #track { position:static !important; display:block !important; width:1920px !important; height:auto !important;
      transform:none !important; transition:none !important; }
    /* 기본(Cmd+P): 현재 슬라이드(.cur) 1장만 표시 */
    #track > .slide { display:none !important; }
    #track > .slide.cur { display:block !important; width:1920px !important; height:1080px !important;
      position:relative !important; overflow:hidden; box-shadow:none !important; }
    /* 전체 모드(deck-pdf.js CLI가 body.print-all 설정): 31장 전부, 슬라이드당 1페이지 */
    body.print-all #track > .slide { display:block !important; width:1920px !important; height:1080px !important;
      position:relative !important; overflow:hidden; box-shadow:none !important;
      break-after:page; page-break-after:always; }
    body.print-all #track > .slide:last-child { break-after:auto; page-break-after:auto; }
    /* fragment(애니메이션) 슬라이드는 최종 상태로 인쇄 */
    .frag { opacity:1 !important; }
    /* 편집/네비 UI는 인쇄에서 제외 */
    .nav, #counter, #fmtbar, #edit-hud, #rz-handle, #guide,
    body.editing .nav, body.visbug .nav { display:none !important; }
    /* 배경색·일러스트 색을 그대로 인쇄(브라우저 기본은 배경 생략) */
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
</style>
</head>
<body>
<div id="stage">
  <div id="viewport">
    <div id="track">

${sectionsHtml}

    </div>
    <div id="guide">
      <div class="gbox"></div>
      <div class="gv" style="left:120px"></div>
      <div class="gv" style="left:1800px"></div>
      <div class="gv gcol" style="left:960px"></div>
      <div class="gh" style="top:540px;opacity:.5"></div>
      <div class="gh" style="top:120px"></div>
      <div class="gh" style="top:300px"></div>
      <div class="gh" style="top:976px"></div>
      <div class="glabel" style="left:128px;top:126px">제목 y120 · x120</div>
      <div class="glabel" style="left:128px;top:306px">본문 y300</div>
      <div class="glabel" style="left:128px;top:982px">푸터 y976</div>
      <div class="glabel" style="left:980px;top:100px">우측 존 x972</div>
    </div>
  </div>
</div>

<button class="nav prev" aria-label="이전"><span>‹</span></button>
<button class="nav next" aria-label="다음"><span>›</span></button>
<div id="counter">1 / 1</div>

<script>
  const slides = [...document.querySelectorAll('#track > .slide')];
  const N = slides.length;
  const track = document.getElementById('track');
  const viewport = document.getElementById('viewport');
  const counter = document.getElementById('counter');
  const frags = slides.map(s => [...s.querySelectorAll('.frag')]);
  let i = 0, step = 0;

  const MOVE_ZOOM = 0.46; // 이동 모드: 축소해 앞/뒷장이 함께 보이게 (필름스트립)
  function fit(){
    let s = Math.min(innerWidth / 1920, innerHeight / 1080);
    if (document.body.classList.contains('moving')) s *= MOVE_ZOOM;
    viewport.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  function render(){
    track.style.transform = 'translateX(' + (-i * 1920) + 'px)';
    slides.forEach((s, si) => frags[si].forEach((f, fi) => {
      f.classList.toggle('shown', si < i || (si === i && fi < step));
    }));
    counter.textContent = (i + 1) + ' / ' + N;
    slides.forEach((s, si) => s.classList.toggle('cur', si === i)); // 인쇄(Cmd+P) = 현재 1장만
    typingBurst = false; // 페이지 전환 시 타이핑 버스트가 다음 페이지로 새지 않게
    try { localStorage.setItem('deckSlide', i); } catch(_){}  // 현재 페이지 기억
  }
  function next(){ if (step < frags[i].length) step++; else if (i < N-1){ i++; step = 0; } else return; render(); }
  function prev(){ if (step > 0) step--; else if (i > 0){ i--; step = frags[i].length; } else return; render(); }
  function toggleFull(){ if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
  // ===== 페이지 점프: 숫자 입력 후 Enter (스크롤 없이 바로 이동) =====
  function goTo(p){ p = (p|0); if(!p) return; i = Math.max(0, Math.min(N-1, p-1)); step = 0; render(); }
  window.deckGoTo = goTo; // 외부 도구(deck-goto.js)에서 직접 호출
  let jumpBuf = '', jumpT = 0;
  const jumpEl = document.createElement('div'); jumpEl.id = 'jump';
  jumpEl.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:70;'
    + 'background:rgba(0,0,0,.82);color:#fff;padding:16px 30px;border-radius:12px;font-size:34px;'
    + 'font-weight:700;letter-spacing:.04em;display:none;pointer-events:none;';
  document.body.appendChild(jumpEl);
  function showJump(){
    jumpEl.textContent = jumpBuf ? ('이동 → ' + jumpBuf + ' / ' + N + '  ⏎') : '';
    jumpEl.style.display = jumpBuf ? 'block' : 'none';
    clearTimeout(jumpT); if (jumpBuf) jumpT = setTimeout(() => { jumpBuf = ''; showJump(); }, 1800);
  }
  // ===== 핫키 가이드 (? 로 열기/닫기) =====
  function hkRow(k, d){ return '<tr><td style="padding:4px 34px 4px 0;font-weight:700;white-space:nowrap;">' + k + '</td><td style="color:#3A3A3A;">' + d + '</td></tr>'; }
  const helpEl = document.createElement('div'); helpEl.id = 'help';
  helpEl.style.cssText = 'position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);';
  helpEl.innerHTML = '<div style="background:#fff;color:#151515;border-radius:16px;padding:34px 44px;font-family:var(--sans);box-shadow:0 20px 60px rgba(0,0,0,.4);">'
    + '<div style="font-size:30px;font-weight:800;margin-bottom:18px;">단축키</div>'
    + '<table style="font-size:22px;line-height:1.7;border-collapse:collapse;">'
    + hkRow('← →  ·  Space  ·  PgUp/PgDn', '이전 / 다음 페이지')
    + hkRow('숫자 입력 → Enter', '해당 페이지로 바로 이동')
    + hkRow('Home / End', '처음 / 마지막 페이지')
    + hkRow('F', '전체화면')
    + hkRow('G', '정렬 가이드 토글')
    + hkRow('E', '편집 모드 (Esc = 종료)')
    + hkRow('M', '페이지 이동 모드 (← → 재배치 · Enter/M 적용 · Esc 취소 · “저장”이라 말하면 소스 확정)')
    + hkRow('편집 중: 드래그·모서리·방향키', '이동 / 크기 / 미세조정 · Del 삭제 · ⌘Z 되돌리기')
    + hkRow('텍스트 더블클릭', '글자 편집 (Esc = 완료)')
    + hkRow('?', '이 도움말 열기/닫기')
    + '</table><div style="font-size:18px;color:#6E6D72;margin-top:18px;">아무 곳이나 클릭 · Esc 로 닫기</div></div>';
  document.body.appendChild(helpEl);
  function toggleHelp(){ helpEl.style.display = (helpEl.style.display === 'flex') ? 'none' : 'flex'; }
  helpEl.addEventListener('click', () => { helpEl.style.display = 'none'; });
  addEventListener('resize', fit);
  addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.isContentEditable) return; // 텍스트 편집 중엔 타이핑
    // ── 페이지 이동 모드: 화살표=슬라이드 재배치, Enter/Esc/M=내려놓기 ──
    if (moveMode) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); moveCur(-1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveCur(+1); return; }
      if (e.key === 'Escape')     { e.preventDefault(); cancelMove(); return; }   // 취소 → 진입 시점 복원
      if (e.key === 'Enter' || e.key === 'm' || e.key === 'M') { e.preventDefault(); setMove(false); return; } // 적용(유지)
      e.preventDefault(); return; // 이동 중엔 그 외 키 무시
    }
    const navLock = editMode || vbActive() || moveMode; // 편집/VisBug/이동 중엔 페이지 이동 금지
    if (!navLock && /^[0-9]$/.test(e.key)) { e.preventDefault(); jumpBuf = (jumpBuf + e.key).slice(0, 3); showJump(); return; }
    if (!navLock && e.key === 'Enter' && jumpBuf) { e.preventDefault(); goTo(parseInt(jumpBuf, 10)); jumpBuf = ''; showJump(); return; }
    if (!navLock && e.key === 'Escape' && jumpBuf) { e.preventDefault(); jumpBuf = ''; showJump(); return; }
    if (!navLock && (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ')) { e.preventDefault(); next(); }
    else if (!navLock && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); prev(); }
    else if (!navLock && e.key === 'Home') { i = 0; step = 0; render(); }
    else if (!navLock && e.key === 'End') { i = N - 1; step = frags[i].length; render(); }
    else if ((e.key === 'm' || e.key === 'M') && !navLock) { e.preventDefault(); setMove(true); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFull(); }
    else if (e.key === 'g' || e.key === 'G') { document.body.classList.toggle('show-guide'); }
    else if (e.key === '?') { e.preventDefault(); toggleHelp(); }
    else if (e.key === 'Escape' && helpEl.style.display === 'flex') { helpEl.style.display = 'none'; }
    else if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  });
  document.querySelector('.nav.prev').onclick = prev;
  document.querySelector('.nav.next').onclick = next;

  // ===== 페이지 이동 모드 (M) — 현재 슬라이드를 앞/뒤로 재배치 (in-memory · 저장 전까지 tentative) =====
  // 저장은 유저가 "저장"이라고 말할 때만: 나(assistant)가 window.deckOrder()로 순열을 읽어 build-deck.js의
  // SLIDES 배열을 재작성 → 재빌드하면 footer 번호는 위치기반 자동주입이라 자동 정정됨. 리로드하면 미저장 이동은 소실.
  let moveMode = false, moveSnapshot = null, moveStartI = 0;
  const moveBar = document.createElement('div'); moveBar.id = 'move-bar';
  moveBar.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:76;'
    + 'background:#0B5FD9;color:#fff;padding:12px 26px;border-radius:12px;font-size:23px;font-weight:800;'
    + 'display:none;box-shadow:0 10px 34px rgba(0,0,0,.45);white-space:nowrap;pointer-events:none;';
  document.body.appendChild(moveBar);
  const trackSlides = () => [...track.querySelectorAll(':scope > .slide')];
  function moveBarText(){
    const c = trackSlides()[i];
    const t = c && c.querySelector('.s-title');
    const label = t ? t.textContent.trim().slice(0, 24) : ((c && c.id) || ('#' + (i + 1)));
    moveBar.textContent = '📦 이동 중: “' + label + '”  → 위치 ' + (i + 1) + ' / ' + N
      + '    (← → 이동 · Enter/M 적용 · Esc 취소 · “저장”해야 소스 확정)';
  }
  function setMove(on){
    if (on) { moveSnapshot = trackSlides(); moveStartI = i; } // 진입 시점 순서 스냅샷(Esc 취소용)
    moveMode = on;
    document.body.classList.toggle('moving', on);
    moveBar.style.display = on ? 'block' : 'none';
    fit(); // 이동모드 진입=축소 / 종료=현재 페이지로 복귀 확대
    if (on) moveBarText();
  }
  function moveCur(dir){ // dir: -1=앞으로 / +1=뒤로
    const j = i + dir;
    if (j < 0 || j >= N) return;
    const list = trackSlides();
    const a = list[i], b = list[j];
    if (dir < 0) track.insertBefore(a, b); else track.insertBefore(b, a);
    // slides·frags 배열을 새 DOM 순서로 재동기화 (render가 이 배열을 참조)
    const nl = trackSlides();
    slides.length = 0; slides.push(...nl);
    frags.length = 0; nl.forEach(s => frags.push([...s.querySelectorAll('.frag')]));
    i = j; step = 0;
    render();
    renumber();      // 이동 즉시 footer 번호를 새 위치로 라이브 재계산 (보이는 것과 싱크)
    moveBarText();
  }
  function cancelMove(){ // Esc = 이번 이동 세션 취소 → 진입 시점 순서로 복원
    if (moveSnapshot){
      moveSnapshot.forEach(el => track.appendChild(el)); // 스냅샷 순서대로 재배치
      const nl = trackSlides();
      slides.length = 0; slides.push(...nl);
      frags.length = 0; nl.forEach(s => frags.push([...s.querySelectorAll('.frag')]));
      i = moveStartI; step = 0; renumber();
    }
    setMove(false);
    render();
  }
  // 저장 시 assistant가 CDP로 읽는 접근자: 현재 DOM 순서의 원래 인덱스 나열 = SLIDES 재정렬 순열
  window.deckOrder = () => trackSlides().map(s => +s.dataset.idx);
  window.deckMoveMode = () => moveMode;
  // ===== 페이지 번호 = 현재 위치로 동적 계산 (이동하면 즉시 싱크 · 소스 확정은 "저장" 시) =====
  // build가 빌드시점 위치로 넣어두지만, 라이브 이동 후엔 stale → 매 이동마다 + 초기 1회 재계산해 통일.
  // .s-pagenum 없는 이미지 슬라이드는 baked라 건드리지 않음.
  function renumber(){
    trackSlides().forEach((s, si) => { const pn = s.querySelector('.s-pagenum'); if (pn) pn.textContent = si + 1; });
  }
  renumber();

  // ===== 편집 모드 (E 토글) — 드래그 이동 / 모서리 크기 / 방향키 미세조정 =====
  function getScale(){ return Math.min(innerWidth / 1920, innerHeight / 1080); }
  const hud = document.createElement('div'); hud.id = 'edit-hud'; document.body.appendChild(hud);
  const rz = document.createElement('div'); rz.id = 'rz-handle'; document.body.appendChild(rz);
  let editMode = false, sel = null, drag = null, textEditing = null;
  const cur = () => slides[i];
  const selName = el => el.id || (el.className && String(el.className).trim().split(' ')[0]) || el.tagName.toLowerCase();
  function toLeftTop(el){ el.style.left = el.offsetLeft + 'px'; el.style.top = el.offsetTop + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; }
  function placeHandle(){
    if (editMode && sel){ const r = sel.getBoundingClientRect(); rz.style.display = 'block'; rz.style.left = (r.right - 8) + 'px'; rz.style.top = (r.bottom - 8) + 'px'; }
    else rz.style.display = 'none';
  }
  function hudText(){
    if (!editMode){ hud.style.display = 'none'; return; }
    hud.style.display = 'block';
    hud.textContent = sel
      ? selName(sel) + '  x:' + Math.round(sel.offsetLeft) + '  y:' + Math.round(sel.offsetTop) + '  w:' + Math.round(sel.offsetWidth) + '   (방향키 1px·Shift 12px / 모서리=크기 / E 종료)'
      : '편집 모드: 요소 클릭→드래그 이동, 모서리 핸들=크기, 방향키=미세. 다 되면 “저장”이라고 말하세요. E·Esc=종료 · ?=단축키';
  }
  function select(el){ if (sel) sel.classList.remove('sel'); sel = el; if (el) el.classList.add('sel'); placeHandle(); hudText(); }
  function setEdit(on){ editMode = on; document.body.classList.toggle('editing', on); if (!on) select(null); placeHandle(); hudText(); }

  // ===== 통합 Undo/Redo 히스토리 — 페이지별 독립 스택 =====
  // 네이티브 contenteditable undo는 execCommand·타이핑만 잡고, style/DOM 직접조작(크기·줄간격·정렬·형광·드래그)은
  // 못 잡아 Cmd+Z가 들쭉날쭉했다. 슬라이드 innerHTML 스냅샷으로 모든 편집을 일관되게 되돌린다.
  // 페이지마다 별도 스택(Map<slide, {u,r}>)이라 여러 페이지를 오가며 편집해도 각 페이지 히스토리가 유지되고,
  // undo/redo는 "현재 보는 페이지"의 스택만 건드린다(다른 페이지 내용이 엉뚱하게 주입될 일 없음).
  const hist = new Map();
  let typingBurst = false, typingTimer = null, suppressSnap = false;
  function stacksFor(sl){ let h = hist.get(sl); if(!h){ h = { u:[], r:[] }; hist.set(sl, h); } return h; }
  function snapshot(){
    const sl = cur(); if(!sl) return;
    const h = stacksFor(sl);
    h.u.push(sl.innerHTML); // 상한 없음 — 세션(새로고침 전)까지 처음부터 끝까지 전부 보관
    h.r.length = 0; // 새 편집 → 그 페이지 redo 무효화
  }
  function afterRestore(){
    const sl = cur();
    sl.querySelectorAll('[contenteditable="true"]').forEach(n => n.removeAttribute('contenteditable'));
    sl.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
    textEditing = null; sel = null; savedRange = null; drag = null; typingBurst = false;
    document.body.classList.remove('text-editing');
    rz.style.display = 'none'; fmtbar.classList.remove('on');
    placeHandle(); hudText();
  }
  function undo(){ const sl = cur(); const h = sl && hist.get(sl); if(!h || !h.u.length) return; h.r.push(sl.innerHTML); sl.innerHTML = h.u.pop(); afterRestore(); }
  function redo(){ const sl = cur(); const h = sl && hist.get(sl); if(!h || !h.r.length) return; h.u.push(sl.innerHTML); sl.innerHTML = h.r.pop(); afterRestore(); }
  function hasHist(){ const h = hist.get(cur()); return !!h && (h.u.length || h.r.length); }
  addEventListener('keydown', e => {
    if(!(e.metaKey || e.ctrlKey)) return;
    const z = (e.key === 'z' || e.key === 'Z'), y = (e.key === 'y' || e.key === 'Y');
    if(!z && !y) return;
    if(!editMode && !hasHist()) return; // 편집 맥락 아니면 네이티브에 양보
    e.preventDefault(); e.stopPropagation();
    if(y || (z && e.shiftKey)) redo(); else undo();
  }, true);
  // 타이핑은 버스트 단위로 1회 스냅샷(beforeinput=변경 직전). execCommand발 beforeinput은 suppressSnap으로 중복 방지.
  document.addEventListener('beforeinput', e => {
    if(suppressSnap) return;
    const t = e.target; if(!t || !(t.closest && t.closest('.slide [contenteditable="true"], .slide[contenteditable="true"]'))) return;
    if(!typingBurst){ snapshot(); typingBurst = true; }
    clearTimeout(typingTimer); typingTimer = setTimeout(() => { typingBurst = false; }, 700);
  }, true);

  addEventListener('pointerdown', e => {
    if (!editMode) return;
    if (e.target.closest && e.target.closest('#fmtbar')) return; // 포맷 툴바 클릭은 편집 유지
    if (textEditing){ if (textEditing.contains(e.target)) return; else endTextEdit(); } // 편집 영역 밖 클릭=편집 종료
    if (e.target === rz){ if (!sel) return; snapshot(); drag = { mode:'rz', el:sel, sx:e.clientX, bw:sel.offsetWidth, s:getScale() }; e.preventDefault(); return; }
    const el = e.target.closest('.slide > *');
    if (!el || !cur().contains(el)) return;
    snapshot();
    select(el); toLeftTop(el);
    drag = { mode:'mv', el, sx:e.clientX, sy:e.clientY, bl:el.offsetLeft, bt:el.offsetTop, s:getScale() };
    // 스냅 라인: 마진·중앙 + 다른 컴포넌트 엣지 + 표준 gap(컴포넌트 사이 거리)
    const GAPS = [12, 24, 34, 48];
    const xs = new Set([120, 960, 1800]), ys = new Set([120, 300, 540, 976]);
    [...cur().children].forEach(o => {
      if (o === el || o.tagName === 'STYLE' || !o.offsetWidth) return;
      const l=o.offsetLeft, r=o.offsetLeft+o.offsetWidth, cx=Math.round(o.offsetLeft+o.offsetWidth/2);
      const t=o.offsetTop, bo=o.offsetTop+o.offsetHeight, cy=Math.round(o.offsetTop+o.offsetHeight/2);
      xs.add(l); xs.add(r); xs.add(cx); ys.add(t); ys.add(bo); ys.add(cy);
      GAPS.forEach(g => { xs.add(r+g); xs.add(l-g); ys.add(bo+g); ys.add(t-g); }); // 이웃에서 gap만큼 띄움
    });
    drag.xs = [...xs]; drag.ys = [...ys];
    if (!document.body.classList.contains('show-guide')) { document.body.classList.add('show-guide'); drag.autoGuide = true; }
    e.preventDefault();
  });
  function snap1(val, w, lines, T){ // val=후보 left/top, w=폭/높이 → 엣지(시작/끝/중앙) 중 가장 가까운 라인에 스냅
    let best=null, bd=T+1;
    for(const g of lines){
      for(const [edge,adj] of [[val,0],[val+w,-w],[val+Math.round(w/2),-Math.round(w/2)]]){
        const d=Math.abs(edge-g); if(d<bd){ bd=d; best=g+adj; }
      }
    }
    return best===null ? val : best;
  }
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.mode === 'mv'){
      let nl = Math.round(drag.bl + (e.clientX - drag.sx) / drag.s);
      let nt = Math.round(drag.bt + (e.clientY - drag.sy) / drag.s);
      const T = e.altKey ? 0 : 8;  // Alt 누르면 스냅 끔
      if (T) { nl = snap1(nl, drag.el.offsetWidth, drag.xs, T); nt = snap1(nt, drag.el.offsetHeight, drag.ys, T); }
      drag.el.style.left = nl + 'px';
      drag.el.style.top  = nt + 'px';
    } else {
      drag.el.style.width = Math.max(40, Math.round(drag.bw + (e.clientX - drag.sx) / drag.s)) + 'px';
      if (drag.el.tagName === 'IMG') drag.el.style.height = 'auto';
    }
    placeHandle(); hudText();
  });
  addEventListener('pointerup', () => { if (drag && drag.autoGuide) document.body.classList.remove('show-guide'); drag = null; });
  addEventListener('keydown', e => {
    if (textEditing) return; // 텍스트 편집 중엔 방향키/단축키 대신 타이핑
    if (e.key === 'e' || e.key === 'E'){ setEdit(!editMode); e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Escape' && editMode){ setEdit(false); e.preventDefault(); e.stopPropagation(); return; }
    if (!editMode || !sel) return;
    // 선택 컴포넌트 삭제 (Delete/Backspace) — snapshot으로 Cmd+Z 복원 가능
    if (e.key === 'Delete' || e.key === 'Backspace'){
      snapshot(); const victim = sel; select(null); victim.remove();
      placeHandle(); hudText(); e.preventDefault(); e.stopPropagation(); return;
    }
    const isArrow = e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown';
    if (isArrow && !e.repeat) snapshot();
    const st = e.shiftKey ? 12 : 1; let u = true;
    if (e.key === 'ArrowLeft'){ toLeftTop(sel); sel.style.left = (sel.offsetLeft - st) + 'px'; }
    else if (e.key === 'ArrowRight'){ toLeftTop(sel); sel.style.left = (sel.offsetLeft + st) + 'px'; }
    else if (e.key === 'ArrowUp'){ toLeftTop(sel); sel.style.top = (sel.offsetTop - st) + 'px'; }
    else if (e.key === 'ArrowDown'){ toLeftTop(sel); sel.style.top = (sel.offsetTop + st) + 'px'; }
    else u = false;
    if (u){ e.preventDefault(); e.stopPropagation(); placeHandle(); hudText(); }
  }, true);
  addEventListener('resize', placeHandle);

  // ===== 선택 영역 포맷 툴바 (텍스트 더블클릭→편집 상태에서 드래그 선택 시) =====
  const fmtbar = document.createElement('div');
  fmtbar.id = 'fmtbar';
  fmtbar.innerHTML =
    '<button data-c="bold" title="볼드"><b>B</b></button>' +
    '<button data-c="underline" title="밑줄"><u>U</u></button>' +
    '<button data-c="strikeThrough" title="취소선"><s>S</s></button>' +
    '<button data-c="hl" title="형광배경" style="background:#FFE15A;color:#000">H</button>' +
    '<i></i>' +
    '<button class="sw" data-fc="#000000" style="background:#000" title="검정"></button>' +
    '<button class="sw" data-fc="#E60012" style="background:#E60012" title="빨강"></button>' +
    '<button class="sw" data-fc="#0B5FD9" style="background:#0B5FD9" title="파랑"></button>' +
    '<button class="sw" data-fc="#E8920A" style="background:#E8920A" title="골드"></button>' +
    '<button class="sw" data-fc="#6E6D72" style="background:#6E6D72" title="회색"></button>' +
    '<i></i>' +
    '<button data-c="size-" title="크기-">A−</button>' +
    '<button data-c="size+" title="크기+">A+</button>' +
    '<button data-c="lh-" title="줄간격-">↕−</button>' +
    '<button data-c="lh+" title="줄간격+">↕+</button>' +
    '<i></i>' +
    '<button data-c="justifyLeft" title="왼쪽">⇤</button>' +
    '<button data-c="justifyCenter" title="가운데">≡</button>' +
    '<button data-c="justifyRight" title="오른쪽">⇥</button>';
  document.body.appendChild(fmtbar);
  let savedRange = null;

  function editableBlock(){
    const s = window.getSelection();
    if(!s || !s.rangeCount) return null;
    let n = s.getRangeAt(0).commonAncestorContainer;
    n = n.nodeType===3 ? n.parentElement : n;
    return n ? n.closest('[contenteditable="true"]') : null;
  }
  function showFmt(){
    const s = window.getSelection();
    if(!editMode || !s || s.isCollapsed || !s.rangeCount){ fmtbar.classList.remove('on'); return; }
    const blk = editableBlock();
    if(!blk || !blk.closest('#track .slide')){ fmtbar.classList.remove('on'); return; }
    const r = s.getRangeAt(0).getBoundingClientRect();
    if(!r.width && !r.height){ fmtbar.classList.remove('on'); return; }
    fmtbar.classList.add('on');
    savedRange = s.getRangeAt(0).cloneRange(); // 선택 저장 (적용 시 복원)
    const bw = fmtbar.offsetWidth, bh = fmtbar.offsetHeight;
    let x = r.left + r.width/2 - bw/2, y = r.top - bh - 10;
    x = Math.max(8, Math.min(x, innerWidth - bw - 8));
    if(y < 8) y = r.bottom + 10;
    fmtbar.style.left = x + 'px'; fmtbar.style.top = y + 'px';
  }
  document.addEventListener('selectionchange', showFmt);
  fmtbar.addEventListener('mousedown', e => e.preventDefault()); // 선택 유지
  function wrapRange(range, styler){
    try {
      const span = document.createElement('span'); styler(span);
      span.appendChild(range.extractContents()); range.insertNode(span);
      const sel = window.getSelection(); sel.removeAllRanges();
      const r = document.createRange(); r.selectNodeContents(span); sel.addRange(r);
      savedRange = r.cloneRange(); return true;
    } catch(err){ return false; }
  }
  const rangeNode = () => { const n = savedRange.commonAncestorContainer; return n.nodeType===3 ? n.parentElement : n; };
  const lineBlock = (n) => n.closest('.btxt, .s-sub, .s-title, .s-qbox-text, .s-eyebrow') || n.closest('[contenteditable="true"]');
  function changeSize(delta){
    if(!savedRange || savedRange.collapsed) return;
    // 기준 크기 = 선택 안에 이미 우리가 만든 font-size가 있으면 그 값, 없으면 시작점 렌더 크기
    const probe = savedRange.cloneContents();
    const inner = probe.querySelector ? probe.querySelector('span[style*="font-size"]') : null;
    let cur;
    if(inner){ cur = parseFloat(inner.style.fontSize) || 36; }
    else { const sc = savedRange.startContainer; const refEl = sc.nodeType===3 ? sc.parentElement : sc; cur = parseFloat(getComputedStyle(refEl).fontSize) || 36; }
    const nv = Math.max(12, cur+delta);
    // 선택을 들어내 → 내부의 기존 인라인 font-size를 평탄화(중첩 누적 방지) → 한 겹 span으로 다시 감싼다
    const frag = savedRange.extractContents();
    if(frag.querySelectorAll) frag.querySelectorAll('span[style*="font-size"]').forEach(s=>{
      s.style.removeProperty('font-size');
      if(!(s.getAttribute('style')||'').trim()){ const p=s.parentNode; while(s.firstChild) p.insertBefore(s.firstChild, s); p.removeChild(s); }
    });
    const span = document.createElement('span'); span.style.fontSize = nv+'px';
    span.appendChild(frag); savedRange.insertNode(span);
    // 줄간격 자동 = '라인 내 가장 큰 폰트' 기준. line-height는 unitless(비율)라 블록 font-size에 자동 비례.
    // 블록 전체를 리사이즈(맨 텍스트 없음)했으면 블록 font-size를 실제 최대폰트로 맞춰 strut를 축소/확대 → 줄간격 따라감.
    // 부분만 리사이즈(맨 텍스트 남음)면 블록 폰트 유지 → 더 큰 쪽이 줄 높이를 지배(가장 큰 폰트 기준 유지).
    try {
      const blk = lineBlock(span);
      if(blk){
        let maxF = 0;
        blk.querySelectorAll('span[style*="font-size"]').forEach(s2=>{ const f=parseFloat(s2.style.fontSize)||0; if(f>maxF) maxF=f; });
        let bare = false;
        (function walk(el){ el.childNodes.forEach(n=>{
          if(n.nodeType===3){ if(n.textContent.trim()) bare=true; }
          else if(n.nodeType===1 && !((n.getAttribute&&n.getAttribute('style'))||'').includes('font-size')) walk(n);
        }); })(blk);
        if(maxF>0 && !bare) blk.style.fontSize = maxF+'px';
        const lh = blk.style.lineHeight;
        if(lh && /px$/.test(lh)){ const cs=getComputedStyle(blk); blk.style.lineHeight = (parseFloat(lh)/(parseFloat(cs.fontSize)||36)).toFixed(3); }
      }
    } catch(e){}
    const s = window.getSelection(); s.removeAllRanges();
    const r = document.createRange(); r.selectNode(span); s.addRange(r); savedRange = r.cloneRange();
  }
  function changeLh(delta){
    const blk = lineBlock(rangeNode()); if(!blk) return;
    if(blk.classList.contains('btxt')) blk.style.display='block';
    let lh = parseFloat(blk.dataset.lh);
    if(isNaN(lh)){ const cs=getComputedStyle(blk); lh = (parseFloat(cs.lineHeight)/(parseFloat(cs.fontSize)||36)) || 1.4; }
    lh = Math.max(0.8, lh+delta); blk.dataset.lh = lh.toFixed(2); blk.style.lineHeight = lh.toFixed(2);
  }
  function setAlign(dir){
    const blk = lineBlock(rangeNode()); if(!blk) return;
    blk.style.display = 'block';
    if(blk.classList.contains('btxt')) blk.style.flex = '1';
    blk.style.textAlign = dir==='justifyLeft'?'left':dir==='justifyCenter'?'center':'right';
  }
  function toggleHl(){
    const hl = rangeNode().closest('.hl');
    if(hl){ const pa=hl.parentNode; while(hl.firstChild) pa.insertBefore(hl.firstChild, hl); pa.removeChild(hl); }
    else wrapRange(savedRange, sp => sp.className='hl');
  }
  fmtbar.addEventListener('click', e => {
    const btn = e.target.closest('button'); if(!btn) return;
    if(!savedRange || savedRange.collapsed) return;
    const blk = rangeNode().closest('[contenteditable="true"]'); if(!blk) return;
    snapshot();              // ← undo 지점 (서식 1회 = 1스텝)
    suppressSnap = true;     // execCommand가 쏘는 beforeinput의 중복 스냅 방지
    blk.focus();
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange);
    const fc = btn.dataset.fc, c = btn.dataset.c;
    try { document.execCommand('styleWithCSS', false, true); } catch(_){}
    if(fc) document.execCommand('foreColor', false, fc);          // 색
    else if(c==='bold') document.execCommand('bold');             // 토글
    else if(c==='underline') document.execCommand('underline');   // 토글
    else if(c==='strikeThrough') document.execCommand('strikeThrough'); // 토글
    else if(c==='hl') toggleHl();                                  // 토글(형광)
    else if(c==='size+'||c==='size-') changeSize(c==='size+'?2:-2);
    else if(c==='lh+'||c==='lh-') changeLh(c==='lh+'?0.1:-0.1);
    else if(c) setAlign(c);                                        // 정렬
    suppressSnap = false;
    const ns = window.getSelection(); if(ns.rangeCount && !ns.isCollapsed) savedRange = ns.getRangeAt(0).cloneRange();
    showFmt();
  });

  // ===== VisBug 활성 감지 → 페이지 이동 잠금 + 좌우 네비 숨김 =====
  function vbActive(){ return [...document.body.children].some(el => /vis-?bug/i.test(el.tagName)); }
  const vbObserver = new MutationObserver(() => { document.body.classList.toggle('visbug', vbActive()); });
  vbObserver.observe(document.body, { childList: true });

  // ===== 텍스트 직접 편집 (편집모드에서 요소 더블클릭) =====
  function startTextEdit(el){
    if (!editMode) setEdit(true);
    select(el);
    textEditing = el;
    el.setAttribute('contenteditable', 'true');
    document.body.classList.add('text-editing');
    el.focus();
    rz.style.display = 'none';
    hud.style.display = 'block';
    hud.textContent = '텍스트 편집 중: 입력·수정 / Enter=줄바꿈 / Esc=완료 — 다 되면 “저장”이라고 말하세요.';
  }
  function endTextEdit(){
    if (textEditing){ textEditing.removeAttribute('contenteditable'); textEditing.blur(); textEditing = null; }
    document.body.classList.remove('text-editing');
    hudText(); placeHandle();
  }
  addEventListener('dblclick', e => {
    if (!editMode) return;
    const el = e.target.closest('.slide > *');
    if (!el || !cur().contains(el) || el.tagName === 'IMG') return;
    startTextEdit(el);
    // 더블클릭한 단어를 선택 → 포맷 툴바 즉시 표시 (기본 단어선택이 preventDefault로 막히므로 직접 선택)
    try {
      const cr = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (cr) {
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(cr);
        sel.modify('move', 'backward', 'word'); sel.modify('extend', 'forward', 'word');
        showFmt();
      }
    } catch (_) {}
    e.preventDefault();
  });
  addEventListener('keydown', e => {
    if (!textEditing) return;
    if (e.key === 'Escape'){ endTextEdit(); e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Enter' && !e.shiftKey){ snapshot(); suppressSnap = true; document.execCommand('insertLineBreak'); suppressSnap = false; e.preventDefault(); e.stopPropagation(); }
  }, true);

  try { const sv = parseInt(localStorage.getItem('deckSlide')); if(!isNaN(sv) && sv>=0 && sv<N) i = sv; } catch(_){}  // 새로고침해도 페이지 유지
  fit(); render();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(HTML, 'deck.html'), deck);

// ===== 2번 deck — 같은 소스(Pxx.html) 공유, 병렬 세션용 별도 인스턴스 =====
// 내용은 deck.html과 동일하되 (1) URL이 달라 세션별 탭 구분 가능 (2) localStorage 키가 달라 페이지 기억이 안 섞임.
// 저장(deck-save-all)은 공유 소스로 가므로, 두 deck에서 "서로 다른 페이지"를 나눠 편집해야 충돌이 없다(같은 페이지 동시편집 X).
const deck2 = deck
  .replace(/deckSlide/g, 'deckSlide2')
  .replace('<title>AX 강연 — 슬라이드</title>', '<title>AX 강연 — 슬라이드 (2번 · 병렬)</title>');
fs.writeFileSync(path.join(HTML, 'deck-2.html'), deck2);
console.log('built deck.html —', SLIDES.length, 'slides');
