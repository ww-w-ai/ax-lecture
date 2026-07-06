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
  { file: 'P51-pipeline.html' },                      // 개발 파이프라인 9단계(원 P51.png HTML화) — 사람 일러스트 crop + 실제 단계명 ✓
  { file: 'P33.html' },                               // P34(위치) PDCA — 하이브리드(텍스트 HTML + 링 이미지 crop) ✓
  { file: 'P34.html' },                               // P34 신규(도식) — matchRate 7축 가중 채점 · 순수 HTML ✓
  { file: 'P48-agents.html' },                        // 전문가 에이전트 군단(원 P48.png HTML화) — 좌 2그룹 + 우 원형 다이어그램 crop ✓
  { file: 'P45-orchestration.html' },                 // 오케스트레이션(원 P45.png HTML화) — 우 CTO/PM/QA/Do Swarm + 좌하단 단계별패턴 이미지 유지 ✓
  { file: 'P46-verify.html' },                        // 3중 검증(원 P46.png) — 타이틀·푸터 HTML + 본문 이미지 중앙(flow 바 삭제) ✓
  { file: 'P35.html' },                               // P35 도식(PDCA 사례) — 하이브리드(제목·결론 HTML + 4카드 이미지 crop) ✓
  { file: 'P36.html' },                               // P36+P47S 통합 — 자율주행 하네스 진화 Sprint(타이틀·서브=P47S / 내용·일러스트=P36 + /sprint init 항목 추가). 원 P47-sprint-preview 중복 제거 ✓
  { file: 'P37.html' },                               // P37 개념② — PRD 5부 구조 · 순수 HTML ✓
  { file: 'P38.html' },                               // P38 개념③ — 7-Layer dataFlow QA · 하이브리드(아이콘 crop + HTML) ✓
  { file: 'P39.html' },                               // P39 개념④ — Sprint 단계 × Trust · 무인범위 다이얼 · 완전 HTML(CSS 바/점/점선) ✓
  { file: 'P40.html' },                               // P40 개념⑤ — 측정 & 안전벨트 · 하이브리드(게이지/iterate/칩 crop + HTML 제목·헤더·resume·메시지) ✓
  { file: 'P41.html' },                               // P41 사례 — 자체 HTML(요약명령+컨테이너 crop + 마스터플랜 문서) ✓
  { file: 'P44.html', img: '../generated/P44.png' },  // P44 도식(프레임워크) — HTML 재현(로고만 이미지) ✓
  { file: 'P53.html' },                               // P53 소개 스크린샷(코깎노) ✓html
  { file: 'P52.html' },                               // P52 🔧실습 — bkit Quick Start (README) ✓html
  { file: 'bkit-case.html' },                         // bkit 실전 사례(/pdca 6단계) — 스크린샷 순차 애니메이션(frag) · 55~59와 동일 UI
  { file: 'P54.html', img: '../generated/P54.png' },  // P54 설명(bkit 커스텀) — 하이브리드(제목·불릿·인용 HTML + 일러스트 crop) ✓
  { file: 'P55.html', img: '../generated/P55.png' },  // P55 설명(ai-native-cowork ①) — 하이브리드(제목·불릿·인용 HTML + 다이어그램 crop) ✓
  { file: 'P56.html', img: '../generated/P56.png' },  // P56 설명(ai-native-cowork ②) — 하이브리드(제목·불릿·인용 HTML + 다이어그램 crop) ✓
  { file: 'P57.html' },                               // tene ① 인트로(눈으로 본다·개요) — 텍스트 템플릿 + tene-001 스크린샷 ✓html
  { file: 'tene-codemap.html' },                      // tene 스크린샷 full-bleed — CodeMap(tene-002) ✓
  { file: 'tene-interface.html' },                    // tene 스크린샷 full-bleed — Interface(tene-003) ✓
  { file: 'tene-api.html' },                          // tene 스크린샷 full-bleed — API(tene-004) ✓
  { file: 'tene-data.html' },                         // tene 스크린샷 full-bleed — Data(tene-005) ✓
  { file: 'tene-ai.html' },                           // tene 스크린샷 full-bleed — AI 에이전트(tene-006) ✓
  // ── 2부 챕터4 (운영 자율주행 — 수지) P61~P82 ── (2026-07-05 오프닝 4장: 인기·수치·위험·운영어려움 + 재번호)
  { img: '../generated/P61.png' },                    // P61 챕터4 divider(다크)
  { file: 'P62.html' },                               // P62 오프닝 [기] 인기 — 사진 풀블리드
  { file: 'P63.html' },                               // P63 오프닝 [승] 수치 — 다크(OpenClaw vs Hermes)
  { file: 'Pcases.html' },                            // 오프닝 [이래서 좋다] 실사용=매일 능동 비서(일상) (신설 2026-07-05)
  { file: 'P64.html' },                               // P64 오프닝 [전] 위험 — 3단 표+비율 영역
  { file: 'P65.html' },                               // P65 오프닝 [전2] 운영 어려움 — 다크(6가지 벽) → 그래서 수지
  // ── 2026-07-05: P66~P82 HTML 컴포넌트화 (구운 이미지 → 네이티브 HTML 재현, 현행 3원색) ──
  { file: 'P66.html' },                               // P66 隨智 — 지혜를 따라간다(이름·계보)
  { file: 'P67.html' },                               // P67 나만의 자비스(1인 사업자 1:1)
  // ── 수지 소개 섹션 재편 2026-07-06 (기존 69~79 '일곱 얼굴' 11장 → 창업자 스토리텔링 8장. 일러 6장 재활용 + 대시보드 실스크린샷) ──
  { file: 'Pcost.html' },                             // 69 비용 제로·어떤 AI에든(MCP) — 원 P74-illust 재활용
  { file: 'Pdaily.html' },                            // 70 일상의 슈퍼 에이전트·자가진화 — 원 P75-illust 재활용
  { file: 'Pdash.html' },                             // 71 대시보드(눈으로 본다) — 실제 수지 대시보드 스크린샷
  { file: 'Pdata.html' },                             // 72 데이터 주권(전용DB·5모드·시크릿·자체서버) — 원 P69-illust 재활용
  { file: 'Papps.html' },                             // 73 거대한 앱 실행 서버(앱스토어·find/run_app) — 원 P72-illust 재활용
  { file: 'Pauto.html' },                             // 74 자유도 높은 자동화(5트리거·격리·매니페스토) — 원 P73-illust 재활용
  { file: 'Psafe.html' },                             // 75 안전한 수지(안전 6관점 카드) — 재구성
  { file: 'Pworld.html' },                            // 76 세계관의 변화(데이터/실행 반전) — 원 P68-illust 재활용
  { file: 'P76.html' },                               // P76 하루를 수지에게(위임 도입)
  { file: 'P77.html' },                               // P77 사례① 어느 하루(타임라인)
  { file: 'P78.html' },                               // P78 사례② 시장·경쟁사 모니터링
  { file: 'P79.html' },                               // P79 사례③ 반복 운영·예약(토큰 0)
  { file: 'P80.html' },                               // P80 🔧실습 — 연결+첫 위임(스크린샷 자리)
  { file: 'P81.html' },                               // P81 눈으로 본다 + 안전하게(스크린샷 자리)
  { file: 'P82.html' },                               // P82 마무리 hero(그리고 그 너머) — 푸터 없음
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
        <!-- [비활성화 2026-07-05] 애니메이션 페이지 번호 제거 결정 → 소스 주석 보존
        <span class="s-pagenum" style="position:absolute;right:44px;bottom:34px;font-size:26px;font-weight:700;color:rgba(255,255,255,.9);text-shadow:0 1px 5px rgba(0,0,0,.55);z-index:5;">${pageNo}</span> -->
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

const sectionsHtml = SLIDES.map((s, idx) => slideMarkup(s, idx)).join('\n\n')
  // 캐시버스트(항상): 이미지 URL에 파일 mtime을 ?v=로 붙인다. 파일 내용이 바뀌면(재생성·재번호로 같은 파일명에
  // 다른 내용이 들어가도) mtime이 달라 브라우저가 새로 받고, 안 바뀐 건 캐시 유지(정밀 무효화).
  .replace(/\bsrc="(\.\.\/(?:final|generated)\/[^"?]+)"/g, (m, url) => {
    try { const v = Math.floor(fs.statSync(path.join(HTML, url)).mtimeMs); return `src="${url}?v=${v}"`; }
    catch { return m; }
  })
  // 성능: 슬라이드 이미지를 data-src로 (HTML 파싱 즉시 70MB eager 로드되는 걸 원천 차단).
  // 런타임 윈도우 매니저(setWindow)가 현재±2 슬라이드만 src 부여, 나머지는 해제해 메모리 회수.
  .replace(/<img\b([^>]*?)\ssrc=/g, '<img$1 data-src=');

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
  #print-pages{display:none;}   /* 인쇄 확장 클론 컨테이너 — 화면에선 숨김, @media print(pp-on)에서만 노출 */
  /* 윈도우 밖(미로드) 이미지 = broken-icon 대신 숨김(로드되면 다시 보임) */
  img[data-src]:not([src]){visibility:hidden;}
  /* 좌우 네비 영역 */
  .nav{position:fixed;top:0;bottom:0;width:11%;border:0;background:transparent;cursor:pointer;z-index:10;
       display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity .2s;}
  body:hover .nav{opacity:.55;}
  .nav:hover{opacity:1!important;background:rgba(0,0,0,.06);}
  .nav.prev{left:0;justify-content:flex-start;padding-left:22px;}
  .nav.next{right:0;justify-content:flex-end;padding-right:22px;}
  .nav span{font-size:46px;line-height:1;text-shadow:0 1px 6px rgba(0,0,0,.5);}
  /* 편집(E) 활성 중엔 좌우 네비 영역 숨김 (페이지 이동 잠금은 JS에서) */
  body.editing .nav{display:none!important;}
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
  /* 이미지 crop 프레임 — 원본을 클립 창에 넣어 라이브 crop (round + 외곽선). 편집: Shift+드래그=이미지 이동 / 휠=확대·축소 / 모서리=창 크기 */
  .imgframe{ position:absolute; overflow:hidden; border-radius:18px;
    box-shadow:0 0 0 1.5px rgba(0,0,0,.09), 0 16px 44px rgba(0,0,0,.12); }
  .imgframe > img{ position:absolute; display:block; max-width:none; user-select:none; -webkit-user-drag:none; }
  body.editing .imgframe{ cursor:move; }
  body.editing .imgframe.sel{ outline:2px solid #E60012; outline-offset:-2px; }
  body.editing .imgframe.sel::after{ content:"모서리● 비율크기(콘텐츠 함께) · 우/하○ 창 크기만(크롭) · Shift+드래그 이동 · 휠 확대 · X 덮개"; position:absolute; left:0; top:0;
    background:#0B5FD9; color:#fff; font-size:15px; font-weight:700; padding:3px 8px; border-radius:0 0 8px 0; pointer-events:none; z-index:5; }
  /* 덮개(패치) 툴 — 슬라이드 어디든 덮는 사각형(기본 흰색, 색상 피커로 변경). 프레임 밖도 덮음. X 끄면 일반 편집으로 이동/크기/삭제 */
  .patch{ position:absolute; z-index:20; background:#fff; background-size:100% 100%; background-position:center; background-repeat:no-repeat; }
  body.erasing{ cursor:crosshair; }
  body.erasing #track, body.erasing #track *{ cursor:crosshair !important; } /* 덮개 모드: 이미지 위/밖 무관하게 커서 통일 */
  body.erasing .patch{ pointer-events:auto; outline:1px dashed rgba(11,95,217,.6); outline-offset:-1px; }
  body.editing:not(.erasing) .patch{ cursor:move; }
  body.erasing #edit-hud::after{ content:" · 덮개 ON (드래그=그리기 · Alt+클릭=삭제 · X 종료 → 이동/크기)"; color:#7FE0FF; }
  /* 덮개 툴바 (덮개 모드에서 노출) */
  #cover-bar{position:fixed;top:52px;left:50%;transform:translateX(-50%);display:none;z-index:52;
    align-items:center;gap:8px;background:rgba(0,0,0,.86);color:#fff;padding:6px 10px;border-radius:10px;
    font-size:13px;box-shadow:0 6px 24px rgba(0,0,0,.4);}
  body.erasing #cover-bar{display:flex;}
  #cover-bar .cb-lb{font-weight:700;opacity:.85;}
  #cover-bar input[type=color]{width:26px;height:22px;padding:0;border:1px solid rgba(255,255,255,.4);border-radius:5px;background:none;cursor:pointer;}
  #cover-bar .cb-btn{font:inherit;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:6px;padding:3px 9px;cursor:pointer;}
  #cover-bar .cb-btn.on{background:#0B5FD9;border-color:#0B5FD9;}
  #cover-bar .cb-hint{opacity:.6;font-size:12px;}

  /* 페이지 이동 모드 — 축소 필름스트립(앞/뒷장 노출) + 옮기는 슬라이드 강조 */
  #viewport{transition:transform .3s cubic-bezier(.45,0,.2,1);}
  body.moving #viewport{overflow:visible;}
  body.moving #track{transition:transform .28s cubic-bezier(.45,0,.2,1);}
  body.moving #track>.slide{opacity:.5;outline:2px solid rgba(0,0,0,.14);outline-offset:-2px;}
  body.moving #track>.slide.cur{opacity:1;outline:6px solid #0B5FD9;outline-offset:-6px;box-shadow:0 24px 80px rgba(0,0,0,.55);}
  #edit-hud{position:fixed;top:10px;left:50%;transform:translateX(-50%);display:none;
    background:rgba(0,0,0,.82);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;z-index:50;white-space:nowrap;}
  #rz-handle{position:fixed;width:16px;height:16px;background:#E60012;border:2px solid #fff;border-radius:50%;
    cursor:nwse-resize;z-index:51;display:none;box-shadow:0 1px 4px rgba(0,0,0,.4);} /* 채운 점 = 비율 스케일(콘텐츠 함께) */
  /* 속 빈 점 = 크롭 전용(창 크기만, 콘텐츠 고정). 좌=width · 하=height */
  .rz-crop{position:fixed;width:15px;height:15px;background:#fff;border:2px solid #E60012;border-radius:50%;
    z-index:51;display:none;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  #rz-w{cursor:ew-resize;} #rz-h{cursor:ns-resize;}
  /* 폰트·크기 동시 스케일 텍스트 블록(.sc, 표 등) — 선택 시 파란 가이드 + 좌상단 라벨(별도 요소라 스케일 영향 없음) */
  body.editing .sc.sel{ outline:2px dashed #0B5FD9; outline-offset:4px; }
  #sc-guide{position:fixed;display:none;background:#0B5FD9;color:#fff;font-size:14px;font-weight:700;
    padding:3px 9px;border-radius:8px;z-index:52;white-space:nowrap;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  /* 일반/멀티 선택 아웃라인 (imgframe·sc는 자체 아웃라인이 우선) · 그룹은 파선 */
  body.editing .sel{ outline:2px solid rgba(230,0,18,.65); outline-offset:2px; }
  body.editing .grp{ cursor:move; }
  body.editing .grp.sel{ outline:2px dashed #E60012; outline-offset:3px; }
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
    /* 인쇄에선 모든 그림자 제거 — 드롭섀도(.imgframe 등)가 회색 번짐으로 렌더됨 */
    #track *, #print-pages * { box-shadow:none !important; }
    /* 기본(Cmd+P): 현재 슬라이드(.cur) 1장만 표시 */
    #track > .slide { display:none !important; }
    #track > .slide.cur { display:block !important; width:1920px !important; height:1080px !important;
      position:relative !important; overflow:hidden; box-shadow:none !important; }
    /* 전체 모드(deck-pdf.js CLI가 body.print-all 설정): 31장 전부, 슬라이드당 1페이지 */
    body.print-all #track > .slide { display:block !important; width:1920px !important; height:1080px !important;
      position:relative !important; overflow:hidden; box-shadow:none !important;
      break-after:page; page-break-after:always; }
    body.print-all #track > .slide:last-child { break-after:auto; page-break-after:auto; }
    /* fragment: 인쇄에서도 .shown 프레임만 보이게 (Cmd+P=현재 step / PDF=프레임별 페이지) */
    .frag { opacity:0 !important; }
    .frag.shown { opacity:1 !important; }
    /* 애니메이션 확장 인쇄(pp-on): 원본 track 숨기고 프레임 클론을 페이지당 1장 */
    body.pp-on #track { display:none !important; }
    body.pp-on #print-pages { display:block !important; }
    body.pp-on #print-pages > .slide.pp { display:block !important; width:1920px !important; height:1080px !important;
      position:relative !important; overflow:hidden; box-shadow:none !important; break-after:page; page-break-after:always; }
    body.pp-on #print-pages > .slide.pp:last-child { break-after:auto; page-break-after:auto; }
    /* 편집/네비 UI는 인쇄에서 제외 */
    .nav, #counter, #fmtbar, #edit-hud, #rz-handle, .rz-crop, #sc-guide, #guide, #cover-bar,
    body.editing .nav { display:none !important; }
    /* 덮개 패치는 인쇄에도 남기되 편집 점선 테두리는 제거 */
    .patch { outline:none !important; }
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
    /* [비활성화 2026-07-05] 애니메이션 슬라이드 서브번호(base-step, 예 51-1~51-6). 애니메이션 페이지는 번호 제거로 결정 → 소스는 주석 보존.
    const curPn = slides[i].querySelector('.s-pagenum');
    if (curPn) curPn.textContent = frags[i].length ? ((i + 1) + '-' + (step + 1)) : ('' + (i + 1));
    */
    slides.forEach((s, si) => s.classList.toggle('cur', si === i)); // 인쇄(Cmd+P) = 현재 1장만
    typingBurst = false; // 페이지 전환 시 타이핑 버스트가 다음 페이지로 새지 않게
    try { localStorage.setItem('deckSlide', i); } catch(_){}  // 현재 페이지 기억
    setWindow();  // 현재±N 슬라이드 이미지만 로드, 나머지 해제
  }
  // ===== 이미지 윈도우 로딩 — 현재±2(이동모드 ±3)만 src, 나머지 해제(메모리 회수) =====
  // 마크업은 data-src만 있어 파싱 시 로드 0. 여기서 창 안 슬라이드에만 src를 부여하고 창 밖은 removeAttribute('src').
  function setWindow(){
    const r = document.body.classList.contains('moving') ? 3 : 2;   // m 모드=양옆 필름스트립 커버
    const lo = Math.max(0, i - r), hi = Math.min(N - 1, i + r);
    slides.forEach((s, si) => {
      const on = si >= lo && si <= hi;
      s.querySelectorAll('img[data-src]').forEach(img => {
        if (on){ if (!img.getAttribute('src')) img.src = img.getAttribute('data-src'); }   // 로드
        else if (img.getAttribute('src')){ img.removeAttribute('src'); }                    // 해제(디코드 메모리 회수)
      });
    });
  }
  function loadAll(){ document.querySelectorAll('img[data-src]').forEach(img => { if (!img.getAttribute('src')) img.src = img.getAttribute('data-src'); }); }
  window.__loadAllImages = loadAll;                 // 외부 PDF 익스포트 도구용(print-all 전 호출)
  // ===== PDF(전체) 인쇄용 프레임 확장 =====
  // 애니메이션(frag) 슬라이드를 "프레임별 1페이지"로 클론 → 인쇄에 모든 단계가 각각 나옴.
  //  - 접기 여부는 CLI 플래그가 아니라 페이지 자체가 선언: 슬라이드 <section>에 data-print-collapse 속성이 있으면
  //    그 애니메이션은 인쇄에서 최종 1장으로 접힘(인쇄할 때마다 동일·결정론적). 없으면 프레임 전부 펼침.
  //  - 프레임 생략: data-print-skip="1,3"(1-based 프레임)로 특정 프레임만 제외.
  //  - 애니메이션 페이지 번호는 제거(요소 없음) → 번호 라벨링 안 함. 비-애니메이션은 baked base 유지.
  //  - Cmd+P(현재 1장, print-all 아님)에는 관여 안 함 → 속도 유지.
  let __ppEl = null;
  function buildPrintPages(){
    clearPrintPages(); loadAll();
    const wrap = document.createElement('div'); wrap.id = 'print-pages';
    slides.forEach((s, si) => {
      const nf = frags[si].length;
      const collapse = s.hasAttribute('data-print-collapse');  // 페이지 자체가 인쇄 접기 여부 선언(결정론적)
      let uptos;   // 인쇄 페이지별로 보여줄 frag 개수
      if (nf === 0 || collapse){ uptos = [nf]; }               // 1페이지: 최종 상태(모든 frag)
      else {
        const skip = String(s.dataset.printSkip || '').split(',').map(x => parseInt(x, 10)).filter(Boolean);
        const keep = []; for (let f = 1; f <= nf + 1; f++){ if (!skip.includes(f)) keep.push(f); }  // f = 프레임(1..nf+1)
        uptos = (keep.length ? keep : [1]).map(f => f - 1);
      }
      // 번호: 애니메이션 페이지는 번호 제거(요소 없음) → 라벨링 안 함. 비-애니메이션은 빌드시 baked base 유지.
      uptos.forEach(upto => {
        const c = s.cloneNode(true);
        c.classList.remove('cur', 'sel'); c.classList.add('pp'); c.removeAttribute('data-idx');
        [...c.querySelectorAll('.frag')].forEach((f, fi) => f.classList.toggle('shown', fi < upto));
        c.querySelectorAll('img[data-src]').forEach(img => { if (!img.getAttribute('src')) img.src = img.getAttribute('data-src'); });
        wrap.appendChild(c);
      });
    });
    track.parentNode.appendChild(wrap); __ppEl = wrap;
    document.body.classList.add('pp-on');
    return wrap.children.length;
  }
  function clearPrintPages(){ if (__ppEl){ __ppEl.remove(); __ppEl = null; } document.body.classList.remove('pp-on'); }
  window.__buildPrintPages = buildPrintPages;   // deck-pdf.js가 page.pdf() 전에 호출(beforeprint 미발화 대비)
  window.__clearPrintPages = clearPrintPages;
  // 브라우저 Cmd+P: print-all일 때만 확장(전체 PDF). 아니면 현재 1장 그대로(loadAll 안 함 → 속도 유지).
  addEventListener('beforeprint', () => { if (document.body.classList.contains('print-all')) buildPrintPages(); });
  addEventListener('afterprint', clearPrintPages);
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
    + hkRow('L', '정렬 가이드(라인) 토글')
    + hkRow('E', '편집 모드 (Esc = 종료)')
    + hkRow('M', '페이지 이동 모드 (← → 재배치 · Enter/M 적용 · Esc 취소 · “저장”이라 말하면 소스 확정)')
    + hkRow('편집 중: 드래그·모서리·방향키', '이동 / 크기 / 미세조정 · D 복제 · Del 삭제 · ⌘Z 되돌리기')
    + hkRow('이미지 크롭(모든 이미지)', 'Shift+드래그 이동 · 휠 확대(Alt 미세) · 모서리 창크기 — 프레임 없는 이미지도 제스처 시 자동 크롭')
    + hkRow('X (편집 중) = 덮개 툴', '드래그로 사각형을 그려 가림. 툴바: <b>단색</b>=색상 피커로 채움 / <b>주변복제</b>=배경이 단색이 아닐 때(그라데이션·무늬) 바로 옆 영역을 복사해 자연스럽게 덮음. Alt+클릭=삭제 · X 끄면 클릭해 이동/크기')
    + hkRow('텍스트 더블클릭', '글자 편집 (Esc = 완료)')
    + hkRow('?', '이 도움말 열기/닫기')
    + '</table><div style="font-size:18px;color:#6E6D72;margin-top:18px;">아무 곳이나 클릭 · Esc 로 닫기</div></div>';
  document.body.appendChild(helpEl);
  function toggleHelp(){ helpEl.style.display = (helpEl.style.display === 'flex') ? 'none' : 'flex'; }
  helpEl.addEventListener('click', () => { helpEl.style.display = 'none'; });
  addEventListener('resize', fit);
  if (window.visualViewport) visualViewport.addEventListener('resize', fit); // 브라우저 줌/핀치 변화에도 재적합
  addEventListener('pageshow', fit);                                          // bfcache 복원 시 재적합
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
    const navLock = editMode || moveMode; // 편집/이동 중엔 페이지 이동 금지
    if (!navLock && /^[0-9]$/.test(e.key)) { e.preventDefault(); jumpBuf = (jumpBuf + e.key).slice(0, 3); showJump(); return; }
    if (!navLock && e.key === 'Enter' && jumpBuf) { e.preventDefault(); goTo(parseInt(jumpBuf, 10)); jumpBuf = ''; showJump(); return; }
    if (!navLock && e.key === 'Escape' && jumpBuf) { e.preventDefault(); jumpBuf = ''; showJump(); return; }
    if (!navLock && (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ')) { e.preventDefault(); next(); }
    else if (!navLock && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); prev(); }
    else if (!navLock && e.key === 'Home') { i = 0; step = 0; render(); }
    else if (!navLock && e.key === 'End') { i = N - 1; step = frags[i].length; render(); }
    else if ((e.key === 'm' || e.key === 'M') && !navLock) { e.preventDefault(); setMove(true); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFull(); }
    else if (e.key === 'l' || e.key === 'L') { document.body.classList.toggle('show-guide'); } // 가이드라인(라인의 L) — g는 그룹과 충돌해 이동
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
    setWindow(); // 이동모드=±3(양옆 필름스트립 로드) / 종료=±2 복귀
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
  const rzW = document.createElement('div'); rzW.id = 'rz-w'; rzW.className = 'rz-crop'; document.body.appendChild(rzW); // 좌측=width만(크롭, 콘텐츠 고정)
  const rzH = document.createElement('div'); rzH.id = 'rz-h'; rzH.className = 'rz-crop'; document.body.appendChild(rzH); // 하단=height만(크롭, 콘텐츠 고정)
  const scGuide = document.createElement('div'); scGuide.id = 'sc-guide'; scGuide.textContent = '＋ / － 폰트·표 크기 · 방향키 이동 · D 복제'; document.body.appendChild(scGuide); // .sc 선택 시 좌상단 가이드
  let editMode = false, sel = null, drag = null, textEditing = null;
  let selSet = new Set(); // 멀티 선택 집합 (sel = 그 중 primary/마지막)
  const cur = () => slides[i];
  const selName = el => el.id || (el.className && String(el.className).trim().split(' ')[0]) || el.tagName.toLowerCase();
  function toLeftTop(el){ el.style.left = el.offsetLeft + 'px'; el.style.top = el.offsetTop + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; }
  // 일반 <img>(프레임 없이 자기 크기로 딱 맞는 이미지)를 크롭 프레임으로 감싸 pan/zoom 가능하게 —
  // 이미 .imgframe 안이면 그대로 반환. 초기엔 프레임=이미지 크기라 외형 동일(그림자·라운딩은 원본 유지, 크롭 데코 미추가).
  function ensureCropFrame(img){
    const par = img.parentElement;
    if (par && par.classList.contains('imgframe')) return par;
    if (!par || !cur().contains(img)) return null;
    const cs = getComputedStyle(img);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') return null; // 흐름(flex/inline) 이미지는 감싸면 레이아웃 깨짐 → 제외
    const L = img.offsetLeft, T = img.offsetTop, W = img.offsetWidth, H = img.offsetHeight; // 감싸기 전 표시 박스
    const frame = document.createElement('div');
    frame.className = 'imgframe';
    frame.style.left = L + 'px'; frame.style.top = T + 'px'; frame.style.width = W + 'px'; frame.style.height = H + 'px';
    frame.style.boxShadow = 'none';                                                   // 원본 이미지엔 그림자 없었으니 추가 안 함
    frame.style.borderRadius = (cs.borderRadius && cs.borderRadius !== '0px') ? cs.borderRadius : '0px';
    par.insertBefore(frame, img); frame.appendChild(img);
    img.style.left = '0px'; img.style.top = '0px'; img.style.width = W + 'px'; img.style.height = 'auto';
    img.style.right = 'auto'; img.style.bottom = 'auto';
    return frame;
  }
  function placeHandle(){
    if (editMode && selSet.size > 1){ rz.style.display='none'; rzW.style.display='none'; rzH.style.display='none'; scGuide.style.display='none'; return; } // 멀티 선택 = 이동만(핸들 없음)
    if (editMode && sel){ const r = sel.getBoundingClientRect(); rz.style.display = 'block'; rz.style.left = (r.right - 8) + 'px'; rz.style.top = (r.bottom - 8) + 'px';
      if (sel.classList.contains('imgframe')){ // 크롭 전용 핸들: 좌측 중앙=width, 하단 중앙=height
        rzW.style.display = 'block'; rzW.style.left = (r.right - 7) + 'px';              rzW.style.top = (r.top + r.height/2 - 7) + 'px';
        rzH.style.display = 'block'; rzH.style.left = (r.left + r.width/2 - 7) + 'px';    rzH.style.top = (r.bottom - 7) + 'px';
      } else { rzW.style.display = 'none'; rzH.style.display = 'none'; }
      if (sel.classList.contains('sc')){ scGuide.style.display = 'block'; scGuide.style.left = r.left + 'px'; scGuide.style.top = (r.top - 26) + 'px'; }
      else scGuide.style.display = 'none';
    }
    else { rz.style.display = 'none'; rzW.style.display = 'none'; rzH.style.display = 'none'; scGuide.style.display = 'none'; }
  }
  function hudText(){
    if (!editMode){ hud.style.display = 'none'; return; }
    hud.style.display = 'block';
    if (selSet.size > 1){ hud.textContent = selSet.size + '개 선택 · 드래그=함께 이동 · G=그룹 묶기 · Shift/Cmd+클릭=추가·해제 · Del=모두 삭제 · Esc=선택 해제'; return; }
    if (sel && sel.classList.contains('grp')){ hud.textContent = '그룹 · 드래그=이동 · G=그룹 해제 · D 복제 · Del 삭제 · 방향키=미세'; return; }
    hud.textContent = sel
      ? selName(sel) + '  x:' + Math.round(sel.offsetLeft) + '  y:' + Math.round(sel.offsetTop) + '  w:' + Math.round(sel.offsetWidth) + '   (방향키 ⅓px·Shift 12px / 모서리=크기 / D 복제 / Del 삭제 / Cmd+클릭=멀티 / E 종료)'
      : '편집 모드: 요소 클릭→드래그 이동 · Shift/Cmd+클릭=멀티 선택 · 모서리=크기 · G=그룹 · L=가이드 · E·Esc=종료 · ?=단축키';
  }
  function select(el){ selSet.forEach(x => x.classList.remove('sel')); selSet.clear();
    if (sel) sel.classList.remove('sel'); sel = el; if (el){ el.classList.add('sel'); selSet.add(el); } placeHandle(); hudText(); }
  // 멀티 선택 토글 (Cmd/Ctrl+클릭)
  function toggleSel(el){ if (!el) return;
    if (selSet.has(el)){ selSet.delete(el); el.classList.remove('sel'); sel = selSet.size ? [...selSet][selSet.size-1] : null; }
    else { selSet.add(el); el.classList.add('sel'); sel = el; }
    placeHandle(); hudText();
  }
  // 선택 요소들을 그룹(.grp) 컨테이너로 묶기 — 바운딩 박스 계산 후 자식 재배치
  function groupSel(){
    const els = [...selSet].filter(el => el.parentElement && cur().contains(el) && el.classList.contains('slide') === false);
    if (els.length < 2) return;
    snapshot(); els.forEach(toLeftTop);
    let minL=Infinity, minT=Infinity, maxR=-Infinity, maxB=-Infinity;
    els.forEach(el => { minL=Math.min(minL,el.offsetLeft); minT=Math.min(minT,el.offsetTop);
      maxR=Math.max(maxR,el.offsetLeft+el.offsetWidth); maxB=Math.max(maxB,el.offsetTop+el.offsetHeight); });
    const grp = document.createElement('div'); grp.className='grp';
    grp.style.position='absolute'; grp.style.left=minL+'px'; grp.style.top=minT+'px';
    grp.style.width=(maxR-minL)+'px'; grp.style.height=(maxB-minT)+'px';
    cur().appendChild(grp);
    els.forEach(el => { const l=el.offsetLeft-minL, t=el.offsetTop-minT; grp.appendChild(el);
      el.style.left=l+'px'; el.style.top=t+'px'; el.style.right='auto'; el.style.bottom='auto'; });
    select(grp);
  }
  // 그룹 해제 — 자식을 부모로 되돌리고 절대좌표 복원
  function ungroupSel(g){
    snapshot(); const gl=g.offsetLeft, gt=g.offsetTop, parent=g.parentNode;
    [...g.children].forEach(el => { const l=el.offsetLeft+gl, t=el.offsetTop+gt; parent.insertBefore(el, g);
      el.style.left=l+'px'; el.style.top=t+'px'; });
    g.remove(); select(null);
  }
  function setEdit(on){ editMode = on; document.body.classList.toggle('editing', on); if (!on){ select(null); setErase(false); } placeHandle(); hudText(); }
  // 덮개(패치) 모드 — 슬라이드 아무 데나 사각형으로 덮기(기본 흰색, 색상 피커로 변경)
  let eraseMode = false;
  function setErase(on){ eraseMode = !!on && editMode; document.body.classList.toggle('erasing', eraseMode); }
  // 덮개 툴바 (색상 피커) — 덮개 모드에서 자동 노출(body.erasing CSS)
  let coverColor = '#ffffff', coverMode = 'solid';
  const coverBar = document.createElement('div'); coverBar.id = 'cover-bar';
  coverBar.innerHTML = '<span class="cb-lb">덮개</span>'
    + '<button class="cb-btn on" data-mode="solid">단색</button>'
    + '<button class="cb-btn" data-mode="ai">AI 지우개</button>'
    + '<input type="color" id="cb-color" value="#ffffff" title="단색 채움 색 (기본 흰색)">'
    + '<span id="cb-ai" style="display:none;align-items:center;gap:8px;">'
    +   '<button id="cb-brush-dn" class="cb-btn" title="브러시 작게">−</button>'
    +   '<span id="cb-brush" style="opacity:.75;">브러시 24</span>'
    +   '<button id="cb-brush-up" class="cb-btn" title="브러시 크게">＋</button>'
    +   '<button id="cb-apply" class="cb-btn" style="background:#E60012;border-color:#E60012;">적용</button>'
    +   '<button id="cb-cancel" class="cb-btn">취소</button>'
    +   '<span id="cb-status" style="opacity:.75;"></span>'
    + '</span>'
    + '<span class="cb-hint">단색: 드래그로 덮기 · AI 지우개: 지울 곳을 칠하고 적용 · Alt+클릭=덮개 삭제 · X 끄면 이동/크기</span>';
  document.body.appendChild(coverBar);
  const aiCtl = coverBar.querySelector('#cb-ai');
  coverBar.querySelectorAll('.cb-btn[data-mode]').forEach(b => b.addEventListener('click', () => {
    coverMode = b.dataset.mode;
    coverBar.querySelectorAll('.cb-btn[data-mode]').forEach(x => x.classList.toggle('on', x === b));
    aiCtl.style.display = (coverMode === 'ai') ? 'inline-flex' : 'none';
    if (coverMode !== 'ai') aiCancel();
  }));
  coverBar.querySelector('#cb-color').addEventListener('input', ev => {
    coverColor = ev.target.value;
    if (sel && sel.classList.contains('patch')){ snapshot(); sel.style.background = coverColor; } // 선택된 덮개 → 단색 재색(이미지 지움)
  });
  // ===== AI 지우개 (MI-GAN inpaint · onnxruntime-web WASM, 로컬 vendored, 오프라인) =====
  // 지울 곳을 브러시로 칠하면(마스크) 모델이 주변 맥락으로 합성해 지운다. 폰 매직 이레이저와 동일 방식.
  // 모델·런타임은 최초 사용 시에만 lazy 로드(덱 초기 로딩 영향 0). 마스크 극성: 지울곳=0, 유지=255(MI-GAN 규약).
  let aiBrush = 24, aiSession = null, aiLoading = null, aiMask = null;
  const aiStatus = m => { const s = coverBar.querySelector('#cb-status'); if (s) s.textContent = m || ''; };
  function loadScript(src){ return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script load ' + src)); document.head.appendChild(s); }); }
  function ensureAI(){
    if (aiSession) return Promise.resolve(aiSession);
    if (aiLoading) return aiLoading;
    aiLoading = (async () => {
      aiStatus('모델 로딩…(최초 1회, ~28MB)');
      if (!window.ort) await loadScript('/html/vendor/ort/ort.wasm.min.js');
      ort.env.wasm.wasmPaths = '/html/vendor/ort/'; ort.env.wasm.numThreads = 1;
      aiSession = await ort.InferenceSession.create('/html/vendor/migan_pipeline_v2.onnx', { executionProviders: ['wasm'] });
      aiStatus(''); return aiSession;
    })();
    return aiLoading;
  }
  function aiCancel(){ if (aiMask){ aiMask.canvas.remove(); aiMask = null; } aiStatus(''); }
  function aiBegin(img){
    aiCancel();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;                 // 내부 해상도 = 원본(마스크 정밀도)
    c.style.cssText = 'position:absolute;z-index:26;pointer-events:none;left:' + img.offsetLeft + 'px;top:' + img.offsetTop + 'px;width:' + img.offsetWidth + 'px;height:' + img.offsetHeight + 'px;';
    img.parentElement.appendChild(c);                                        // 이미지와 같은 부모·같은 박스에 겹침
    aiMask = { img, canvas: c, ctx: c.getContext('2d'), painted: false };
  }
  function aiPaintAt(clientX, clientY){
    if (!aiMask) return;
    const r = aiMask.canvas.getBoundingClientRect();
    const nx = (clientX - r.left) / r.width * aiMask.canvas.width;
    const ny = (clientY - r.top) / r.height * aiMask.canvas.height;
    const nr = aiBrush / r.width * aiMask.canvas.width;                       // 브러시 반경(화면px) → 원본px
    const g = aiMask.ctx; g.fillStyle = 'rgba(230,0,18,.5)';
    g.beginPath(); g.arc(nx, ny, nr, 0, Math.PI * 2); g.fill();
    aiMask.painted = true;
  }
  async function aiApply(){
    if (!aiMask || !aiMask.painted){ aiStatus('먼저 지울 곳을 칠하세요'); return; }
    const img = aiMask.img, nW = img.naturalWidth, nH = img.naturalHeight, plane = nW * nH;
    try {
      const sess = await ensureAI();
      aiStatus('지우는 중…');
      await new Promise(r => setTimeout(r, 20));                             // 상태 렌더 양보
      const ic = document.createElement('canvas'); ic.width = nW; ic.height = nH;
      const ig = ic.getContext('2d'); ig.drawImage(img, 0, 0, nW, nH);
      const id = ig.getImageData(0, 0, nW, nH).data;
      const rgb = new Uint8Array(3 * plane);                                 // 이미지 → uint8 CHW RGB
      for (let p = 0; p < plane; p++){ rgb[p] = id[p*4]; rgb[plane+p] = id[p*4+1]; rgb[2*plane+p] = id[p*4+2]; }
      const md = aiMask.ctx.getImageData(0, 0, nW, nH).data;
      const mask = new Uint8Array(plane);                                    // 칠한 곳(alpha>20)=hole=0, 나머지=keep=255
      for (let p = 0; p < plane; p++){ mask[p] = md[p*4+3] > 20 ? 0 : 255; }
      const feed = {};
      feed[sess.inputNames[0]] = new ort.Tensor('uint8', rgb, [1, 3, nH, nW]);
      feed[sess.inputNames[1]] = new ort.Tensor('uint8', mask, [1, 1, nH, nW]);
      const out = await sess.run(feed);
      const rd = out[sess.outputNames[0]].data;                             // [1,3,nH,nW] uint8 CHW (전체 블렌드 완료)
      const oc = document.createElement('canvas'); oc.width = nW; oc.height = nH;
      const og = oc.getContext('2d'); const oi = og.createImageData(nW, nH);
      for (let p = 0; p < plane; p++){ oi.data[p*4] = rd[p]; oi.data[p*4+1] = rd[plane+p]; oi.data[p*4+2] = rd[2*plane+p]; oi.data[p*4+3] = 255; }
      og.putImageData(oi, 0, 0);
      const url = oc.toDataURL('image/png');
      snapshot();
      img.src = url; img.setAttribute('data-src', url);                     // 윈도우 로딩이 원본으로 되돌리지 않게 data-src도 갱신
      aiCancel();
    } catch(err){ aiStatus('실패: ' + (err && err.message || err)); }
  }
  coverBar.querySelector('#cb-apply').addEventListener('click', aiApply);
  coverBar.querySelector('#cb-cancel').addEventListener('click', aiCancel);
  const aiBrushLbl = () => { const b = coverBar.querySelector('#cb-brush'); if (b) b.textContent = '브러시 ' + aiBrush; };
  coverBar.querySelector('#cb-brush-dn').addEventListener('click', () => { aiBrush = Math.max(6, aiBrush - 6); aiBrushLbl(); });
  coverBar.querySelector('#cb-brush-up').addEventListener('click', () => { aiBrush = Math.min(80, aiBrush + 6); aiBrushLbl(); });
  // 덮개 대상 이미지 = 선택된 이미지(frame/img) 우선, 없으면 포인터 아래 이미지. (덮개는 "그 이미지를 수정"하는 용)
  function coverTargetImg(clientX, clientY){
    let el = null;
    if (sel && sel.classList.contains('imgframe')) el = sel;
    else if (sel && sel.tagName === 'IMG') el = sel.parentElement.classList.contains('imgframe') ? sel.parentElement : sel;
    if (!el){ const t = document.elementFromPoint(clientX, clientY); const im = t && t.closest && t.closest('.slide img'); if (im && cur().contains(im)) el = im.parentElement.classList.contains('imgframe') ? im.parentElement : im; }
    return (el && cur().contains(el)) ? el : null;
  }
  // 덮개 박스를 대상 이미지 영역으로 클립(박스는 밖까지 그려도 실제 덮이는 건 이미지 안쪽만). 겹침 없으면 제거.
  function clampPatchToImage(pt, el, sl){
    const er = el.getBoundingClientRect(), sr = sl.getBoundingClientRect(), s = sr.width / sl.offsetWidth; // 대상 slide-space rect
    const L = (er.left - sr.left)/s, T = (er.top - sr.top)/s, R = (er.right - sr.left)/s, B = (er.bottom - sr.top)/s;
    const nl = Math.max(pt.offsetLeft, L), nt = Math.max(pt.offsetTop, T);
    const nr = Math.min(pt.offsetLeft + pt.offsetWidth, R), nb = Math.min(pt.offsetTop + pt.offsetHeight, B);
    if (nr - nl < 3 || nb - nt < 3){ pt.remove(); return; }             // 이미지와 안 겹치면 덮개 취소
    pt.style.left = Math.round(nl)+'px'; pt.style.top = Math.round(nt)+'px';
    pt.style.width = Math.round(nr - nl)+'px'; pt.style.height = Math.round(nb - nt)+'px';
  }
  // ===== 덮개(patch)를 이미지 콘텐츠에 고정 — 프레임 자식으로 두고 이미지 대비 비율(ratio) 저장 =====
  // 이미지가 이동/확대/축소/pan/휠 되면 그 비율로 덮개를 재계산 → 사실상 이미지의 일부처럼 함께 움직인다.
  function frameImg(fr){ return fr && fr.querySelector(':scope > img'); }
  function setPatchRatios(pt, fr){ const im = frameImg(fr); if(!im) return;
    const w = im.offsetWidth||1, h = im.offsetHeight||1;
    pt.dataset.rl = (pt.offsetLeft - im.offsetLeft)/w; pt.dataset.rt = (pt.offsetTop - im.offsetTop)/h;
    pt.dataset.rw = pt.offsetWidth/w; pt.dataset.rh = pt.offsetHeight/h;
  }
  function syncFramePatches(fr){ const im = frameImg(fr); if(!im) return;
    const w = im.offsetWidth, h = im.offsetHeight, il = im.offsetLeft, it = im.offsetTop;
    fr.querySelectorAll(':scope > .patch').forEach(pt => {
      if (pt.dataset.rw == null) return;
      pt.style.left  = Math.round(il + parseFloat(pt.dataset.rl)*w)+'px';
      pt.style.top   = Math.round(it + parseFloat(pt.dataset.rt)*h)+'px';
      pt.style.width = Math.round(parseFloat(pt.dataset.rw)*w)+'px';
      pt.style.height= Math.round(parseFloat(pt.dataset.rh)*h)+'px';
    });
  }

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
    textEditing = null; sel = null; selSet.clear(); savedRange = null; drag = null; typingBurst = false;
    document.body.classList.remove('text-editing');
    rz.style.display = 'none'; fmtbar.classList.remove('on');
    placeHandle(); hudText();
  }
  function undo(){ const sl = cur(); const h = sl && hist.get(sl); if(!h || !h.u.length) return; h.r.push(sl.innerHTML); sl.innerHTML = h.u.pop(); afterRestore(); }
  function redo(){ const sl = cur(); const h = sl && hist.get(sl); if(!h || !h.r.length) return; h.u.push(sl.innerHTML); sl.innerHTML = h.r.pop(); afterRestore(); }
  function hasHist(){ const h = hist.get(cur()); return !!h && (h.u.length || h.r.length); }
  // 편집된 페이지 파악(저장 누락 방지) — undo 스택이 비지 않은 슬라이드 = 이 세션에 편집됨.
  //   상세 히스토리 불필요: "편집됨" 여부만. 저장 도구(save-live-edits.js)가 각 페이지 최종 상태로 소스를 덮는다.
  //   경량 리스트만 반환(html 미포함) → 토큰 절약. 최종 outerHTML 은 도구가 페이지별로 따로 읽음.
  window.__deckEdits = () => [...hist.entries()]
    .filter(([sl, h]) => h && h.u.length)
    .map(([sl, h]) => ({ id: sl.id, idx: +sl.dataset.idx, edits: h.u.length }));
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
    // 덮개: 빈 곳 드래그=슬라이드에 사각형 덮기 / Alt+클릭=기존 덮개 삭제
    if (eraseMode){
      const sl = cur(); if (!sl){ e.preventDefault(); return; }
      const p = e.target.closest('.patch');
      if (p && sl.contains(p) && e.altKey){ snapshot(); if (p === sel) select(null); p.remove(); e.preventDefault(); return; }
      if (coverMode === 'ai'){                                   // AI 지우개: 이미지 위에 지울 마스크 칠하기
        const im = e.target.closest('img');
        if (im && sl.contains(im) && im.naturalWidth){
          if (!aiMask || aiMask.img !== im) aiBegin(im);
          aiPaintAt(e.clientX, e.clientY);
          drag = { mode:'aimask' };
        }
        e.preventDefault(); return;
      }
      snapshot();
      const sr = sl.getBoundingClientRect(), s = sr.width / sl.offsetWidth; // 슬라이드 실측 스케일 = 커서 정확
      const px = (e.clientX - sr.left)/s, py = (e.clientY - sr.top)/s;
      const pt = document.createElement('div'); pt.className = 'patch';
      pt.style.left = Math.round(px)+'px'; pt.style.top = Math.round(py)+'px'; pt.style.width = '0px'; pt.style.height = '0px';
      pt.style.background = coverColor;
      sl.appendChild(pt); // 슬라이드 직속(드래그 중엔 밖까지 그려짐) — 실제 덮이는 영역은 pointerup에서 대상 이미지로 클립
      drag = { mode:'cover', el:pt, ox:px, oy:py, sr, s, sl, tf: coverTargetImg(e.clientX, e.clientY) };
      e.preventDefault(); return;
    }
    if (e.target === rz){ if (!sel) return; snapshot(); drag = { mode:'rz', el:sel, sx:e.clientX, sy:e.clientY, bw:sel.offsetWidth, bh:sel.offsetHeight, s:getScale() };
      if (sel.classList.contains('imgframe')){ const im = sel.querySelector('img'); if (im){ drag.im = im; drag.iw = im.offsetWidth; drag.il = im.offsetLeft; drag.it = im.offsetTop; } } // 프레임 리사이즈 = 내부 이미지도 같은 배율로 스케일하기 위해 기준값 저장
      e.preventDefault(); return; }
    if (e.target === rzW){ if (!sel) return; snapshot(); drag = { mode:'rzw', el:sel, sx:e.clientX, bw:sel.offsetWidth, s:getScale() }; e.preventDefault(); return; } // 우측 핸들: width만(크롭, 왼쪽 가장자리 고정, 콘텐츠 고정)
    if (e.target === rzH){ if (!sel) return; snapshot(); drag = { mode:'rzh', el:sel, sy:e.clientY, bh:sel.offsetHeight, s:getScale() }; e.preventDefault(); return; } // 하단 핸들: height만(크롭)
    // Shift+드래그 = 내부 이미지 pan(이동). 프레임 없는 일반 이미지면 즉석에서 프레임을 씌워 동일 적용
    if (e.shiftKey){
      const frameEl0 = e.target.closest('.imgframe');
      const plainImg = frameEl0 ? null : e.target.closest('.slide img');
      const anchor = frameEl0 || plainImg;
      if (anchor && cur().contains(anchor)){
        snapshot();
        const frameEl = frameEl0 || ensureCropFrame(plainImg);
        const img = frameEl && frameEl.querySelector('img');
        if (img){
          select(frameEl);
          img.style.left = img.offsetLeft + 'px'; img.style.top = img.offsetTop + 'px';
          drag = { mode:'pan', img, sx:e.clientX, sy:e.clientY, bl:img.offsetLeft, bt:img.offsetTop, s:getScale() };
          e.preventDefault(); return;
        }
      }
    }
    // 이미지 클릭 = 크롭 프레임으로 감싸 선택(100% fit 이미지도 가이드 표시·크롭·덮개 대상화). 흐름(flex) 이미지는 ensureCropFrame이 제외.
    const cim = e.target.closest('.slide img');
    if (cim && cur().contains(cim) && !cim.parentElement.classList.contains('imgframe')) ensureCropFrame(cim);
    const el = e.target.closest('.slide > *');
    if (!el || !cur().contains(el)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey){ toggleSel(el); e.preventDefault(); return; } // Shift/Cmd/Ctrl+클릭 = 멀티 선택 토글
    if (selSet.has(el) && selSet.size > 1){ // 멀티 선택된 요소 클릭 = 전체 함께 이동
      snapshot(); [...selSet].forEach(toLeftTop);
      drag = { mode:'mv', el, sx:e.clientX, sy:e.clientY, s:getScale(), multi:[...selSet].map(x=>({el:x, bl:x.offsetLeft, bt:x.offsetTop})) };
      e.preventDefault(); return;
    }
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
    if (drag.mode === 'aimask'){ aiPaintAt(e.clientX, e.clientY); return; } // AI 지우개 마스크 칠하기
    if (drag.mode === 'cover'){ // 덮개 사각형 크기 조절(슬라이드 로컬 좌표)
      const px = (e.clientX - drag.sr.left)/drag.s, py = (e.clientY - drag.sr.top)/drag.s;
      drag.el.style.left = Math.round(Math.min(px, drag.ox))+'px'; drag.el.style.top = Math.round(Math.min(py, drag.oy))+'px';
      drag.el.style.width = Math.round(Math.abs(px - drag.ox))+'px'; drag.el.style.height = Math.round(Math.abs(py - drag.oy))+'px';
      return;
    }
    if (drag.mode === 'rzw'){ // 우측 핸들: 창 width만 변경(왼쪽 가장자리 고정), 콘텐츠 고정 → 크롭
      drag.el.style.width = Math.max(60, Math.round(drag.bw + (e.clientX - drag.sx) / drag.s)) + 'px';
      placeHandle(); hudText(); return;
    }
    if (drag.mode === 'rzh'){ // 하단 핸들: 창 height만 변경(위 가장자리 고정), 콘텐츠 고정 → 크롭
      drag.el.style.height = Math.max(60, Math.round(drag.bh + (e.clientY - drag.sy) / drag.s)) + 'px';
      placeHandle(); hudText(); return;
    }
    if (drag.mode === 'pan'){ // crop 프레임 내부 이미지 이동
      drag.img.style.left = Math.round(drag.bl + (e.clientX - drag.sx) / drag.s) + 'px';
      drag.img.style.top  = Math.round(drag.bt + (e.clientY - drag.sy) / drag.s) + 'px';
      syncFramePatches(drag.img.parentElement); // 덮개도 이미지 따라 이동
    } else if (drag.mode === 'mv'){
      if (drag.multi){ // 멀티 선택: 전부 같은 델타로 이동 (스냅 없음)
        const dx = (e.clientX - drag.sx) / drag.s, dy = (e.clientY - drag.sy) / drag.s;
        drag.multi.forEach(m => { m.el.style.left = Math.round(m.bl + dx) + 'px'; m.el.style.top = Math.round(m.bt + dy) + 'px'; m.el.style.right='auto'; m.el.style.bottom='auto'; });
      } else {
        let nl = Math.round(drag.bl + (e.clientX - drag.sx) / drag.s);
        let nt = Math.round(drag.bt + (e.clientY - drag.sy) / drag.s);
        const T = e.altKey ? 0 : 8;  // Alt 누르면 스냅 끔
        if (T) { nl = snap1(nl, drag.el.offsetWidth, drag.xs, T); nt = snap1(nt, drag.el.offsetHeight, drag.ys, T); }
        drag.el.style.left = nl + 'px';
        drag.el.style.top  = nt + 'px';
      }
    } else if (drag.el.classList.contains('imgframe')){
      if (drag.im && !e.altKey){ // 기본: 프레임+내부 이미지를 같은 배율로 비율 스케일 (콘텐츠와 함께 커지고 작아짐) — 이후 휠로 미세 조정
        const nw = Math.max(60, drag.bw + (e.clientX - drag.sx) / drag.s);
        const k = nw / drag.bw;
        drag.el.style.width  = Math.round(nw) + 'px';
        drag.el.style.height = Math.round(drag.bh * k) + 'px';
        drag.im.style.width  = Math.round(drag.iw * k) + 'px';
        drag.im.style.left   = Math.round(drag.il * k) + 'px';
        drag.im.style.top    = Math.round(drag.it * k) + 'px';
        syncFramePatches(drag.el); // 덮개도 같은 배율로 스케일
      } else { // Alt: 프레임(크롭 창)만 양방향 자유 크기 (콘텐츠 고정)
        drag.el.style.width  = Math.max(60, Math.round(drag.bw + (e.clientX - drag.sx) / drag.s)) + 'px';
        drag.el.style.height = Math.max(60, Math.round(drag.bh + (e.clientY - drag.sy) / drag.s)) + 'px';
      }
    } else if (drag.el.classList.contains('patch')){ // 덮개 사각형 자유 크기(양방향, 작게도)
      drag.el.style.width  = Math.max(6, Math.round(drag.bw + (e.clientX - drag.sx) / drag.s)) + 'px';
      drag.el.style.height = Math.max(6, Math.round(drag.bh + (e.clientY - drag.sy) / drag.s)) + 'px';
    } else {
      drag.el.style.width = Math.max(40, Math.round(drag.bw + (e.clientX - drag.sx) / drag.s)) + 'px';
      if (drag.el.tagName === 'IMG') drag.el.style.height = 'auto';
    }
    placeHandle(); hudText();
  });
  addEventListener('pointerup', () => {
    if (drag && drag.mode === 'cover'){ // 덮개(단색) 그리기 종료
      if (drag.el.offsetWidth < 4 || drag.el.offsetHeight < 4) drag.el.remove();       // 클릭 수준=제거
      else if (drag.tf){ clampPatchToImage(drag.el, drag.tf, cur());                   // 대상 이미지 안쪽으로 클립
        const pt = drag.el;
        if (pt.isConnected && drag.tf.classList.contains('imgframe') && pt.parentElement !== drag.tf){ // 프레임 자식으로 이동 → 이미지에 고정
          const nl = pt.offsetLeft - drag.tf.offsetLeft, nt = pt.offsetTop - drag.tf.offsetTop;
          drag.tf.appendChild(pt); pt.style.left = Math.round(nl)+'px'; pt.style.top = Math.round(nt)+'px';
          setPatchRatios(pt, drag.tf);
        }
      }
    }
    if (drag && drag.autoGuide) document.body.classList.remove('show-guide');
    drag = null;
  });

  // ===== crop 프레임: 휠 = 내부 이미지 확대/축소 (커서 지점 고정) =====
  let wheelBurst = false, wheelT = null;
  addEventListener('wheel', e => {
    if (!editMode) return;
    let frame = e.target.closest && e.target.closest('.imgframe');
    let plainImg = null;
    if (frame){ if (!cur().contains(frame)) return; }
    else { plainImg = e.target.closest && e.target.closest('.slide img'); if (!(plainImg && cur().contains(plainImg))) return; }
    e.preventDefault();
    if (!wheelBurst){ snapshot(); wheelBurst = true; } // 휠 연속 = 스냅샷 1회 (프레임 씌우기 전에 스냅샷)
    clearTimeout(wheelT); wheelT = setTimeout(() => { wheelBurst = false; }, 500);
    if (!frame) frame = ensureCropFrame(plainImg);          // 프레임 없는 일반 이미지 → 즉석 프레임
    if (!frame) return;
    const img = frame.querySelector('img'); if (!img) return;
    select(frame);
    const s = getScale(), fr = frame.getBoundingClientRect();
    const cx = (e.clientX - fr.left) / s, cy = (e.clientY - fr.top) / s; // 프레임 로컬 좌표(1x)
    const oldW = img.offsetWidth, il = img.offsetLeft, it = img.offsetTop;
    const step = e.altKey ? 1.012 : 1.045;              // Alt = 미세(느린) 줌
    const factor = e.deltaY < 0 ? step : 1/step;
    const newW = Math.max(80, Math.round(oldW * factor)), ratio = newW / oldW;
    img.style.width = newW + 'px';
    img.style.left = Math.round(cx - (cx - il) * ratio) + 'px'; // 커서 아래 지점 고정
    img.style.top  = Math.round(cy - (cy - it) * ratio) + 'px';
    syncFramePatches(frame); // 덮개도 이미지와 함께 확대/축소
    placeHandle();
  }, { passive:false });
  addEventListener('keydown', e => {
    if (textEditing) return; // 텍스트 편집 중엔 방향키/단축키 대신 타이핑
    if (e.key === 'e' || e.key === 'E'){ setEdit(!editMode); e.preventDefault(); e.stopPropagation(); return; }
    if ((e.key === 'x' || e.key === 'X') && editMode){ setErase(!eraseMode); e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Escape' && eraseMode){ setErase(false); e.preventDefault(); e.stopPropagation(); return; }
    if (e.key === 'Escape' && editMode){ if (selSet.size){ select(null); } else setEdit(false); e.preventDefault(); e.stopPropagation(); return; }
    if (!editMode || !sel) return;
    // 그룹 묶기/해제 (G) — 멀티 선택이면 그룹으로 묶고, 그룹 선택이면 해제
    if (e.key === 'g' || e.key === 'G'){
      if (sel.classList.contains('grp')) ungroupSel(sel);
      else if (selSet.size >= 2) groupSel();
      e.preventDefault(); e.stopPropagation(); return;
    }
    // 선택 컴포넌트 삭제 (Delete/Backspace) — 멀티면 전부. snapshot으로 Cmd+Z 복원 가능
    if (e.key === 'Delete' || e.key === 'Backspace'){
      snapshot(); const victims = selSet.size ? [...selSet] : [sel]; select(null); victims.forEach(v => v && v.remove());
      placeHandle(); hudText(); e.preventDefault(); e.stopPropagation(); return;
    }
    // 선택 컴포넌트 복제 (D 또는 ⌘/Ctrl+D) — 같은 슬라이드에 +24px 오프셋, 복제본 선택
    if (e.key === 'd' || e.key === 'D'){
      snapshot();
      toLeftTop(sel);                          // 원본을 인라인 left/top으로 확정(복제본이 좌표를 가짐)
      const clone = sel.cloneNode(true);
      clone.classList.remove('sel');
      if (clone.id) clone.removeAttribute('id');
      clone.style.left = (sel.offsetLeft + 24) + 'px';
      clone.style.top  = (sel.offsetTop + 24) + 'px';
      sel.parentNode.insertBefore(clone, sel.nextSibling);
      select(clone);
      placeHandle(); hudText(); e.preventDefault(); e.stopPropagation(); return;
    }
    // .sc 텍스트 블록(표 등): +/- 로 폰트·표 전체를 동시에 비율 스케일 (transform-origin 좌상단 → 위치 고정)
    if (sel.classList.contains('sc') && (e.key==='+'||e.key==='='||e.key==='-'||e.key==='_')){
      snapshot();
      let k = parseFloat(sel.dataset.scale)||1;
      k = (e.key==='-'||e.key==='_') ? Math.max(0.4, k/1.08) : Math.min(3, k*1.08);
      sel.dataset.scale = k; sel.style.transformOrigin = 'top left'; sel.style.transform = 'scale('+k.toFixed(3)+')';
      placeHandle(); hudText(); e.preventDefault(); e.stopPropagation(); return;
    }
    const isArrow = e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown';
    if (isArrow && !e.repeat) snapshot();
    const st = e.shiftKey ? 12 : (1/3); let u = true;   // 미세이동 3배 더 미세(1px→⅓px), Shift=12px 보통
    if (isArrow){
      const r2 = v => Math.round(v * 100) / 100;
      let dx=0, dy=0;
      if (e.key === 'ArrowLeft') dx=-st; else if (e.key === 'ArrowRight') dx=st;
      else if (e.key === 'ArrowUp') dy=-st; else if (e.key === 'ArrowDown') dy=st;
      (selSet.size ? [...selSet] : [sel]).forEach(el => { // 멀티 선택이면 전부 함께
        if (!el.style.left) el.style.left = el.offsetLeft + 'px';  // 소수 누적 유지(offset 재반올림 방지)
        if (!el.style.top)  el.style.top  = el.offsetTop + 'px';
        el.style.right = 'auto'; el.style.bottom = 'auto';
        el.style.left = r2((parseFloat(el.style.left) || 0) + dx) + 'px';
        el.style.top  = r2((parseFloat(el.style.top)  || 0) + dy) + 'px';
      });
    } else u = false;
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
