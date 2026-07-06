# CUSTOMIZE — 이 덱 템플릿을 다른 프로젝트로 복사했을 때 바꿀 곳

이 저장소는 슬라이드 덱 빌더 엔진(`scripts/build-deck.js` + `scripts/cgpt/*` + `html/components.css`)이 재사용 가능한 템플릿이다. 다른 프로젝트로 복사(fork)했을 때 **바꿔야 하는 프로젝트별 값은 아래 5곳에 모여 있다.** 순서대로 훑으면 커스터마이징 끝.

경로는 이미 이식성 처리됨(`path.resolve(__dirname, …)`) → 복사 후 경로 수정 불필요.

---

## 1. 프로젝트 상수 — `scripts/deck.config.json` (단일 소스, 최우선)

빌드가 여기서 읽어 주입한다. 이 파일만 바꾸면 덱 타이틀·다운로드 파일명·푸터 브랜드·1부 렌더러 이벤트 메타가 전부 갱신된다.

| 키 | 무엇 | 예 |
|---|---|---|
| `deckTitle` | 브라우저 탭 타이틀 | "AX 강연 — 슬라이드" |
| `exportFilename` | Cmd+S 자체완결 다운로드 파일명 | "ax-lecture-deck.html" |
| `canvas` | 슬라이드 해상도(16:9) | 1920×1080 |
| `footerBrand` | **모든 슬라이드 푸터 브랜드** (빌드 시 일괄 주입) | "에이전트 수지 · sooji.ai" |
| `renderSlides.footer` | 1부 이미지 렌더러 푸터 | "주식회사 덥덥덥 · ww-w.ai" |
| `renderSlides.eventName` / `eventDateLine` | 행사명·날짜·연사 | "KAIST OverEdge" / "2026.07.07 · …" |

→ 바꾼 뒤 `node scripts/build-deck.js` 재빌드.

## 2. 디자인 색·컴포넌트 — `html/components.css` `:root`

브랜드 색은 config가 아니라 여기. 3색 트라이어드 토큰(`--c1` 빨강 / `--c2` 파랑 / `--c3` 골드 + `-deep`/`-soft` 변형) + `--text`/`--muted`/`--rule` 등. 색만 바꾸면 전 슬라이드에 반영(레이아웃 골격은 공통).
- 컴포넌트 클래스(`.s-title`·`.chip`·`.keymsg`·`.s-footer` 등)도 여기. 레이아웃까지 다른 브랜드로 갈 거면 이 파일을 갈아끼운다(참고: 클라이언트 포크는 `.s-*`를 `.d-*`/`.band`/`.panel`로 교체하고 구 시스템을 `components.ax-legacy.css`로 보존한 사례가 있음).

## 3. 슬라이드 콘텐츠 — `scripts/build-deck.js` `SLIDES` 배열 + `html/Pxx.html`

- `SLIDES` 배열(파일 상단) = 덱 구성·순서의 단일 권위. 각 항목 `{ file }` 또는 `{ img }`.
- 실제 슬라이드 = `html/Pxx.html` (스코프 스타일 + 콘텐츠). 새 슬라이드는 기존 것 복사해 편집.
- 푸터 브랜드는 소스에 "에이전트 수지 · sooji.ai"로 두면 빌드가 `footerBrand`로 치환(1번). 새 슬라이드도 이 문자열을 그대로 쓰면 자동 반영.

## 4. 이미지 생성 프롬프트 브랜드어 — `docs/skill-baseline/design-system-SSOT.md`

ChatGPT 이미지 생성 프롬프트의 브랜드/톤 지시(순수 흰 배경 강제 등)가 여기. 다른 브랜드면 프롬프트 표준을 갱신.

## 5. 라이선스·회사 표기 — `README.md`, `LICENSE-CONTENT.md`, `THIRD-PARTY-NOTICES.md`

공개 저장소로 낼 때 회사·행사·출처 표기.

---

## 안 바꿔도 되는 것 (이식성 처리 완료)

- **스크립트 경로**: `scripts/cgpt/*`·`deck-snap.sh`가 `path.resolve(__dirname, …)`(쉘은 `$(cd "$(dirname "$0")/.." && pwd)`)로 자기 위치 기준 해석 → 복사만 하면 동작. 절대경로 수정 불필요.
- **캔버스 16:9**: 바뀔 일 거의 없음(`canvas`로 열어는 둠).

## 재빌드·확인

```
node scripts/build-deck.js      # SLIDES → html/deck.html 조립 (config 주입)
```

빌드 후 `html/deck.html`을 브라우저로 열어 확인. 편집은 내장 E모드, 저장은 `scripts/cgpt/save-live-edits.js`, 자체완결 다운로드는 덱에서 Cmd+S(맥)/Ctrl+S(윈도우).
