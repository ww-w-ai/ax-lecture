# 핸드아웃 — 자율형 바이브코딩 ③ 고급 (Enterprise) · 종합편

> 3부작 중 3부 · 배포·자습용. **[초급] → [중급] → 고급**. 초·중급 내용을 전제하고, 그 위에 **bkit 소스 딥리서치로 파악한 모든 사실**을 쌓는다.
> bkit(AI Native Development OS · Apache-2.0 · POPUP STUDIO) v2.1.x 소스 직접 분석 기반.
> **이 문서의 한 줄**: *고급의 목표는 "여러 기능을 무인 연쇄로 굴리되, 비가역의 안전을 손에 쥐는 것." 그러려면 내부가 어떻게 도는지 다 알아야 한다.*
> ※ 이 문서는 **레퍼런스(사전)**다. 처음부터 끝까지 읽기보다, 필요한 절을 찾아 쓴다.

---

## 목차
- A. 자율형의 토대(고급 관점)
- B. Sprint — 여러 기능을 무인 연쇄로
- C. Context Sizer — 컨텍스트 예산 분할의 수학
- D. 자율의 안전벨트 — 4 Auto-Pause + 11 Quality Gates
- E. matchRate의 정체 — 6축 채점 공식
- F. 자가수복 — pdca-iterator의 의미적 수복
- G. 에이전트 오케스트레이션 + ENH-292 (캐시 10× 절감)
- H. 아키텍처 — Clean / Defense-in-Depth / Invocation Contract
- I. 트리거 시스템 — 21 훅 / 2층 / 8개국어
- J. MCP 서버 — bkit의 상태를 read API로
- K. 비가역 액션 안전 — 롤백·Audit·배포 divergence
- L. 거버넌스·관측 — Trust Score / Docs=Code / Skill Evals / CC 회귀 감시
- M. 전체 명령 레퍼런스(부록 포함)
- N. AI-Native 역할 재분배 — 왜 이게 가능한가(데이터)
- O. 고급 체크리스트 + 자율형 7원칙

---

## A. 자율형의 토대 (고급 관점)

3대 철학(Automation First·No Guessing·Docs=Code)과 자율주행 3조건(박제·검증·게이트)은 초·중급과 동일. 고급에서 더하는 관점:

- **bkit의 정체 = Context Engineering의 코드 구현체.** "좋은 프롬프트 쓰기"(프롬프트 엔지니어링)가 아니라 **"프롬프트·도구·상태를 통합해 LLM에 최적 컨텍스트를 주는 시스템 설계."** → 강연의 `프롬프트(2025) → 콘텍스트·멀티턴·state(2026)` 서사와 동일.
- **Multi-Level Context Hierarchy**: L1 플러그인 정책 → L2 유저 설정(`~/.claude/bkit/`) → L3 프로젝트(`.bkit/state/`) → L4 세션(런타임). 컨텍스트가 4층으로 합성된다.
- **핵심 우선순위(사용자 직접 지시 정신과 동일)**: 소스는 되돌릴 수 있지만 상태/DB는 위험 → 비가역 액션은 게이트로.

### 권한모드 × 자율 레벨 — 개입 횟수 매트릭스 (실측 근사)
| | acceptEdits | auto | bypass |
|---|---|---|---|
| **L0** Manual | ~35 | ~25 | ~20 |
| **L2** Semi-Auto(기본) | ~15 ★초급 | ~8 | ~5 |
| **L3** Auto | ~10 | ~3 ★실전 | ~2 |
| **L4** Full-Auto | ~8 | ~1 (위험) | 0 (격리 VM만) |

- **엔터프라이즈는 게이트가 보수적** → L3보다 **L2 유지**가 흔하다(matchRate 95%·Design 완성도 90%로 체크가 철저, 반복도 더 돈다).

---

## B. Sprint — 여러 기능을 무인 연쇄로

**Sprint = 1+ 기능을 공유 scope/budget/timeline으로 묶는 메타컨테이너.** 8-phase. (v2.1.13 도입)

### B.1 PDCA × Sprint 직교 공존
| | PDCA(기능 단위) | Sprint(메타컨테이너) |
|---|---|---|
| 단위 | 단일 기능 | 1+ 기능 묶음 |
| phase | 9 (pm→…→archive) | 8 (prd→plan→design→do→iterate→qa→report→archived) |
| 상태 파일 | `.bkit/state/pdca-status.json` | `.bkit/state/sprints/{id}.json` |
| 오케스트레이터 | `cto-lead` | `sprint-orchestrator` |
| QA | `qa-monitor`(Zero Script) | `sprint-qa-flow`(S1 7-Layer) |
| 리포트 | `report-generator` | `sprint-report-writer`(누적 KPI) |

**핵심**: Sprint 1개 = N기능. **각 기능의 PDCA 9단계가 Sprint의 `do` phase 안에서 돈다.** 상태는 별도 파일에 저장 → 서로 간섭 없음(CI 계약 SC-08으로 보장). 단일 기능은 PDCA 단독으로도 가능(Sprint는 opt-in).

### B.2 16 sub-actions
`init · start · status · list · watch · phase · iterate · qa · report · archive · pause · resume · fork · feature · help · master-plan` (+`measure`·`trust`).

```bash
/sprint master-plan q2 --name "Q2" --features auth,billing,reports --trust L3
/sprint start q2                      # 8-phase 자율 진행
/sprint watch q2                      # 라이브(트리거·매트릭스)
/sprint phase q2 --to design          # 수동 전이
/sprint feature q2 --action add --feature payment
/sprint fork q2 --new q3-carry        # 미완 기능만 새 Sprint로
/sprint pause q2 ; /sprint resume q2
```

### B.3 Trust Level Scope (stopAfter 경계)
L0 plan / L1 design / L2 do / L3 qa / **L4 archived(풀오토)**. `SPRINT_AUTORUN_SCOPE`가 결정. 세션이 꺼져도 Task 등록 + 메모리 박제로 **다음 세션이 이어받는다.**

### B.4 Sprint 단계별 활성 게이트 (오케스트레이터가 phase exit 전 측정)
```
plan      → M8
design    → M4 + M8           (둘 다 채워야 advance, v2.1.16 Issue #92)
do        → M1,M2,M3,M4,M5,M7
iterate   → M1,M2,M3,M5,M7
qa        → M1-M5,M7,S1,S2
report    → M1-M5,M7,M8,M10,S1,S2,S4
```

---

## C. Context Sizer — 컨텍스트 예산 분할의 수학

`/sprint master-plan`이 기능을 **단일 세션이 넘침 없이 끝낼 수 있는 크기**로 자동 분할.

```
1) 토큰 추정: LOC × 6.67 토큰/LOC (baselineLOC 5000)
2) 의존성 정렬: Kahn 위상정렬 (예: billing은 auth에 의존 → auth 먼저)
3) 묶기: greedy bin-packing
4) 예산: maxTokensPerSprint 100K × (1 − safetyMargin 0.25) = 75K 토큰/Sprint
5) 범위: minSprints 1 ~ maxSprints 12, dependencyAware: true
```

결과 = 의존성 순서가 보장된 N개 Sprint, 각각 한 세션에 안전히 들어감. **이게 "박제가 곧 자율주행의 운전대"의 물리적 근거** — 마스터플랜의 질이 전체 품질의 천장.

---

## D. 자율의 안전벨트 — 4 Auto-Pause + 11 Quality Gates

### D.1 4 Auto-Pause 트리거 (L4 풀오토라도 즉시 멈춤)
| 트리거 | 조건 | 대응 |
|---|---|---|
| `QUALITY_GATE_FAIL` | M-게이트/S1 실패 | 출력 검토 → 수정 → `/sprint resume` |
| `ITERATION_EXHAUSTED` | iterate 5회 초과 미달 | 설계가 자동수복 한계 → 사람이 재검토 |
| `BUDGET_EXCEEDED` | 토큰 예산 초과(기본 1M) | Sprint 분할 / `/sprint fork` |
| `PHASE_TIMEOUT` | 단계 시간 초과(기본 4h) | 원인 조사 후 수동 진행 |

> **멈춤은 버그가 아니라 안전벨트.** 우회(bypass)하지 말고 *원인을 제거한 뒤* resume. 이게 "통제받는 자유."

### D.2 11 Quality Gates (M1–M10 + S1)
| 게이트 | 측정 | 임계 | 실패 시 |
|---|---|---|---|
| **M1** matchRate | 설계↔코드 일치율 | ≥90%(Starter80/Ent95) | `pdca-iterator` 자동 수복(max5) |
| **M2** codeQuality | 복잡도·데드코드 | ≥80 | 재분석 → 사용자 확인 |
| **M3** criticalIssue | 보안·정합 치명버그 | 0 | 즉시 일시정지 |
| **M4** conventionCompliance | 컨벤션 준수 | ≥90% | 린트 자동수정 |
| **M5** testCoverage | 테스트 커버리지 | ≥70% | `qa-test-generator` 보강 |
| **M6** securityScore | OWASP Top-10 | ≥85 | `security-architect` 리뷰 |
| **M7** documentation | 문서 완성도 | ≥90% | 자동 문서화 |
| **M8** sprint matchRate / designCompleteness | 설계 완성도 | ≥85 | Sprint iterate 루프 |
| **M9** contractInvariant | 아키텍처 불변식 | 위반 0 | CI 빌드 차단 |
| **M10** regressionGuard | 신규 회귀 | 0 | 레지스트리 추적 |
| **S1** dataFlowIntegrity | 7-Layer 데이터흐름 | ≥85% | 끊긴 hop 재검증 |

**임계의 3단 해석**: `bkit.config.json` override → 카탈로그 기본값 → 하드코드 fallback. CI(`check-quality-gates-m1-m10.js`)가 3-way drift를 막는다.

### D.3 S1 7-Layer dataFlow (Sprint QA)
`UI → Client → API → 검증 → DB → 응답 → Client → UI` 전 구간(H1–H7)을 추적. 한 hop이라도 끊기면 그 hop을 재검증. `/sprint qa <id>`로 실행.

---

## E. matchRate의 정체 — 6축 채점 공식

`gap-detector`(Opus, read-only)가 설계 의도를 *먼저* 추출하고 코드를 *정독*해 6축을 0–100으로 채점한 뒤 가중합.

| 축 | 측정 |
|---|---|
| **Structural** | 파일 존재·라우트·컴포넌트 목록 |
| **Functional Depth** | 0=빈/40=mock/60=갭/80=대부분/100=완전. placeholder(TODO·console.log·하드코딩) 탐지 |
| **API Contract** | 3-way: 설계 §4 ↔ 서버 route ↔ 클라 fetch (URL·method·param·response 교차) |
| **Intent Match** | 설계 WHY·SUCCESS 충족 여부 (키워드가 아니라 *의미*) |
| **Behavioral** | 엣지·에러·검증·경계 처리 |
| **UX Fidelity** | 로딩·에러·빈 상태·피드백 (비프론트는 비활성) |

**가중치(런타임 유무에 따라)**:
- with runtime: `Struct .10 + Func .15 + Contract .15 + Intent .20 + Behavioral .15 + UX .10 + Runtime .15`
- without runtime: `Struct .10 + Func .20 + Contract .20 + Intent .25 + Behavioral .15 + UX .10`
- non-frontend: `Struct .10 + Func .20 + Contract .20 + Intent .35 + Behavioral .15`

**분기**: ≥90% → 리포트 / 70–89% → 선택 / <70% → `pdca-iterator` 자동수복. (gap-detector는 Runtime Verification Plan(L1 curl·L2 Playwright·L3 E2E)도 출력하나 직접 실행은 안 함 — 오케스트레이터가 소비)

---

## F. 자가수복 — pdca-iterator의 의미적 수복

Evaluator-Optimizer 패턴. **키워드 채우기가 아니라 "의도를 읽고 코드 로직을 이해해" 고친다.**

| 갭 유형 | 수복 방식 |
|---|---|
| **Intent Gap** | 설계 WHY·SUCCESS·Plan 성공기준을 읽고 → 실제 코드 로직을 읽고 → 델타 식별 → *의도를 달성하는* 코드. (예: "디바운스 검색" → `useDebounce(300ms)` 추가, 주석만 X) |
| **Behavioral Gap** | 설계가 명시한 에러 시나리오 목록 → 코드 추적 → 누락 경로에 try-catch·검증·경계 추가. (예: 동시 제출 가드 없음 → `isSubmitting` + disabled + early return) |
| **UX Gap** | 설계의 UI 상태(로딩·에러·빈·성공) → 누락분에 상태관리·조건부 렌더·피드백 추가 |

- 최대 5 사이클. 종료: 임계 달성 / 5회 / 3회 연속 무개선 / 치명적 불가.
- **Loop Breaker**: 같은 파일 10회 수정 또는 5 PDCA 반복 → 중단(설계-코드 불일치를 자동으로 못 풀 때). → `/rollback phase` 후 설계 보강.

---

## G. 에이전트 오케스트레이션 + ENH-292

### G.1 34 에이전트 (13 Opus / 21 Sonnet / 2 Haiku)
- **Opus(전략·복잡분석)**: cto-lead·code-analyzer·design-validator·gap-detector·enterprise-expert·infra-architect·security-architect·pm-lead·self-healing 등
- **Sonnet(실행·반복)**: bkend-expert·pdca-iterator·frontend-architect·qa-strategist·pm-* 등
- **Haiku(빠른 모니터·문서)**: qa-monitor·report-generator
- **frontmatter 필드**: `model · effort(high/med/low) · maxTurns(20~50) · memory(project/conversation) · disallowedTools(rm -rf·git push 등 차단) · tools · context(fork=격리)`

### G.2 5개 팀
- **PM 팀(5)**: pm-lead + discovery/strategy/research/prd (43 프레임워크)
- **CTO 팀(4–6)**: cto-lead + developer·qa·frontend·backend·security(+infra)
- **QA 팀(4)**: qa-lead + test-planner·test-generator·debug-analyst·monitor (L1–L5)
- **Sprint 팀(4)**: master-planner·orchestrator·qa-flow·report-writer

### G.3 ENH-292 Sequential Dispatch — 캐시 10× 절감 (bkit의 차별화 무기)
**문제**: 병렬 Task 스폰은 부모 prefix 캐시를 놓쳐 `cache_creation_input_tokens` **10배 폭증**(CC #56293).
**해법**: **"첫 형제는 순차 → 워밍업 관찰 → 이후 병렬."**
**결정 사다리**: env `BKIT_SEQUENTIAL_DISPATCH=0`이면 fallback / 첫 스폰 지연>30s면 병렬 / Trust L4면 순차 강제 / 캐시히트 ≥0.40이면 병렬 / 그 외 순차(기본).
→ **강연 "토큰을 돈으로 보는 설계"(P19~P22 캐시·비용)의 정점.** 자율 연쇄에서 토큰 비용을 지배.

---

## H. 아키텍처

### H.1 Clean Architecture 4-Layer (CI 강제, 금지 import 0)
```
Presentation: hooks(21)·scripts(61)·skills(44)·agents(34)
Infrastructure: lib/infra (cc-bridge·telemetry·mcp-port-registry·sprint…)
Application: lib/application(pdca/sprint-lifecycle)·cc-regression·team
Domain: lib/domain (18 모듈, fs/child_process/net/http/os import 금지 — M9 게이트)
```

### H.2 Defense-in-Depth 4-Layer
```
L1 CC 내장 샌드박스
 → L2 bkit PreToolUse (unified-bash-pre·unified-write-pre·defense-coordinator) : rm -rf·force push·curl|sh·보호경로 차단(8 규칙 + blast radius)
 → L3 audit-logger 새니타이저 (OWASP A03/A08 + PII 7키 마스킹)
 → L4 Token Ledger (NDJSON)
```

### H.3 Invocation Contract L1–L5 (226+ CI 어서션)
L1 계약 baseline 94 JSON / L2 smoke 98 TC / L3 MCP stdio 42 TC(+Sprint 계약 10 SC) / L5 E2E 5 시나리오. `contract-check.yml`이 강제 — 하나라도 깨지면 빌드 차단.

### H.4 3-Layer Orchestration
`intent-router(feature > skill > agent)` → `next-action-engine(Stop-family)` → `team-protocol` + `workflow-state-machine(matchRate SSoT 90)`.

### H.5 규모 (v2.1.22)
44 skills · 34 agents · 11 gates · 21 hook events/24 blocks · 2 MCP servers(19 tools) · 190 lib modules/22 subdirs · 61 scripts · 40 templates · 118+ test files/4000+ cases.
> ⚠️ **버전 드리프트 주의**: 옛 문서엔 36 skills·31 agents·16 tools로 적힌 곳이 많다(v2.0~2.1.13 시점). 최신은 위 숫자. 발표 시 현행 확인.

---

## I. 트리거 시스템

### I.1 21 Hook Events / 6-Layer
SessionStart·UserPromptSubmit·PreToolUse·PostToolUse·PreCompact·PostCompact·Stop·SubagentStart/Stop·SessionEnd·TaskCompleted·TeammateIdle·StopFailure·PostToolUseFailure·Notification·ConfigChange·PermissionRequest·InstructionsLoaded 등. 6층 = hooks.json → unified scripts → agent frontmatter → description triggers → lib logic → team orchestration.

### I.2 Hooks vs Skills (2층)
| | Hooks | Skills |
|---|---|---|
| 성격 | **Hard(무조건 실행)** | **Soft(Claude 판단)** |
| 강제력 | 높음 | 낮음(재량) |
| 용도 | 검증·차단·알림 | 가이드·스타일·도메인 지식 |
| 우선순위 | Skills보다 높음 | — |

- **작업 크기 자동 분류**: <50 Quick / <200 Minor / <1000 Feature(PDCA 권장) / ≥1000 Major(PDCA 필수).
- **Check-Act Stop 훅 분기**: gap-detector-stop이 matchRate로 분기(≥90 리포트 / 70-89 선택 / <70 iterator).

### I.3 8개국어 의미 매칭
EN·KO·JA·ZH·ES·FR·DE·IT. description의 `Triggers:` 키워드는 *bkit 컨벤션*(공식 CC 기능 아님) — Claude가 description 전체를 **의미 매칭**해 자동 발동. `"로그인 만들어줘"`로도 알맞은 스킬이 뜬다.

---

## J. MCP 서버 — bkit의 상태를 read API로

bkit은 `.mcp.json`으로 **읽기 전용 MCP 서버 2개**를 자동 등록. bkit이 디스크에 쌓은 상태(`.bkit/state/*.json` + `docs/`)를 *외부 소비자*(다른 세션·대시보드·CI)가 도구 호출로 조회.

| 서버 | 도구(19) | 노출 |
|---|---|---|
| **bkit-pdca**(13) | pdca_status·pdca_history·feature_list·feature_detail·plan_read·design_read·analysis_read·report_read·metrics_get·metrics_history·sprint_status·sprint_list·master_plan_read | PDCA·Sprint 상태/산출물 |
| **bkit-analysis**(6) | code_quality·gap_analysis·regression_rules·checkpoint_list·checkpoint_detail·audit_search | 분석·체크포인트·감사 |

> 사소한 발견: 두 서버 다 `readOnlyHint` 어노테이션 0개(read-only인데 미설정 — 모범관례상 빠짐).

---

## K. 비가역 액션 안전 (고급 필수 규율)

- **Checkpoint/Rollback**: phase 전이·파괴적 명령 시 자동 체크포인트. `/rollback`(목록)·`/rollback to <id>`·`/rollback phase`(한 단계)·`/rollback reset <feature>`(상태만 초기화, 파일은 보존).
- **Audit(투명 블랙박스)**: 모든 결정의 **근거(Rationale)·대안(Alternatives)·확신도(Confidence)**를 JSONL로 기록. `/audit` 또는 MCP `bkit_audit_search`.
- **배포 전 base-divergence**: 워크트리·멀티세션이면 `git fetch` → `git log HEAD..origin/main`으로 다른 세션이 main을 앞섰는지 확인. stale 트리 단독 배포 = 남의 기능 regress. 통합 트리에서 1회 배포. + gitignored 시크릿(`.env`·배포키)은 워크트리에 전파 안 되니 메인 체크아웃에서 배포.
- **DB/마이그레이션**: 소스는 되돌릴 수 있지만 DB는 위험 → 데이터 유실·과도제어 양방향 검토 후 적용.

---

## L. 거버넌스·관측

- **Trust Score(0–100)** = 6성분 가중합(완료율 .25·게이트통과 .20·롤백 .15·파괴차단 .15·반복효율 .15·override .10). 65→L3, 85→L4 자동 추천. `autoEscalation`/`autoDowngrade` 플래그로 자동 변경 허용 여부 제어. **즉시 강등은 항상 가능.**
- **Docs=Code CI**: 8개 카운트(skills/agents/hookEvents/…) + 버전 5-Location 불변식(`bkit.config.json` canonical → plugin.json·hooks.json·session-start.js·README·CHANGELOG) 0-drift 강제(`docs-code-sync.js`).
- **Skill Evals**: 44 스킬을 Workflow(영구)/Capability(모델 발전 시 대체 가능)/Hybrid로 분류. A/B 테스트 + Parity(모델이 스킬 없이 동일 결과 내는지) 측정 → 3연속 parity 통과 시 deprecation 후보. 비차단(advisory).
- **CC 회귀 감시**: ADR 0003 3-Source(CHANGELOG·docs·bkit 테스트). 주간 upstream 스캔 + 일간 user 이슈. 2+ 보고 → CONFIRMED + P0. 22+ 회귀 가드 레지스트리. CC 호환 112연속 릴리스.

---

## M. 전체 명령 레퍼런스

### 핵심
```
/pdca {pm·plan·design·do·analyze·iterate·qa·report·archive·cleanup·team·status·next}
/sprint {init·start·status·list·watch·phase·iterate·qa·report·archive·pause·resume·fork·feature·master-plan·measure·trust}
/control {level·status·trust·pause·stop}    /plan-plus    /pm-discovery
/starter·/dynamic·/enterprise init          /development-pipeline {start·next·status}
/code-review   /zero-script-qa   /qa-phase   /pdca-batch
/mobile-app(Expo★/Flutter)   /desktop-app(Tauri/Electron)
/audit   /skill-create   /btw (→ /btw promote)   /rollback
```
### 부록(알아두면 좋은)
```
/pdca-fast-track  신뢰 기반 체크포인트 자동승인 (Trust 80+)   → 자율주행과 직결
/pdca-watch       라이브 PDCA 모니터
/simplify         코드 정리 리뷰        /deploy        배포(phase-9)
/memory           CC auto-memory 관리   /copy          코드 클립보드
/bkit-explore     컴포넌트 탐색          /bkit-evals    스킬 평가
/skill-status     스킬 상태             /cc-version-analysis  CC 호환 분석
/claude-code-learning  CC 자체 학습
/output-style {bkit-learning·pdca-guide·enterprise·pdca-enterprise}
```
### bkend BaaS(5)
`bkend-quickstart·bkend-auth·bkend-data·bkend-storage·bkend-cookbook`
### 자동 적용(호출 불요)
`bkit-rules`(PDCA 규칙)·`bkit-templates`(문서 템플릿) — 항상 동작.

---

## N. AI-Native 역할 재분배 — 왜 가능한가 (저자 실측)

- 13일 **126세션 · 260 AI-시간 · 병렬 에이전트 477 · 최대 9,770줄 문서 · 만족도 88.4%(199/225).**
- 원칙: **"실행은 AI, 판단은 인간"** (AI 능력: 실행 99% · 분석 85% · 판단 20%).
- 팀: 11인 → **3.8인 + 31 에이전트 (65%↓).** 설계-구현 갭: 30–50% → **<5%.**
- 역할 변화: CTO=AI+인간 오케스트레이터 / PM=시간 단위 스프린트 / QA=목적 달성 보증 / 시니어=AI Native Conductor.

---

## O. 고급 체크리스트 + 자율형 7원칙

### 체크리스트
- [ ] 마스터플랜을 **컨텍스트 포화 후** 작성(박제 = 단일 입력)
- [ ] Context Sizer가 의존성 순서·75K 분할을 처리했는지 확인
- [ ] Sprint 활성 게이트(특히 design exit의 M4+M8)를 이해
- [ ] `/sprint qa`로 S1 7-Layer dataFlow 무결성 검증
- [ ] 4 Auto-Pause의 의미를 알고, 멈추면 *원인을 고친 뒤* resume
- [ ] 비가역 액션(배포·마이그레이션) 전 롤백·audit·base-divergence 점검
- [ ] Trust Score 85+ 확인 후에만 L4, 그래도 게이트는 끄지 않음

### 자율형 7원칙
1. **박제 먼저** — 모호한 설계로 자율주행 켜지 마라. 설계 문서가 운전대.
2. **컨텍스트 포화 후 기획** — 완벽한 프롬프트가 아니라 충분한 맥락.
3. **요청은 Feature급** — 한 줄 요청은 공정을 건너뛴다.
4. **검증은 3중** — 정적·동적·구조화. 무인일수록 전부.
5. **자율은 벌어서 올린다** — Trust 65/85 전엔 승급 금지. 게이트는 끄지 마라.
6. **멈추면 고친 뒤 재개** — Auto-Pause는 안전벨트. 우회 금지.
7. **비가역엔 게이트** — 배포·마이그레이션·대량삭제는 사람이 승인.

---

> **요약**: 자율형 바이브코딩의 본질은 "더 많이 자동화"가 아니라 **"박제(기획)를 단단히 하고, 검증을 다중으로 걸고, 비가역만 사람이 쥐는 것."** bkit은 그걸 PDCA 공정·11 게이트·matchRate 자가수복·Sprint 무인 연쇄·Defense-in-Depth로 구현한 Context Engineering OS다.

> 출처 표기 예: *"AX Lecture by DubDubDub Corp. (ww-w.ai), prepared for an invited guest lecture at KAIST — CC BY 4.0."* bkit은 POPUP STUDIO PTE. LTD.의 오픈소스(Apache-2.0).
