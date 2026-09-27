# 강사용 심화 노트 — bkit 챕터 (P31~P60)

> 목적: 슬라이드에 쓰인 것보다 **훨씬 깊이** 알고 강단에 서기 위한 강사 전용 노트. 청중에게 배포하는 자료 아님.
> 근거: (1) 실제 설치본 bkit 플러그인 소스 정독 `~/.claude/plugins/marketplaces/bkit-marketplace/` (v2.1.22), (2) 로컬 핸드아웃 5종.
> 표기: **[코드]** = 플러그인 소스 직접 확인 / **[핸드아웃]** = 핸드아웃 인용 / **[추론]** = 종합 판단.
> 상태: LIVING (2026-07-02 작성). **수치는 발표 직전 현행 재확인** — bkit은 문서가 코드보다 자주 stale함(아래 §치트시트).

---

## 0. 강사가 먼저 장착할 "메타 무기"

이 강의의 최고 신뢰도 카드는 **"문서에는 X라고 쓰여 있지만, 소스를 직접 열어보면 실제는 Y다"** 라고 말할 수 있다는 것. bkit조차 문서가 코드보다 뒤처진다 — 이걸 알고 있으면 어떤 숫자 질문에도 안 막힌다.

**한 줄 테제 (외울 것)**
> "자율형 바이브코딩의 본질은 '더 많이 자동화'가 아니라 **'박제(기획)를 단단히, 검증을 다중으로, 비가역만 사람이 쥐는 것'**. bkit은 그걸 PDCA 상태머신·품질게이트·matchRate 자가수복·Sprint 무인연쇄·Defense-in-Depth로 구현한 **Context Engineering OS**다."

**AI 능력 삼분(핸드아웃 dogfooding 근거)**: 실행 99% / 분석 85% / **판단 20%** → 그래서 "실행은 AI, 판단은 인간". 이 한 줄이 강의 전체의 척추.

---

## P31 [챕터 divider] — 3. 하네스 시대의 개발 자율주행

- 다크 divider. 말로 채울 전환 멘트: "1부에서 LLM이 stateless하고 토큰이 돈이라는 걸 봤다. 이제 그 원리 위에서 **개발을 자율주행**시키는 실전 도구 = bkit."
- 연결고리: 오프닝 3레버(①만들기 ②자동화 ③자율주행) 중 **①만들기**가 이 챕터.

---

## P32 — bkit이란: 비개발자를 위한 자율 개발 하네스

### 슬라이드 한 줄
Claude Code 위 개발 OS. 44 skills · 34 agents · 100% 오픈소스·무료.

### 실제 디테일 [코드]
- 정식 정체 = **"Context Engineering의 코드 구현체"**. 프롬프트 엔지니어링(좋은 프롬프트 쓰기)이 아니라 **프롬프트·도구·상태를 통합해 LLM에 최적 컨텍스트를 주입하는 시스템**. → 강의 서사(2025 프롬프트 → 2026 콘텍스트·멀티턴·state)와 정확히 맞물림.
- 라이선스 **Apache-2.0**, 저작 **DubDubDub Corp.** (README 뱃지). CC 요구 버전 뱃지 = **v2.1.143+**.
- **전체 규모 (v2.1.22, README 실측)** [코드]:
  - **44 skills · 34 agents · 21 hook events / 24 blocks · 2 MCP 서버(19 tools, 전부 읽기전용) · 약 190 lib 모듈(22 서브디렉토리) · 61 scripts · 40 templates · 118+ 테스트파일 / 4,000+ 케이스.**
- **3대 철학**: **Automation First**(명령 몰라도 AI가 공정 적용) · **No Guessing**(모르면 문서→질문, 추측 금지) · **Docs=Code**(설계 먼저, 기계가 설계-구현 대조).

### 예상 질문 · 반박
- **Q. 그냥 Claude Code랑 뭐가 달라요?** → 바닐라는 같은 요청에도 품질이 매번 다르다. bkit은 PDCA 공정 + 품질게이트 + matchRate 자가수복으로 **품질을 고정**. 본질은 "더 많은 자동화"가 아니라 "박제·검증·게이트".
- **Q. 34 agents라는데 왜 40개 파일이 보여요?** → `pdca-eval-{pm,plan,design,do,check,act}` **6개가 v2.1.13에서 deprecated 스텁**(계약 baseline 유지용). 40 − 6 = 34. [코드]

### 데모 포인트
- P32 비주얼 = GitHub 첫 페이지 스크린샷을 **당일 직접 캡처**(stars/forks 최신 수치). `claude plugin install bkit` 한 줄이 설치 전부라는 걸 보여주기.

---

## P33 — PDCA란: bkit이 개발에 적용한 핵심 엔진

### 슬라이드 한 줄
Plan→Do→Check→Act 순환. Match Rate 90%.

### 실제 디테일 — PDCA는 "프롬프트"가 아니라 결정론적 상태머신 [코드]
소스 `lib/pdca/state-transitions.js`. **슬라이드/문서엔 "20 transitions, 9 guards"라 쓰여 있지만, 실제 코드는 25 transitions + 11 guards.** (← 가장 좋은 "문서 vs 코드" 넛지)

- **상태 11개**: `idle · pm · plan · design · do · check · act · qa · report · archived · error`
  - 주의: 실제 이름은 `archive`(동사)가 아니라 **`archived`**(종단 상태). `qa`는 v2.1.1에서 삽입.
- **디스크 영속**: 상태가 `.bkit/state/pdca-status.json`에 저장 → 세션이 꺼져도 이어짐. "프롬프트로 흉내"가 아니라 **FSM이 전이 합법성을 guard로 검증**, 실패 시 전이 거부.
- **핵심 guard (실제 조건)** [코드]:
  - `guardMatchRatePass`: `matchRate >= 90` (v2.1.10에서 100→90 하향, config `pdca.matchRateThreshold`).
  - `guardCanIterate`: `iterationCount < 5`.
  - `guardQaPass`: **`passRate >= 95 && criticalCount === 0`** — QA 통과선은 95%지 90% 아님.
  - `guardDesignApproved`: **자동화 레벨 L2 이상이면 design 문서 존재만으로 자동 승인**, L0~L1은 명시 플래그 필요. → **Trust 레벨이 FSM guard에 직접 박혀 있다** = "통제 가능한 AI"의 실제 구현부.
  - `guardStaleFeature`: 7일 비활성 → 자동 archive.

### 예상 질문 · 반박
- **Q. matchRate 임계가 90 맞아요?** → PDCA 전진은 90(config), **QA 통과는 별도로 95%+critical 0**, Sprint는 목표 100·최소 90. "임계는 상황마다 다르다"가 정답.
- **Q. PDCA가 그냥 프롬프트 아니에요?** → 아니다. 11상태·25전이·11guard의 결정론 FSM + 디스크 상태 영속. guard 실패 시 실제로 전이가 막힌다.

---

## P35 — PDCA 실제 사례: "로그인 만들어줘" 한 마디로

### 실제 디테일 — 자연어가 작동하는 "2층 메커니즘" [코드]
슬라이드는 결과만 보여주지만, 강사는 **왜 자연어 한 줄이 공정을 발동시키는지**를 알아야 한다:

1. **Hooks (Hard, 무조건 실행)**: 도구 호출 둘레에 자동 발화.
   - `UserPromptSubmit` → `user-prompt-handler.js`: 의도 감지 + **8개국어 키워드 트리거** + ambiguity score(임계 0.7).
   - `PreToolUse(Write|Edit)` → `pre-write.js`: 파일 쓰기 **직전**에 (a)권한 체크 (b)작업 크기 분류 (c)현재 PDCA phase 감지 (d)**컨벤션 힌트를 `additionalContext`로 Claude에 주입**. `decision:"block"` 반환하면 쓰기 자체가 차단.
   - `PostToolUse(Write)` → `pdca-post-write.js`: 기능명 추출 + "gap 분석 돌릴까요?" 제안.
2. **Skills (Soft, Claude 판단)**: description 의미 매칭(8개국어)으로 자동 발동. `"로그인 만들어줘"`·`"作成新功能"` 자연어로도 발동 → **영어 명령 외울 필요 없음.**
- **우선순위**: `feature > skill > agent`, 그리고 `Hooks > Skills`.

### 작업 크기 자동 분류 (청중이 "짧게 말하면 왜 공정이 안 걸려요?" 물을 때)
- <50자 = Quick(그냥 고침) / <200 = Minor / <1000 = **Feature(PDCA 권장)** / ≥1000 = Major(PDCA 필수). → 자율 개발을 원하면 **기능 단위로 충분히 묘사**.

### 데모 포인트
- 실제 흐름: `"로그인 기능 만들어줘"` → bkit이 "설계부터 만들까요?" 제안 → `login.design.md` 자동생성(POST `/auth/login`·`/logout`, GET `/auth/me`) → 구현 → "Gap Analysis 돌릴까요?" → matchRate 측정 → ≥90% 리포트 / <70% 자동수복.
- 명시적으로 하려면 `/pdca plan 로그인` — **둘 다 가능**, 자연어 발동이 포인트.
- **CP4 안전장치**: 구현 직전 `"DO NOT START IMPLEMENTATION WITHOUT USER APPROVAL"`(대문자) 승인 게이트가 하드코딩됨 [코드]. "자율형이라도 코드 쓰기 전엔 사람 승인"을 강조.

---

## P36 — Sprint 개념 ①: PDCA → Sprint 진화 (메타 컨테이너)

### 실제 디테일 [코드]
- Sprint(v2.1.13) = 1+ 기능을 **공유 scope/budget/timeline**으로 묶는 상위 컨테이너. **8-phase**: `prd(0) → plan(1) → design(2) → do(3) → iterate(4) → qa(5) → report(6) → archived(7)`.
- **PDCA와의 관계 (강사가 정확히 알 것)**: Sprint 1개 = N기능이고, **각 기능의 PDCA 9단계가 Sprint의 `do` phase 안에서 돈다.** 상태파일도 분리 — Sprint는 `.bkit/state/sprints/{id}.json`, PDCA는 `pdca-status.json`.
- **전이는 전진만(forward-only)** [코드]: PDCA는 check⇄act 되먹임이 있지만 Sprint phase는 되돌림 불가(각 phase 안에서 iterate로 반복).
- **PRD 단계가 새로 붙는다**(단일 PDCA엔 없음): 문제정의·JTBD·페르소나·성공지표·Pre-mortem·이해관계자를 Plan 앞에서 못박음 = *왜·누구를 위해*. 무인일수록 기획을 더 단단히.

### 예상 질문
- **Q. Sprint와 PDCA 차이?** → PDCA=단일 기능(9단계, check⇄act 되먹임). Sprint=여러 기능 묶는 메타컨테이너(8-phase, 전진만). 직교 공존.
- **Q. 세션 꺼지면 Sprint 날아가요?** → 아니다. Task 등록 + 상태파일 영속으로 다음 세션이 이어받음.

---

## P40 — Sprint 개념 ②: 자율주행을 받치는 측정 & 안전벨트

### 실제 디테일 — 4 Auto-Pause의 정확한 조건 [코드]
`bkit.config.json:sprint.autoPause` `armedTriggers`:

| 트리거 | 정확한 발화 조건 | 기본값 |
|---|---|---|
| `QUALITY_GATE_FAIL` | **M3 > 0 (critical 존재) OR S1 < 100 (데이터흐름 미달)** | — |
| `ITERATION_EXHAUSTED` | **iter >= 5 AND matchRate < 90** | maxIter 5 |
| `BUDGET_EXCEEDED` | `누적토큰 > budget` | **기본 1,000,000 토큰** |
| `PHASE_TIMEOUT` | `경과 > phaseTimeoutHours` | **기본 4시간** |

- **resume 메커니즘** [코드]: `/sprint resume`은 **4개 트리거를 재평가**하고, 하나라도 아직 발화 중이면 **재개를 거부**("refuses if any are still firing"). → 우회가 아니라 원인 제거 후 재개.
- **3중 무한루프 방어**: Sprint auto-pause(ITERATION_EXHAUSTED) + PDCA guard(`guardCanIterate<5`) + config loopBreaker(같은 파일 10회 / agent 재귀 3 / cooldown 60s).

### 성공지표 3축 (측정 대상)
- `matchRate` (설계↔구현, 기능별) — 단일 PDCA부터 존재.
- `S1 7-Layer dataFlow QA` (기능 **간** 통합흐름, **<100이면 멈춤**) — Sprint 신규.
- 제품·성과 지표 (PRD의 JTBD 연결, "옳은 걸 만들었나") — PRD 신규.

### 예상 질문
- **Q. 자꾸 멈추는데 버그 아니에요?** → 멈춤은 안전벨트. 우회(bypass) 말고 원인 제거 후 resume = "통제받는 자유".
- **Q. 무한루프 안 돌아요?** → 위 3중 방어 + 100만 토큰·4시간 하드 실링.

---

## P41 — Sprint 실제 사례: bkit이 자기 문서를 자율주행으로 (dogfooding)

### 실제 디테일 [핸드아웃, 저자 실측]
- 13일간: **126세션 · 260 AI-시간 · 병렬 에이전트 477개 · 최대 9,770줄 문서 · 만족도 88.4%(199/225)**.
- 팀 **11인 → 3.8인 + 에이전트(약 65%↓)**. 설계-구현 갭 **30~50% → 5% 미만**.
- 명령 예: `/sprint init v2113-docs-sync --features f0-baseline … f9-real-use-validation --trust L4` — 10개 기능, Trust L4 완전자동(archive까지).
- **"도구가 도구를 만든 자가 검증"** — bkit이 자기 v2.1.13 릴리스를 bkit Sprint로 수행.

### 수치 주의 (P41 서사 안의 "31 agents") [코드 대조]
- dogfooding 실측 당시 "3.8인 + **31 에이전트**"는 **실험 시점 수치**, 현행 릴리스는 **34 agents**. → 모순이 아니라 **성장 서사**로 프레이밍("31은 실험 당시, 34는 현재").

---

## P42 — 코딩 전 '기획서'부터: 혼자가 아니라 팀이

### 실제 디테일 [코드 + 핸드아웃]
- **`/pdca pm` = PM팀 5에이전트** (`pm-lead`=opus가 4명 병렬 지휘), **43개 PM 프레임워크**:
  - `pm-discovery` — Opportunity Solution Tree(Teresa Torres), 가정 리스크
  - `pm-strategy` — JTBD 6-part, Lean Canvas, SWOT, PESTLE, Porter's 5, Growth Loops
  - `pm-research` — 3 페르소나 + 5 경쟁사 + TAM/SAM/SOM + Journey Map + ICP
  - `pm-prd` — 8-section PRD (Pre-mortem, User/Job Story, Test Scenario, Beachhead, GTM, Battlecard)
- **N개 기능(Sprint)**: `sprint-master-planner`가 마스터플랜 자동 생성 — 순서·동시진행까지.
- **`/plan-plus`** — 브레인스토밍 강화: 의도 탐색(한 번에 한 질문) → 대안 2~3개 trade-off → **YAGNI(불필요 기능 가차없이 제거)**. 코드 작성 전 승인 게이트(HARD).

### master-plan 알고리즘 — 슬라이드 "위상정렬+bin-packing"의 실체 [코드, context-sizer.js]
1. **토큰 추정**: `tokens = ceil(LOC × 6.67)`, 기본 5000 LOC ≈ **33,350 토큰/기능**.
2. **Kahn 위상정렬**: 의존 그래프 in-degree 계산 → 순서 산출. **사이클 감지 시 `dependency_cycle` 에러로 중단**.
3. **greedy bin-packing**: `유효예산 = 100,000 × (1 − 0.25 safety) = 75,000 토큰/sprint`. 초과하면 새 sprint bin 개시.
4. 한 기능이 100K 초과 → 혼자 sprint + `oversized` 경고. maxSprints 12 초과 → 에러 + 병합 제안.

→ **강의 킬러 포인트**: "AI에게 '알아서 나눠줘' 하지 않고, **결정론적 그래프 알고리즘**으로 컨텍스트 윈도우(100K/sprint)에 안전 패킹". = 1M 컨텍스트라도 한 세션에 다 안 넣는 컨텍스트 엔지니어링의 실체.

### 황금률 (강조) [핸드아웃]
> 마스터플랜을 혼자 쓰지도, AI에 냉정히 맡기지도 마라 → 새 세션에서 목표·대상·리스크·의존성을 **자연어로 충분히 떠들어 컨텍스트를 포화**시킨 뒤(AI가 반박하게) → 조사시키고 → 그제서야 기획 명령. **"완벽한 프롬프트가 아니라 컨텍스트 포화."**

---

## P43 — 오버엔지니어링 피하기 (레벨 + 모델 라우팅)

### 실제 디테일 — 자율 레벨 L0~L4 [코드, control SKILL]
"자율 레벨 = 승인 게이트가 어디 걸리나". **권한모드(실행 권한) × 자율 레벨(공정 자율)의 곱**이 개입 횟수를 정함.

| Lv | 이름 | 사람 없이 어디까지 | 승인 게이트 |
|--|--|--|--|
| L0 | Manual | 자동 없음 | 모든 phase 전이 |
| L1 | Guided | 제안만, 매 단계 확인 | 모든 phase 전이 |
| **L2** | **Semi-Auto (기본값)** | 루틴 전이 자동 | do→check, check→report, report→archive |
| L3 | Auto | 대부분 자동, 파괴적 작업만 게이트 | report→archive |
| L4 | Full-Auto | 전 사이클 자동 | 최초 기능 승인만 |

- **자동 승격 없음, 자동 강등만** (config `autoEscalation:false, autoDowngrade:true`). 승격은 명시 확인. **자율은 벌어서 올린다**(Trust Score 65+→L3, 85+→L4).

### 모델 라우팅 [코드]
- 34 에이전트를 역할별로: **opus**(설계·복잡분석·보안·오케스트레이션 — cto-lead, gap-detector, design-validator, security-architect, pm-lead, enterprise-expert 등 다수) / **sonnet**(구현·반복·가이드 — pdca-iterator, bkend-expert, frontend-architect, pm-* 등) / **haiku 2개**(qa-monitor, report-generator — 빠른 감시·문서).
- ⚠️ philosophy 문서의 "11 opus/19 sonnet" 분포는 stale — 실제는 opus가 다수. 강의 땐 **"비싼 판단=opus, 반복·감시=haiku/sonnet"** 개념만 확실히.
- 효과: 일에 맞게 배치 = Claude Max 한도를 길게.

### 예상 질문
- **Q. 처음부터 L4 풀오토로 하면 안 돼요?** → bkit은 절대 풀오토로 시작 안 함(Safe Defaults 기본 L2). 자율은 track record로 획득.
- **Q. 권한모드랑 자율 레벨 차이?** → 권한모드=실행 권한(acceptEdits/auto/bypass), 자율 레벨=공정 자율(L0~L4). 둘의 곱이 개입 횟수.

---

## P44 — 앱 종류별 최적 프레임워크

### 실제 디테일 [코드]
- **mobile-app**: Expo(Tier1★) / Flutter(Tier2). **desktop-app**: Tauri(3MB·Rust) / Electron(성숙·방대).
- **dynamic = bkend.ai BaaS 5종**(`bkend-quickstart·data·auth·storage·cookbook`) → 로그인·DB·스토리지 즉시.
- ⚠️ **주의**: bkend MCP는 bkit 내장 2서버(pdca/analysis)와 **별개**의 외부 MCP(DB·Auth·Storage 제공). 혼동 금지.

---

## P45—35 에이전트를 지휘하는 오케스트레이션 ⭐

### 실제 디테일 [코드]
- **`/pdca team` → cto-lead(opus)** 지휘. 단계별 4패턴:
  - **Leader** (Plan·Report) — CTO 단독
  - **Council** (Design·Check) — 여러 에이전트 교차검증·합의
  - **Swarm** (Do) — 병렬 독립 구현(프론트·백·QA 동시)
  - **Pipeline** (Do→Check) — 순차 의존
- 레벨별 팀 크기: **Dynamic 3명+CTO / Enterprise 5~6명+CTO**. 5개 팀(PM 5 · CTO 4~6 · QA 4 · Sprint 4).

### ENH-292 Sequential Dispatch = 강연 "토큰=돈" 서사의 정점 [코드]
- CC의 sub-agent 병렬 spawn이 **부모 prefix 캐시를 놓쳐 `cache_creation_input_tokens`가 10배 폭증**하는 버그(CC 이슈 #56293).
- bkit은 **"첫 형제는 순차 실행 → 캐시 워밍업 관찰 → 이후 병렬"**로 **캐시 10× 절감**.
- → **킬러 멘트**: "병렬이 항상 좋은 게 아니다. CC 캐시 특성상 sub-agent는 첫 하나를 순차로 돌려야 10배 싸다." (P19~P22 캐시·비용과 직결)

### 슬라이드 번호 정정
- 슬라이드 제목이 "31 에이전트"면 → **34로 갱신** 권장(31은 dogfooding 실측 당시). 강의 중 말로 "현재 34"라 보정.

---

## P46 — 완벽을 향한 3중 검증

### 실제 디테일 [코드]
| 갈래 | 명령 | 무엇 | 포인트 |
|---|---|---|---|
| **정적** | `/code-review` | 코드 정독 → 품질·버그·보안·성능 사전탐지 | **confidence 90%↑만 보고**(노이즈 컷) |
| **동적** | `/zero-script-qa` | Docker 로그 실시간 분석 | 테스트 코드 **0줄**, 30%→89% |
| **구조화** | `/qa-phase` | **L1 단위·L2 통합·L3 계약·L4 시스템·L5 E2E** 피라미드 | 누락 단계 자동 보강 |

- zero-script-qa 로그 패턴: `ERROR·5xx·3000ms↑` = Critical / `401·403·1000ms↑` = Warning. JSON 로그 + Request ID로 전 구간 추적. `rm -rf`·`DROP TABLE` 자동 차단.
- **QA팀**: `qa-lead`가 test-planner→test-generator→debug-analyst→qa-monitor 조율 + `sprint-qa-flow`가 S1 dataFlow 무결성(기능 간 통합) 검증.

---

## P47 — 무인일수록 검증이 핵심: 스스로 재고 스스로 고친다 ★

### 실제 디테일 — gap-detector는 "grep이 아니라 로직 정독" [코드, agents/gap-detector.md]
gap-detector = opus, effort high, maxTurns 30, `context:fork`(격리), **read-only**(Write/Edit 차단).

**matchRate = 단순 파일 존재 체크가 아니라 7축 가중합** [코드 §8.4]:
- 런타임 검증 있을 때: `Structural×0.10 + Functional×0.15 + Contract×0.15 + Intent×0.20 + Behavioral×0.15 + UX×0.10 + Runtime×0.15`
- 정적만: `Structural×0.10 + Functional×0.20 + Contract×0.20 + Intent×0.25 + Behavioral×0.15 + UX×0.10`
- 비-프론트엔드: UX 축 자동 비활성 → Intent로 재분배.

**"로직 정독"의 실체** [코드 §8.5, MANDATORY]:
- Structural/Functional은 grep 가능(파일 존재·placeholder 탐지). 그러나 **Intent/Behavioral/UX 3개 semantic 축은 "LLM must READ and UNDERSTAND the actual code logic — not just grep for patterns"** 라 명시.
- **Functional Depth 점수**: 0=빈파일, 20=skeleton/TODO, 40=하드코딩 mock, 60=로직 있으나 필드 누락, 80=대부분, 100=완전. **>30% 파일이 60 미만이면 "SHALLOW IMPLEMENTATION" 플래그**.
- **Placeholder 탐지(HIGH confidence)**: `// TODO`, handler 안 `console.log(`, `[1,2,3].map` skeleton, 빈 onSubmit.
- **Intent Match**: `(완전충족×1.0 + 부분×0.5) / 전체기준 × 100` — Plan의 Success Criteria 각각 실측.
- **API 계약 3-way**: Design §4 ↔ 서버 route ↔ 클라이언트 fetch — URL/method/param/response shape 전부 대조(client `/api/favorite` vs server `/api/favorites` = Critical).

**임계 분기** [코드]:
- **<70%**: 상당한 갭 → **pdca-iterator 자동수복 트리거**.
- **70~89%**: 일부 차이 → 수동/자동 선택.
- **≥90%**: 잘 일치 → `/pdca report` 제안.

### pdca-iterator = Evaluator-Optimizer (의도를 읽고 고침) [핸드아웃]
- **Intent Gap**: 설계 WHY·SUCCESS 읽고→코드 로직 읽고→델타 식별→의도 달성 코드(예: "디바운스 검색"→`useDebounce(300ms)` 실제 추가).
- **Behavioral Gap**: 누락 에러 경로에 try-catch·검증·경계 추가(예: 동시 제출 가드→`isSubmitting`+disabled+early return).
- **UX Gap**: 로딩·에러·빈·성공 상태 누락분 보강.
- 종료: 임계 달성 / 5회 / 3회 연속 무개선 / 치명적 불가. **Loop Breaker**: 같은 파일 10회 or 5 PDCA 반복 → 중단 → `/rollback phase`.

### 예상 질문 (강의 핵심 반박)
- **Q. AI가 '다 됐어요' 거짓말하는 건 어떻게 막아요?** → gap-detector가 파일 존재(structural)와 **실제 로직 이해(semantic)를 분리**해 재고, placeholder/stub을 HIGH-confidence 규칙으로 탐지. `>30% 파일 60점 미만 = SHALLOW`. **structural만 100%여도 semantic 낮으면 Overall 안 오름.** ← 1부 "할루시네이션(P16)" 원리의 실전 방어.

---

## P48 — 전문가 에이전트 군단: 알맞은 전문가가 자동 투입

### 실제 디테일 [코드]
- 34 에이전트 = 상황(키워드·맥락) 감지해 자동 호출되는 전문가팀. 대부분 lazy.
- **각 에이전트가 명시적 권한 경계·사고 예산을 가짐** (frontmatter): `model · effort(high/med/low) · maxTurns(20~50) · memory(project/conversation) · disallowedTools(rm -rf·git push 차단) · context(fork=격리)`.
- **아키텍처·구현**: enterprise-expert(MSA 결정) · infra-architect(AWS·K8s·Terraform) · frontend-architect(UI·React) · bkend-expert(인증·DB·API).
- **보안·품질**: security-architect(OWASP Top 10) · code-analyzer(품질·보안·성능) · design-validator(설계 완전성).
- **self-healing**: Slack/Sentry 에러 → 4-Layer 컨텍스트 → 자동수정 → Auto PR, 5회 소진 시 rollback 에스컬레이션.

### 예상 질문
- **Q. 34개나 필요해요?** → 대부분 lazy 발동. Starter는 starter-guide만, Enterprise는 cto-lead가 5~6명 spawn. 6개는 deprecated 스텁.
- **Q. cto-lead도 서브에이전트인데 서브의 서브를?** → CC의 sub-of-sub 제약 때문에 sequential dispatch로 우회(ENH-292). (글로벌 룰 "메인=리더 빙의"와 같은 제약)

---

## P49 — 레벨에 맞는 탄탄한 아키텍처 (무리한 설계 금지)

### 실제 디테일 — 반직관 포인트 [코드]
- **matchRate 임계가 레벨별로 다름**: **Starter 80% · Dynamic 90% · Enterprise 95%**.
- **엔터프라이즈는 게이트가 보수적** → 오히려 L3보다 **L2 유지가 흔함**(체크 철저, 반복도 더 돎). → **"고급=풀오토"가 아니라 "고급=더 엄격"**. 슬라이드가 "레벨↑=자율↑"로만 보이면 구두 보강 필요.
- **레벨별 강제 아키텍처**:
  - **Starter (Layered)**: components/lib/types. Convention-first 최소.
  - **Dynamic (Clean-ish + Port/Adapter)**: components/features/services/types/lib/api. API-First, `@/lib/bkend`, 의존방향 강제.
  - **Enterprise (Clean Architecture 4-Layer)**: API → Application → **Domain(fs/child_process/net/http/os import 금지 = M9 게이트)** → Infrastructure. 의존방향: Domain→none.
- 공통 강제: **API-First · 레이어 분리 · Convention-first**.

### Defense-in-Depth 4-Layer (보안 질문 대비) [핸드아웃]
- L1 CC 샌드박스 → L2 bkit PreToolUse(rm -rf·force push·`curl|sh`·보호경로 차단, 8규칙+blast radius) → L3 audit-logger(OWASP A03/A08 + PII 7키 마스킹) → L4 Token Ledger(NDJSON).

---

## P50 — bkit이 박제한 개발론: 시스템이 강제한다

### 실제 디테일 [코드, philosophy 문서]
- **Context Engineering**: "좋은 프롬프트"가 아니라 **적시에 올바른 컨텍스트를 주는 시스템**(훅+스킬+에이전트). 4계층 hierarchy(L1 플러그인 → L2 유저 → L3 프로젝트 `.bkit/state` → L4 세션). 자체 성숙도 CE-7.
- **Context Anchor**: Plan에서 박는 **WHY·WHO·RISK·SUCCESS·SCOPE 5줄** → 전 단계 전파 = "자율주행의 나침반".
- **Docs = Code**: PRD·설계는 장식 아니라 **구속력 있는 계약** — gap-detector가 matchRate로 강제.
- **Convention-first**: 구현 전 코딩 규칙 못박음.
- **품질 게이트 + Trust 자율성**: 게이트 미달이면 워크플로 정지, Trust 다이얼이 무인 범위 결정.

### 품질 게이트 M/S 전체 표 (청중이 파고들 때) [코드, quality-gates.js]
| Gate | 재는 것 | op | 임계 |
|--|--|--|--|
| M1 matchRate | 설계 API계약↔구현 | ≥ | 90 |
| M2 codeQuality | lint+복잡도+중복 | ≥ | 80 |
| M3 criticalIssue | 보안+정확성 critical | ≤ | 0 |
| M4 apiCompliance | API계약↔모듈경계 | ≥ | 95 |
| M5 runtimeError | 런타임 에러율 | ≤ | 1 |
| M7 convention | 스타일+네이밍 | ≥ | 90 |
| M8 designComplete | 설계 완결성 | ≥ | 85 |
| M10 cycleTime | PDCA 소요시간(h) | ≤ | 40 |
| **S1 dataFlowIntegrity** | 7-Layer hop 순회 | ≥ | **100** |
| S2 featureCompletion | 기능 완료율 | ≥ | 100 |
| S4 archiveReadiness | M1+M3+S1+S2 합성 | === | true |

- ⚠️ 코드의 GATE_DEFINITIONS엔 M1,2,3,4,5,7,8,10 + S1,2,4만. philosophy의 "M1~M10"와 **다른 리스트**(M6/M9/S3는 sprint에서 미측정 슬롯). 강의는 "대표 게이트 M1 설계정합 · M3 치명이슈0 · S1 데이터흐름"만 확실히.
- 게이트는 **스스로 측정 안 함** — orchestrator가 phase 전진 전 값을 채워야 함. 안 채우면 `not_measured` → QUALITY_GATE_FAIL로 pause(Issue #92 데드락 → v2.1.16 `/sprint measure` 수동경로 추가로 해결).

---

## P51 — 막막할 땐 명령 한 줄 (development-pipeline)

### 실제 디테일 [코드]
- `/development-pipeline` = **9단계 개발 순서**: 1 Schema/용어 → 2 Convention → 3 Mockup → 4 API → 5 Design System → 6 UI → 7 SEO/Security → 8 Review → 9 Deployment.
- **핵심(혼동 방지)**: "전체 파이프라인 = PDCA 아님. **각 Phase 안에서 PDCA 사이클을 돈다**." → **PDCA 9-phase = 기능 하나의 생명주기 / pipeline 9-phase = 프로젝트 전체 개발순서** (직교).
- 레벨별 흐름: Starter 1→2→3→6→9 / Dynamic 1~7→9 / Enterprise 전부.

---

## P52 [실습] — Sprint 기획·설계까지 직접

### 따라하기 (강사 시연/청중 자습)
1. `/sprint init my-app --features auth,profile,dashboard --trust L1`
2. `/sprint start my-app` → **PRD + Plan 자동 후 멈춤**(L1 = prd/plan까지).
3. `/sprint phase my-app --to design` → **설계 문서까지** 생성. **여기서 STOP**(do/빌드 안 함).
- 관찰 3: ① PRD에 문제·JTBD·페르소나·성공지표·Pre-mortem 채워지나 ② master-plan이 "무엇 먼저·무엇 동시"를 정리했나 ③ 각 기능 design 문서 생성됐나.
- ⚠️ 실제 빌드(do)는 시간·한도 때문에 현장 생략, 자습으로 이어가기.

---

## P53 — 직접 데모 대신: 코드깎는노인의 bkit 리뷰

- 유튜브 '코드깎는노인' 리뷰 = **외부 개발자의 제3자 검증**(소셜 프루프). `https://www.youtube.com/watch?v=EZwffHVx05U`
- 멘트: "내 말 말고, 직접 써본 개발자의 평가를 보세요."

---

## P54 — 직접 써봤으니 내 것으로: bkit 커스텀 가이드

### 실제 디테일 [코드]
- 100% 오픈소스 → **포크해 내 프로젝트에 맞게** 고쳐 씀.
- **`/skill-create`**: 프로젝트 특화 스킬 생성 → `.claude/skills/project/{name}/SKILL.md`(git 추적, **bkit core보다 우선**).
- **`/btw`(By The Way)**: 작업 중 아이디어를 `.bkit/btw-suggestions.json`에 적립 → `/btw analyze`(skill 후보 클러스터) → `/btw promote {id}`(→skill-create). **절대 auto-promote 안 함**.
- **Skill Evals**: 44 스킬을 Workflow(영구)/Capability(모델 발전 시 대체 가능)/Hybrid로 분류 → A/B + parity 측정 → 3연속 통과 시 deprecation 후보(비차단 advisory).

---

## P55~P56 — 우리가 만든 도구: ai-native-cowork

> ⚠️ **주의**: 핸드아웃 5종에 ai-native-cowork 상세가 거의 없음 — 이 슬라이드는 **별도 자료 필요**. 아래는 슬라이드 구성안 + 환경 스킬 목록 기준.

- **cowork-insights**: 세션을 주간/월간 리포트(HTML+MD)로 → Jira·Notion·Slack. "이번 주 내가 뭐 했지?"에 자동 응답.
- **cowork-commit**: 커밋마다 *왜*(결정·대화) 박제 → 좋은 결정을 실수로 되돌리지 않게.
- **cowork-sprint**: 큰 일을 스프린트로 쪼개 무인 실행(bkit PDCA·전문가팀 방식 차용, 독립 동작).
- **cowork-doc-init / doc-sync**: 흩어진 문서 표준 정리 + 구현 후 코드↔문서 자동 정합(stale 탐지).
- 한 줄: "혼자여도 팀처럼 — 가시성·결정기억·전달이 자동 축적."

---

## P57~P59 — bkit 차기버전 'tene': 자율주행을 '눈으로'

> ⚠️ **주의**: 핸드아웃 5종에 **"tene" 언급 0건** — 이 슬라이드는 **별도 준비 필요**(스크린샷 001~006 발표자 첨부). 아래는 슬라이드 구성안 기준.

- **핵심 의식**: 에이전트에게 자율주행 시켰으면 *무엇을 만들었고 어떻게 도는지*를 **눈으로 모니터링·분석** 가능해야. 안 보이는 자율주행 = 통제 불가. (이 사고가 그대로 챕터4 수지로 이어짐)
- **개요** = 내 프로젝트 건강검진표(언어·프레임워크·핫스팟·기술부채 자동 스캔).
- **CodeMap** = 화면→기능→데이터 흐름 마인드맵. **Interface** = 화면 전이 트리(기획서·IA를 코드에서 자동 추출). **API** = 쉬운 말 + **신뢰도 표기**(AI 거짓말 차단). **Data** = ERD + 실제 저장값 안전 미리보기.
- **AI 에이전트**: tene가 만든 '지도'를 **tene MCP**로 AI에 먼저 줘서 → **적은 토큰으로 정확하게** 답. **협업**=E2EE 공유, **시크릿**=서버 없이 내 컴퓨터에만 암호화.
- 한 줄: "자율주행을 시키되 — **보이게, 분석되게, 안전하게.**"

---

## P60 — 마무리: 만들기를 '자율주행'으로

- 여정 회고: 한 마디 요청 → PDCA 공정 → Sprint 무인연쇄 → 다중검증·자가수복 → 전문가 에이전트 팀 → 보이게(tene)·내 것으로(커스텀·cowork).
- 테제: bkit = "감으로 시키기"를 **반복 가능한 개발 자율주행**으로 바꾼 Context Engineering OS.
- 다음: 만들기를 자율주행시켰으니 → **운영(일정·메일·문서·리서치) 자동화** = 챕터4 수지.
- CTA: "`claude plugin install bkit` — 돌아가서 `/sprint init`으로 첫 자율주행."

---

## 부록 A — 하네스 4종 비교 (P30~P31 도입 보강, 질문 대비) [핸드아웃]

**비교 4종**: Claude Code(TS) · Codex(Rust, codex-rs) · Hermes(Python) · OpenClaw(TS). 핵심 = **"같은 LLM이라도 하네스가 프롬프트를 어떻게 조립하느냐가 동작을 가른다."**

**4종 공통 5가지 (가장 중요)**:
1. **전부 Stateless** — 매 호출에 전체 히스토리 재전송. 모델이 기억하는 게 아니라 하네스가 매번 조립.
2. **도구 정의(스키마)는 프롬프트 텍스트가 아님** — 별도 `tools` 배열. 시스템엔 "도구 사용 안내"만 산문으로.
3. **안정→동적 순서 + 캐시 경계** — 불변 앞, 변동 뒤. 앞부분을 캐시에 태워 비용·지연↓.
4. **규칙 파일 위치가 갈림(반직관)**: CC·Codex → **유저 메시지**로 주입 / Hermes·OpenClaw → 시스템 인라인.
5. **Codex엔 `system` 역할이 아예 없음** — 최상위 `instructions` 필드 사용.

**API 규격 멘탈 모델**: OpenAI Chat Completions = 업계 공용어(`model` 슬러그만 교체). 진짜 다른 건 **Anthropic 하나**(system 별도 필드). OpenRouter = 선택적 게이트웨이(reasoning 차이 정규화).

---

## 부록 B — 5주체 자율주행 (경쟁·차별화 맥락) [핸드아웃]

**5주체**: Claude Code · ChatGPT/Codex · Gemini · OpenClaw · Hermes. 두 갈래(코딩 하네스 / 24시간 개인 에이전트)가 같은 곳 수렴(서브에이전트·백그라운드·cron·원격).

**핵심 통찰 — "컴퓨트 부하가 과금을 가른다"**:
- 토큰(추론)은 로컬이든 클라우드든 구독 한도에서 똑같이 차감. 클라우드라서 더 드는 건 **컴퓨트(가상컴퓨터·샌드박스)**뿐.
- 가벼운 클라우드=무료 흡수(ultraplan=거의 사고만) / 무거운 클라우드=종량 전가(ultrareview 1회 $5~20).
- "같은 클라우드인데 왜 하나는 공짜, 하나는 돈?" → **답 = 컴퓨트 부하. 사고는 공짜, 실행은 돈.**

**로컬이 여전히 강하다**: ultraplan의 클라우드 모델(Opus 4.6) < 로컬 최신 **Opus 4.8(1M)**. 로컬에 최신 모델·맥락·도구 다 있으면 구형 클라우드 위임이 손해.

**완전 무인은 아직 없다**: ChatGPT는 로그인·민감 단계 takeover, OpenClaw는 명령 실행 승인, Claude Auto는 ~17% 놓침 인정. **민감·비가역 단계는 사람** — 5주체 공통.

---

## 부록 C — "문서 vs 코드" 치트시트 (숫자 질문 안 막히기) [코드]

발표 전 이 표만 외워도 어떤 수치 반박에도 대응 가능:

| 항목 | 문서/슬라이드 표기 | 실제 코드 |
|---|---|---|
| PDCA transitions | 20 | **25** |
| PDCA guards | 9 | **11** |
| agents 파일 수 | 34 | 40(deprecated 6 제외 = **34**) |
| skills | 36(구버전) | **44** |
| MCP tools | 16(구버전) | **19**(pdca 13 + analysis 6, 전부 읽기전용) |
| lib 모듈 | 128~142 | **약 190** |
| matchRate 임계 | "90%" | PDCA **90** / QA **95+critical 0** / Sprint 목표 100·최소 90 |
| 레벨별 matchRate | (단일값처럼) | Starter **80** / Dynamic **90** / Enterprise **95** |
| Sprint 기본 Trust | L3 흔적 | **L2**(v2.1.19 안전기본 하향) |
| P41 "31 agents" | 31 | dogfooding 실측 당시 값(현행 34) |

**주의**: bkit 문서 자체가 stale하다는 사실이 오히려 강의 자산 — "Docs=Code를 표방하는 프레임워크조차 문서가 뒤처진다, 그래서 gap-detector 같은 기계 대조가 필요한 것"이라는 자기증명으로 활용.

---

## 부록 D — 강의에서 반드시 살릴 "킬러 3연타"

1. **"실행은 AI(99%), 판단은 인간(20%)"** — 자율형의 본질. 방치가 아니라 통제.
2. **"structural 100%여도 semantic 낮으면 matchRate 안 오른다"** — AI 거짓 완성(할루시네이션)을 기계가 잡는 실증. 1부 P16과 콜백.
3. **"sub-agent는 병렬이 아니라 순차가 10배 싸다(ENH-292)"** — 토큰=돈 서사의 정점. 1부 P19~P22 캐시와 콜백.
