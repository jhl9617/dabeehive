# Implementation Master Track — AI Agent Orchestrator PoC

이 문서는 전체 PoC 구현 목록의 단일 진실 공급원이다. Codex는 코드 변경 전에 반드시 이 문서를 읽고, 하나의 Task ID를 선택해 상태를 갱신해야 한다.

## 상태 값

```txt
not_started | planned | in_progress | blocked | implemented | verified | skipped
```

## 우선순위

```txt
P0 = PoC 필수
P1 = PoC 핵심 보완
P2 = 데모 품질 개선
P3 = 후속 확장
```

## 진행 요약

| 항목 | 값 |
|---|---:|
| 전체 작업 수 | 96 |
| verified | 17 |
| implemented | 0 |
| in_progress | 0 |
| blocked | 0 |
| not_started | 79 |

---

## Phase 0 — Tracking & Repository Rules

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| TRK-001 | verified | P0 | Tracking | 루트 `AGENTS.md` 추가 | Codex 구현 규칙이 루트에 존재한다 |
| TRK-002 | verified | P0 | Tracking | `/track` 기본 구조 생성 | MASTER/CURRENT/DECISIONS/RISKS/CHANGELOG/templates 디렉토리와 파일이 존재한다 |
| TRK-003 | verified | P0 | Tracking | PoC PRD를 `docs/`에 고정 | PoC 요구사항 문서가 repo 내부에서 참조 가능하다 |
| TRK-004 | verified | P0 | Tracking | task template 정리 | 신규 작업 파일 생성 규칙이 명확하다 |
| TRK-005 | verified | P0 | Tracking | session log template 정리 | Codex 실행 로그 형식이 명확하다 |
| TRK-006 | not_started | P1 | Tracking | task status update script 초안 | 선택 사항. 상태 변경 보조 스크립트 또는 npm script가 있다 |

---

## Phase 1 — Monorepo / Project Foundation

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| FND-001 | verified | P0 | Foundation | repository package manager 결정 | lockfile과 package manager가 하나로 정리된다 |
| FND-002 | verified | P0 | Foundation | workspace 구조 생성 | `apps/server`, `apps/vscode-extension`, `packages/shared` 또는 동등 구조가 존재한다 |
| FND-003 | verified | P0 | Foundation | TypeScript base config 생성 | 공통 tsconfig와 app별 tsconfig가 존재한다 |
| FND-004 | verified | P0 | Foundation | lint/format 기본 설정 | lint 명령이 실행 가능하다 |
| FND-005 | verified | P0 | Foundation | 공통 타입 package 생성 | shared package에서 API/domain 타입을 export한다 |
| FND-006 | not_started | P1 | Foundation | environment example 작성 | `.env.example`에 필요한 placeholder가 있다 |
| FND-007 | not_started | P1 | Foundation | README PoC 실행 방법 작성 | 로컬 실행 순서가 문서화된다 |

---

## Phase 2 — Orchestrator Server Base

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| SRV-001 | verified | P0 | Server | Next.js App Router 앱 초기화 | server app이 dev 모드로 실행된다 |
| SRV-002 | verified | P0 | Server | 기본 layout/page 구성 | 홈 또는 health 페이지가 렌더링된다 |
| SRV-003 | verified | P0 | Server | API response helper 작성 | success/error 응답 helper가 있다 |
| SRV-004 | verified | P0 | Server | Zod validation helper 작성 | route에서 재사용 가능한 validation helper가 있다 |
| SRV-005 | verified | P0 | Server | Prisma client singleton 작성 | DB client import 경로가 정리된다 |
| SRV-006 | not_started | P1 | Server | server logger 작성 | API/Run 이벤트 기록용 logger wrapper가 있다 |
| SRV-007 | not_started | P1 | Server | server error boundary/not-found 처리 | 기본 에러 UX가 있다 |

---

## Phase 3 — Database / Prisma Models

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| DB-001 | verified | P0 | DB | Prisma 설치 및 schema 초기화 | `prisma/schema.prisma`가 존재한다 |
| DB-002 | verified | P0 | DB | User/ApiToken 모델 정의 | 사용자와 API token hash 저장 구조가 있다 |
| DB-003 | not_started | P0 | DB | Project 모델 정의 | repo/workspace 연결 필드가 있다 |
| DB-004 | not_started | P0 | DB | Issue 모델 정의 | title/body/status/priority/project 관계가 있다 |
| DB-005 | not_started | P0 | DB | Document 모델 정의 | PRD/ADR/Spec 저장이 가능하다 |
| DB-006 | not_started | P0 | DB | AgentRun 모델 정의 | run 상태와 issue/project 연결이 가능하다 |
| DB-007 | not_started | P0 | DB | RunEvent 모델 정의 | SDK event/tool/command/test 로그 저장이 가능하다 |
| DB-008 | not_started | P0 | DB | Approval 모델 정의 | spec/final/risk approval 저장이 가능하다 |
| DB-009 | not_started | P0 | DB | Artifact 모델 정의 | plan/diff/test_report/pr_url 저장이 가능하다 |
| DB-010 | not_started | P1 | DB | Seed script 작성 | demo project/issue/document가 생성된다 |
| DB-011 | not_started | P1 | DB | migration 실행 검증 | local DB에 migrate가 성공한다 |
| DB-012 | not_started | P1 | DB | Prisma repository layer 작성 | 주요 모델 CRUD 함수가 lib 계층에 있다 |

---

## Phase 4 — REST API

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| API-001 | not_started | P0 | API | `GET /api/health` 구현 | health 응답이 반환된다 |
| API-002 | not_started | P0 | API | Project list/create API | 프로젝트 목록/생성이 가능하다 |
| API-003 | not_started | P0 | API | Project detail/update API | 프로젝트 조회/수정이 가능하다 |
| API-004 | not_started | P0 | API | Issue list/create API | 이슈 목록/생성이 가능하다 |
| API-005 | not_started | P0 | API | Issue detail/update API | 이슈 조회/수정이 가능하다 |
| API-006 | not_started | P0 | API | Document list/create API | 문서 목록/생성이 가능하다 |
| API-007 | not_started | P0 | API | Document detail/update API | 문서 조회/수정이 가능하다 |
| API-008 | not_started | P0 | API | Run create/list API | run 생성/목록 조회가 가능하다 |
| API-009 | not_started | P0 | API | Run detail API | run 상세와 이벤트 조회가 가능하다 |
| API-010 | not_started | P0 | API | Run event append API | Extension이 SDK 이벤트를 업로드할 수 있다 |
| API-011 | not_started | P0 | API | Approval list/detail API | 승인 목록/상세 조회가 가능하다 |
| API-012 | not_started | P0 | API | Approval respond API | approve/reject/request_changes 처리가 가능하다 |
| API-013 | not_started | P0 | API | Artifact create/list API | plan/diff/test artifact 저장과 조회가 가능하다 |
| API-014 | not_started | P1 | API | Run SSE stream API | run event가 SSE로 스트리밍된다 |
| API-015 | not_started | P1 | API | API token 인증 middleware | Bearer token 인증이 가능하다 |
| API-016 | not_started | P1 | API | 공통 API 테스트 작성 | 핵심 API happy path 테스트가 있다 |

---

## Phase 5 — MCP Server

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| MCP-001 | not_started | P0 | MCP | MCP route handler 구성 | MCP endpoint가 초기화된다 |
| MCP-002 | not_started | P0 | MCP | MCP auth guard 연결 | Bearer token 없는 요청을 거부한다 |
| MCP-003 | not_started | P0 | MCP | `project.list/get` tools | MCP로 프로젝트 조회가 가능하다 |
| MCP-004 | not_started | P0 | MCP | `issue.list/get/create` tools | MCP로 이슈 조회/생성이 가능하다 |
| MCP-005 | not_started | P0 | MCP | `run.start/status` tools | MCP로 run 시작/상태 조회가 가능하다 |
| MCP-006 | not_started | P0 | MCP | `run.append_event` tool | SDK 이벤트 업로드가 가능하다 |
| MCP-007 | not_started | P0 | MCP | `approval.list/request/respond` tools | MCP로 승인 플로우 제어가 가능하다 |
| MCP-008 | not_started | P0 | MCP | `artifact.create/get` tools | MCP로 산출물 저장/조회가 가능하다 |
| MCP-009 | not_started | P1 | MCP | `context.search` tool | 문서/이슈 기반 간단 검색이 가능하다 |
| MCP-010 | not_started | P1 | MCP | MCP resources 구현 | issue/document/run resource를 읽을 수 있다 |
| MCP-011 | not_started | P1 | MCP | MCP prompts 구현 | implementation-plan/review-diff prompt가 있다 |
| MCP-012 | not_started | P1 | MCP | MCP smoke test 작성 | tool 호출 smoke test가 통과한다 |

---

## Phase 6 — VS Code Extension Base

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| EXT-001 | not_started | P0 | Extension | VS Code Extension scaffold 생성 | extension host에서 activate 된다 |
| EXT-002 | not_started | P0 | Extension | contributes commands/views 설정 | Activity Bar와 기본 command가 보인다 |
| EXT-003 | not_started | P0 | Extension | SecretStorage token 저장 구현 | API token이 settings.json에 저장되지 않는다 |
| EXT-004 | not_started | P0 | Extension | Orchestrator REST client 작성 | serverUrl/token 기반 API 호출이 가능하다 |
| EXT-005 | not_started | P0 | Extension | 연결 상태 status bar 구현 | connected/disconnected가 표시된다 |
| EXT-006 | not_started | P0 | Extension | Projects/Issues Tree 구현 | 프로젝트/이슈 목록이 표시된다 |
| EXT-007 | not_started | P0 | Extension | Runs Tree 구현 | run 상태별 목록이 표시된다 |
| EXT-008 | not_started | P0 | Extension | Approvals Tree 구현 | pending approval이 표시된다 |
| EXT-009 | not_started | P0 | Extension | Create Issue command | VS Code에서 이슈 생성이 가능하다 |
| EXT-010 | not_started | P0 | Extension | Start Run command | 선택 이슈로 run 생성이 가능하다 |
| EXT-011 | not_started | P1 | Extension | Run Console Webview | run event/log를 표시한다 |
| EXT-012 | not_started | P1 | Extension | Approval Panel Webview | 승인 상세와 버튼이 동작한다 |
| EXT-013 | not_started | P1 | Extension | Artifact/Diff view command | diff/test artifact를 열 수 있다 |
| EXT-014 | not_started | P1 | Extension | notification 구현 | run 완료/승인 요청 알림이 뜬다 |
| EXT-015 | not_started | P1 | Extension | refresh/reconnect command | 수동 갱신과 재연결이 가능하다 |
| EXT-016 | not_started | P2 | Extension | Webview CSP 정리 | 기본 CSP가 설정된다 |

---

## Phase 7 — Agent SDK Runner

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| SDK-001 | not_started | P0 | SDK | `LocalCodingAgentAdapter` interface 정의 | adapter 교체 가능한 타입이 있다 |
| SDK-002 | not_started | P0 | SDK | `CodingRunInput` 타입 정의 | runId/issue/workspace/systemInstruction 등이 포함된다 |
| SDK-003 | not_started | P0 | SDK | `CodingAgentEvent` 타입 정의 | message/tool/file/command/test/done 이벤트 타입이 있다 |
| SDK-004 | not_started | P0 | SDK | Claude Agent SDK adapter skeleton | start/cancel 메서드 구조가 있다 |
| SDK-005 | not_started | P0 | SDK | Planner instruction builder | issue/context 기반 구현 계획 prompt가 생성된다 |
| SDK-006 | not_started | P0 | SDK | Coder instruction builder | 승인된 plan 기반 코드 수정 prompt가 생성된다 |
| SDK-007 | not_started | P0 | SDK | Reviewer instruction builder | diff/test 결과 검토 prompt가 생성된다 |
| SDK-008 | not_started | P0 | SDK | SDK event normalization | SDK 이벤트가 Orchestrator RunEvent 형태로 변환된다 |
| SDK-009 | not_started | P0 | SDK | Run cancellation handling | cancel command가 adapter에 전달된다 |
| SDK-010 | not_started | P1 | SDK | allowed tools 설정 | read/edit/bash/search 등 허용 tool 설정이 명시된다 |
| SDK-011 | not_started | P1 | SDK | blocked command detector | 위험 명령 실행 전 차단 또는 승인 요구가 가능하다 |
| SDK-012 | not_started | P1 | SDK | test command detection | package manager 기준 test/lint 명령을 추론한다 |
| SDK-013 | not_started | P1 | SDK | SDK Runner dry-run mode | 실제 수정 없이 prompt/plan 검증이 가능하다 |
| SDK-014 | not_started | P1 | SDK | SDK adapter smoke test | fake adapter 또는 mock으로 event stream 테스트가 있다 |

---

## Phase 8 — Workflow / Approval / Artifact

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| WFL-001 | not_started | P0 | Workflow | Run state machine 정의 | queued/planning/waiting/coding/reviewing/succeeded/failed 상태가 있다 |
| WFL-002 | not_started | P0 | Workflow | Plan approval 생성 흐름 | Planner 결과 후 approval이 생성된다 |
| WFL-003 | not_started | P0 | Workflow | Approval respond 후 run 재개 | 승인 후 다음 단계로 진행 가능하다 |
| WFL-004 | not_started | P0 | Workflow | Final diff approval 흐름 | 코드 수정 후 최종 승인을 요청한다 |
| WFL-005 | not_started | P0 | Workflow | Artifact 저장 규칙 구현 | plan/diff/test/review artifact가 저장된다 |
| WFL-006 | not_started | P1 | Workflow | Risk assessment helper | 변경 파일 기반 risk score가 계산된다 |
| WFL-007 | not_started | P1 | Workflow | sensitive file detector | auth/db/deploy 파일 변경을 감지한다 |
| WFL-008 | not_started | P1 | Workflow | approval evidence rendering | approval 상세에 근거가 표시된다 |

---

## Phase 9 — Git / Diff / Optional PR

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| GIT-001 | not_started | P0 | Git | workspace git status helper | 현재 branch/dirty 상태를 조회한다 |
| GIT-002 | not_started | P0 | Git | task branch creation | `poc/<TASK-ID>-slug` branch 생성이 가능하다 |
| GIT-003 | not_started | P0 | Git | changed files detector | 변경 파일 목록을 수집한다 |
| GIT-004 | not_started | P0 | Git | diff summary generator | 사람이 읽는 diff summary가 생성된다 |
| GIT-005 | not_started | P0 | Git | test result artifact 생성 | 테스트 결과가 artifact로 저장된다 |
| GIT-006 | not_started | P1 | Git | Draft PR config | GitHub repo/token 설정 구조가 있다 |
| GIT-007 | not_started | P1 | Git | optional Draft PR command | 최종 승인 후에만 Draft PR 생성이 가능하다 |
| GIT-008 | not_started | P2 | Git | PR body template | plan/diff/test/approval 링크가 포함된다 |

---

## Phase 10 — Minimal Web UI

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| UI-001 | not_started | P1 | UI | 기본 dashboard layout | 프로젝트/이슈/run 접근 링크가 있다 |
| UI-002 | not_started | P1 | UI | Project list page | 프로젝트 목록이 보인다 |
| UI-003 | not_started | P1 | UI | Issue list page | 이슈 목록과 생성 버튼이 있다 |
| UI-004 | not_started | P1 | UI | Run detail page | run 상태/event/artifact가 보인다 |
| UI-005 | not_started | P1 | UI | Approval list page | pending approval 목록이 보인다 |
| UI-006 | not_started | P1 | UI | Approval detail action | approve/reject가 가능하다 |
| UI-007 | not_started | P2 | UI | Artifact viewer | markdown/test/diff artifact를 볼 수 있다 |
| UI-008 | not_started | P2 | UI | basic loading/error states | 기본 로딩/에러 상태가 있다 |

---

## Phase 11 — Security / Configuration

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| SEC-001 | not_started | P0 | Security | API token hash utility | token hash/verify가 가능하다 |
| SEC-002 | not_started | P0 | Security | Bearer auth middleware | REST/MCP에서 token 검증이 가능하다 |
| SEC-003 | not_started | P0 | Security | Secret redaction helper | logs/artifacts에서 secret 패턴이 마스킹된다 |
| SEC-004 | not_started | P1 | Security | Extension SecretStorage audit | 민감값이 settings에 남지 않는다 |
| SEC-005 | not_started | P1 | Security | dangerous command denylist | deploy/delete/pipe shell 등 차단 목록이 있다 |
| SEC-006 | not_started | P1 | Security | env validation | 서버 시작 시 필수 env 검증이 있다 |
| SEC-007 | not_started | P2 | Security | rate/basic abuse guard | API token 호출에 기본 방어가 있다 |

---

## Phase 12 — Tests / Demo / Acceptance

| ID | 상태 | 우선순위 | 영역 | 작업 | 수용 기준 |
|---|---|---:|---|---|---|
| TST-001 | not_started | P0 | Test | server typecheck/lint 통과 | type/lint 명령이 성공한다 |
| TST-002 | not_started | P0 | Test | DB migrate/seed 검증 | demo data가 생성된다 |
| TST-003 | not_started | P0 | Test | REST happy path 검증 | project→issue→run→approval 흐름이 동작한다 |
| TST-004 | not_started | P0 | Test | MCP smoke 검증 | 핵심 MCP tools 호출이 성공한다 |
| TST-005 | not_started | P0 | Test | Extension activation 검증 | extension host에서 activate 된다 |
| TST-006 | not_started | P0 | Test | SDK fake run 검증 | fake adapter로 run event 흐름이 동작한다 |
| TST-007 | not_started | P0 | Test | end-to-end demo scenario | VS Code에서 issue→plan→approval→coding→review 흐름이 재현된다 |
| TST-008 | not_started | P1 | Test | final acceptance checklist | PoC 수용 기준 체크리스트가 채워진다 |
| TST-009 | not_started | P1 | Test | known issues 문서화 | 남은 리스크와 미구현 범위가 명확하다 |
| TST-010 | not_started | P1 | Test | demo script 작성 | 데모 진행 순서와 예상 결과가 문서화된다 |
