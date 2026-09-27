# 핸드아웃 — 자율형 바이브코딩 ② 중급 (Dynamic)

> 3부작 중 2부 · 배포·자습용. **[초급] → 중급 → [고급]** 순으로 누적·심화. 초급 내용을 안다고 전제하고, 그 위에 쌓는다.
> bkit(AI Native Development OS · Apache-2.0 · DubDubDub Corp.) 소스 딥리서치 기반.
> **이 문서의 한 줄**: *자율 폭을 넓힐수록 기획 입력의 질이 결과를 좌우한다(Garbage in, garbage out). 중급의 목표는 "팀을 부리고, 자율을 벌어서 올리는 것."*

---

## 0. 초급 복습 (30초)

- 자율형 ≠ 방치형. 3철학 = **Automation First · No Guessing · Docs=Code.**
- 자율주행 3조건 = **박제(설계 단일입력) · 검증루프(matchRate 자가수복) · 게이트(위험만 멈춤).**
- 요청은 기능 단위(≥Feature)로. 짧으면 공정이 안 걸린다.
- 초급 환경 = `acceptEdits` + L2. **중급은 여기서 자율을 올린다.**

---

## 1. PDCA 9단계 전체 (중급은 흐름을 이해한다)

초급은 4명령만 봤지만, 그 뒤에서 도는 전체 공정은 이렇다.

```
idle → PM → Plan → Design → Do → Check ⇄ Act(자가수복, 최대 5회) → QA → Report → archived
                                     ↑________ matchRate < 임계 ________↓
```

| 단계 | 명령 | 산출물 | 무엇을 하나 |
|---|---|---|---|
| **PM** | `/pdca pm` | `docs/00-pm/*.prd.md` | 제품 발굴 → PRD 생성 (43개 PM 프레임워크) |
| **Plan** | `/pdca plan` | `docs/01-plan/` | 목표·범위·성공기준 + **Context Anchor** |
| **Design** | `/pdca design` | `docs/02-design/` | 아키텍처 **3안 제시 → 택1**(유일한 필수 입력) |
| **Do** | `/pdca do` · `/pdca team` | 코드 | 설계대로 구현 |
| **Check** | `/pdca analyze` | `docs/03-analysis/` | 설계↔구현 갭 측정 → **matchRate** |
| **Act** | `/pdca iterate` | 수복 로그 | 미달분 자동 수복 (최대 5회) |
| **QA** | `/pdca qa` | `docs/05-qa/` | L1–L5 테스트 |
| **Report** | `/pdca report` | `docs/04-report/` | 완료 리포트(KPI·교훈) |

**matchRate 임계는 레벨별로 다르다**: Starter 80% · **Dynamic 90%** · Enterprise 95%.

> **Context Anchor**: Plan 단계에서 박는 **WHY·WHO·RISK·SUCCESS·SCOPE** 5줄 요약. 이게 이후 모든 단계에 전파돼 "원래 의도"의 단일 기준이 된다. 자율주행의 나침반.

---

## 2. bkit은 어떻게 "알아서" 돕나 — 보이지 않는 2층

중급이 이해해야 할 핵심 메커니즘. 사용자는 그냥 자연어로 말할 뿐인데 bkit이 적시에 끼어드는 이유:

| 층 | 성격 | 동작 |
|---|---|---|
| **Hooks** | **Hard (무조건 실행)** | 도구 호출 *둘레*에 자동 발화 → 컨텍스트에 주입 |
| **Skills** | **Soft (Claude가 판단)** | description **의미 매칭(8개국어)**으로 자동 발동 |

→ 파일을 쓰는 순간(PreToolUse 훅) bkit이 *설계문서 참조 + 작업크기 분류 + 컨벤션 힌트*를 컨텍스트에 끼워넣고, 다 쓰면(PostToolUse) "gap 분석 돌릴까요?"를 띄운다. **이게 "적시에 올바른 컨텍스트 주입" = Context Engineering의 실전.**

- 우선순위: `feature > skill > agent`, 그리고 **Hooks > Skills**.
- 8개국어 트리거: `"로그인 만들어줘"`·`"作成新功能"` 같은 자연어로도 알맞은 스킬이 발동한다. 영어 명령을 외울 필요가 없다.

---

## 3. 환경 — 자율을 한 단계 올린다

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1   # 팀 모드 활성 (세션 시작 전 필수)
claude --permission-mode auto --enable-auto-mode # 분류기(Sonnet)가 안전 액션을 자동 허용
# bkit 자율 레벨: L3 (단, 성공 사이클 누적 후)
/dynamic
```

**권한모드 = 실행 권한 / 자율 레벨 = 공정 자율** — 두 손잡이의 곱이 개입 횟수를 정한다:

| 조합 | 한 기능당 개입(근사) | 용도 |
|---|---|---|
| `acceptEdits` + L2 | ~15회 | 초급(안전) |
| **`auto` + L3** | **~3회** | **중급 일상(균형) ★** |
| `auto` + L4 | ~1회 | 고급(위험) |

> **`auto` 모드의 분류기(Classifier, Sonnet)가 자동 허용하는 것**: 작업 폴더 내 파일 생성/수정, 선언된 의존성 설치, 읽기전용 HTTP, 본인 브랜치 push. **막는 것**: 다운로드 후 실행(`curl|sh`), 외부로 자격증명 전송, 프로덕션 배포, 대량 삭제, `main` force push. 3회 연속 거부되면 Auto 모드가 일시정지한다.

---

## 4. 기획 — 제대로 (중급의 핵심, 절대 건너뛰지 말 것)

**황금률**: 마스터플랜/설계를 *혼자 쓰지도, AI에게 냉정하게 맡기지도 마라.*
> 새 세션을 열고 → 목표·대상·리스크·의존성·불확실한 점을 **자연어로 충분히 떠든다**(AI가 반박하게) → 코드·웹을 조사시킨다 → *그제서야* 기획 명령을 친다. = "완벽한 프롬프트가 아니라, 컨텍스트를 먼저 포화시킨 뒤 bkit이 종합하게."

기획 파이프라인 (순서대로, 건너뛰지 않기):

```bash
/pdca pm login-feature     # PM 팀 4에이전트 병렬
/plan-plus login-feature   # 의도 탐색 → 대안 비교 → YAGNI
/pdca plan login-feature   # 위 결과를 Context Anchor로 박제
```

**① `/pdca pm` — PM 팀(43 프레임워크)**: `pm-lead`(Opus)가 4명을 병렬 지휘.
- `pm-discovery` — 시장·사용자 조사 (Opportunity Solution Tree, 가정 리스크)
- `pm-strategy` — 포지셔닝 (JTBD, Lean Canvas, SWOT, PESTLE, Porter's, Growth Loops)
- `pm-research` — 경쟁분석 (페르소나, TAM/SAM/SOM, Journey Map, ICP)
- `pm-prd` — 위를 종합한 8섹션 PRD (Pre-mortem, User/Job Story, Test Scenario)

**② `/plan-plus` — 브레인스토밍 강화 기획**: 의도 탐색(한 번에 한 질문) → 대안 2~3개 비교(trade-off) → **YAGNI(불필요 기능 가차없이 제거)**. 5~10분 더 쓰고 재작업 20분+ 절약. *코드 작성 전 승인 게이트(HARD).*

> **왜 이렇게까지?** 자율 폭이 클수록 AI는 "박제된 설계"만 보고 달린다. 기획이 부실하면 자율주행이 부실을 *빠르게* 증폭시킨다.

---

## 5. 개발 — 에이전트 팀 오케스트레이션

```bash
/pdca team login-feature   # CTO Lead(Opus)가 지휘 → 단일 명령으로 전 공정 자율
```

**CTO Lead의 단계별 패턴**:
| 패턴 | 단계 | 동작 |
|---|---|---|
| **Leader** | Plan·Report | CTO가 단일 에이전트 주도 |
| **Council** | Design·Check | 여러 에이전트 교차검증(합의) |
| **Swarm** | Do | 병렬 독립 구현(프론트·백·QA 동시) |
| **Pipeline** | Do→Check | 순차 의존 처리 |

- 레벨별 팀 크기: Dynamic 3명+CTO / Enterprise 5명+CTO.
- **여러 기능 병렬**(서로 다른 도메인일 때만):
```bash
/pdca-batch plan auth search payment   # 최대 3개 동시 + Auto-Queue(과부하 방지). 겹치는 코드 영역은 섞지 말 것
```

> **bkend BaaS 스킬 5종** (Dynamic 레벨의 백엔드): `bkend-quickstart·bkend-auth·bkend-data·bkend-storage·bkend-cookbook`. 로그인·DB·스토리지를 bkend.ai 위에서 즉시 처리.

---

## 6. QA — 3중 검증 (중급은 다 켠다)

bkit의 QA는 세 갈래다. 무인 비중이 클수록 전부 돌려라.

| 갈래 | 명령 | 무엇 | 포인트 |
|---|---|---|---|
| **정적** | `/code-review` | 코드를 읽어 **품질·버그·보안·성능** 사전 탐지 | **confidence 90%↑만 보고** → 노이즈 컷 |
| **동적** | `/zero-script-qa` | Docker 로그 실시간 분석 | 테스트 코드 0줄, 30%→89% 수직 상승 |
| **구조화** | `/qa-phase` | **L1 단위·L2 통합·L3 계약·L4 시스템·L5 E2E** 피라미드 | 누락 단계 자동 보강 |

**자가수복 분기**(Check 단계 후):
- matchRate **≥90%** → 리포트로
- **70–89%** → 수동/자동 선택
- **<70%** → `pdca-iterator` 자동 수복 → 재측정 (최대 5회)

> **로그 패턴(zero-script-qa)**: `ERROR`·`5xx`·`3000ms↑` = 🔴 Critical / `401·403`·`1000ms↑` = 🟡 Warning. JSON 로그 + Request ID로 전 구간 추적.

---

## 7. 자율 폭 넓히기 — Trust Score로 승급

```bash
/control trust            # Trust Score(0–100) 확인
/control level 3          # 65+면 L3 추천 (성공 사이클 3+회 후에만)
```

**Trust Score = 실적의 가중합** (벌어서 올리는 것):
| 성분 | 가중치 |
|---|---|
| PDCA 완료율 | 0.25 |
| 게이트 통과율 | 0.20 |
| 롤백 빈도(역) | 0.15 |
| 파괴적 명령 차단율 | 0.15 |
| 반복 효율 | 0.15 |
| 사용자 override(역) | 0.10 |

- **65+ → L3, 85+ → L4** 자동 추천. 단 **승급해도 11개 품질 게이트는 그대로 작동** — "불필요한 멈춤만 제거, 필요한 멈춤은 유지."
- **Safe Defaults**: bkit은 절대 풀오토로 시작하지 않는다(기본 L2).

> **Output Styles(레벨별 응답 스타일)**: `/output-style`로 `bkit-learning`(초급·학습 포인트)·`bkit-pdca-guide`(PDCA 배지·체크리스트)·`bkit-enterprise`(아키텍처 trade-off) 등 응답 형식을 바꾼다. 레벨에 맞춰 자동 추천된다.

---

## 8. 세팅 — 팀/프로젝트 맞춤

**`.claude/settings.json`** (권한 규칙):
```jsonc
{ "permissions": {
  "allow": ["Read","Edit","Bash(npm test*)","Bash(npm run build)","Bash(git log*)"],
  "deny":  ["Bash(rm -rf *)","Bash(git push --force*)","Bash(git reset --hard*)"]
}}
```
**`bkit.config.json`** (PDCA 임계):
```jsonc
{ "automation": { "defaultLevel": 2 },
  "pdca": { "matchRateThreshold": 90, "maxIterations": 5, "autoIterate": true } }
```

---

## 9. 중급 함정

| 증상 | 원인 | 대응 |
|---|---|---|
| matchRate가 90%에서 정체 | 설계가 모호/누락 | `/pdca design`을 *명시적 수용기준*과 함께 재작성 |
| 배치가 충돌 | 겹치는 코드 영역 동시 작업 | 도메인이 분리된 기능만 `/pdca-batch` |
| 분류기가 다 막음 | 권한 규칙 부족 | `.claude/settings.json` allow 추가 후 `Shift+Tab` |
| 팀 모드가 안 켜짐 | 환경변수 누락 | `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 후 재시작 |
| Trust Score가 안 오름 | override·롤백 잦음 | 게이트를 신뢰하고 *원인을 고친 뒤* 재개하는 습관 |

---

## 10. 중급 체크리스트

- [ ] `pm → plan-plus → plan` 기획 파이프라인을 **건너뛰지 않았다**
- [ ] 기획 전 컨텍스트를 자연어로 포화시켰다(황금률)
- [ ] `/pdca team`으로 병렬 구현했다 (`AGENT_TEAMS=1` 설정)
- [ ] **3중 검증**(code-review·zero-script-qa·qa-phase)을 돌렸다
- [ ] Trust Score 65+ 확인 후에만 L3로 올렸다
- [ ] 멈추면 우회하지 않고 *원인을 고친 뒤* 재개했다

---

## 다음 단계 → 고급

중급에서 *한 기능을 팀으로, 검증까지* 자율로 돌렸다면, 고급에선:
- **Sprint**로 여러 기능을 *무인 연쇄*
- **Context Sizer**(75K 토큰 분할)·**S1 7-Layer dataFlow**·**4 Auto-Pause 트리거**
- 11 Quality Gates·6축 matchRate·ENH-292 캐시 최적화 등 **내부 메커니즘 전부**
- 비가역 액션 안전(롤백·audit·배포 divergence)

→ `핸드아웃-bkit-자율형-고급.md` (우리가 파악한 모든 사실을 담은 종합편)

---

> 출처 표기 예: *"AX Lecture by DubDubDub Corp. (ww-w.ai), prepared for an invited guest lecture at KAIST — CC BY 4.0."* bkit은 DubDubDub Corp.의 오픈소스(Apache-2.0).
