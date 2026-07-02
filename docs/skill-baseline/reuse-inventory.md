# 재사용 인벤토리 + baseline 안내 — 슬라이드 생성 스킬

> 이 `skill-baseline/` = 스킬 구현의 출발점. 흩어진 원본을 SSOT-정합해 모음(일관성·누락방지·토큰절약).
> 스킬 짓기 = 여기서 시작. 원본(673줄 디자인시스템·gen 스크립트 등) 재독 불필요.

## baseline 구성

```
docs/skill-baseline/
├─ design-system-SSOT.md        정합된 디자인 시스템 단일 진실 (색·타입·그리드·컴포넌트·아키타입·일러스트 프롬프트·푸터)
├─ pipeline-and-automation.md   2트랙·HTML 재구성 작전(정합)·ChatGPT 자동화(CDP 규칙·전략·회수·crop)·deck
├─ reuse-inventory.md           (이 문서) 전체 자산 매핑
├─ assets/
│   └─ components.css           마스터 CSS (최신 진실, verbatim)
└─ scripts/                     재사용 범용 스크립트 (verbatim 복사)
    ├─ build-deck.js  crop_illust.py  deck-snap.sh
    └─ cgpt/ _pw.js build-prompts.js loop.js gen-dedicated.js gen-singlechat.js
             shot-html.js deck-detect.js deck-save-all.js deck-pdf.js deck.js deck-goto.js deck-diff2.js
```

상위 설계 의도·장르·범용/로컬 철학 = `docs/slide-gen-skill-design.md`.

## 전체 자산 매핑

### 문서 (repo 루트)

| 원본 | 판정 | 처리 |
|---|---|---|
| `슬라이드-디자인-시스템.md` (673줄) | 재사용(정합 필요) | → design-system-SSOT.md로 수렴(코랄→원색·64/36→84/43). 원본은 로컬 유지·정합 |
| `html/components.css` | 재사용(최신 진실) | baseline/assets/에 복사. 마스터 정본 |
| `이미지-제작-가이드.md` | 재사용 | 일러스트 프리픽스 3변형 → SSOT §6. 페이지별 프롬프트는 로컬(강연 특화) |
| `강연-슬라이드-구성안.md` | 로컬(강연 특화) | 이 강연 콘텐츠. 스킬 아님 |
| `슬라이드-디자이너-페르소나.md` | 재사용(원칙만) | 절제·구조 규칙 → SSOT. "고정 포맷"은 "아키타입+리듬"으로 완화 |
| `docs/slide-rebuild-spec.md` | 재사용(정합 필요) | → pipeline §2로 정합(slides.css→components.css, 76/36→마스터 참조) |
| `핸드아웃-*.md` (5종) | 로컬(강연 산출물) | 스킬 무관 |

### 스크립트 (범용 = baseline/scripts/에 복사됨)

| 스크립트 | 역할 | Tier |
|---|---|---|
| `build-deck.js` | Pxx.html → deck 조립(편집기 내장) | 1 필수 |
| `components.css`(assets) | 마스터 토큰·컴포넌트 | 1 필수 |
| `crop_illust.py` | 일러스트 bbox crop + 투명화 | 2 |
| `_pw.js` | playwright 경로 해석(vmux 우회) | 2 |
| `build-prompts.js` | 구성안→프롬프트 조립 | 2 (정합: §44 모순 삭제) |
| `loop.js`/`gen-dedicated.js`/`gen-singlechat.js` | 생성 전략 3종 | 2 |
| `shot-html.js` | Pxx.html → 1920×1080 캡처 | 2 |
| `deck-detect.js`/`deck-save-all.js`/`deck-snap.sh` | 라이브 편집 감지→소스 반영→증명 | 2 |
| `deck-pdf.js` | 전체 벡터 PDF | 3 |
| `deck.js`/`deck-goto.js`/`deck-diff2.js` | deck 제어·네비·diff | 3 보조 |

### 스크립트 (로컬 = 로컬 rules로, 범용 스킬 아님)

| 스크립트 | 이유 |
|---|---|
| `check_slide_coverage.js` | P30~86 페이지 범위 하드코딩 |
| `gen-timeline.js` | P31 4패널 전용 |

### 스크립트 (삭제 = 안 쓰는 잔재)

| 스크립트 | 이유 |
|---|---|
| `render_slides.py` | 구형 PIL 렌더(하이브리드 전환으로 폐기) |
| `shot-live.js` | deck-goto.js 상위호환 |
| `deck-nav.js` | deck.js open 상위호환 |
| `deck-key.js` | deck.js state/goto로 충분 |
| `download-last.js` | gen-*.js 내부에 동일 로직 |

## 다음 단계 (이 baseline 기준)

1. **SSOT 정합 반영** (원본 3문서를 baseline SSOT에 맞춤): `슬라이드-디자인-시스템.md` 코랄→원색·64/36→84/43, `slide-rebuild-spec.md` slides.css→components.css·값→참조, `build-prompts.js` §44 모순 삭제.
2. **잔재 삭제** (위 5개) + 로컬 스크립트 2개 → 로컬 rules.
3. **스킬 골격** = baseline 4문서 + scripts를 cowork-gen-studio로 이식(범용판), 로컬은 repo 유지.
