# AGENTS.md — AI Agent Orchestrator PoC Implementation Rules

이 저장소는 **AI Agent Orchestrator PoC** 구현 저장소다. Codex는 이 파일과 `/track` 디렉토리를 기준으로 작업을 계획, 구현, 검증, 보고해야 한다.

## 0. 절대 원칙

1. **추적 없는 구현 금지**: 코드 변경을 하기 전에 반드시 `/track/MASTER.md`에서 해당 작업 ID를 확인한다.
2. **한 번에 하나의 작업만 수행**: 하나의 Codex 실행에서는 원칙적으로 하나의 Task ID만 `in_progress`로 변경하고 구현한다.
3. **작업 전/후 추적 파일 갱신 필수**: 구현 시작 전 `MASTER.md`, `CURRENT.md`, 작업 파일을 갱신하고, 구현 완료 후 검증 결과와 변경 파일을 기록한다.
4. **PoC 범위 준수**: Jira, Slack, 복잡한 웹 대시보드, 자동 배포, 자동 merge, 결제/테넌트 기능은 구현하지 않는다.
5. **VS Code Extension은 AI 코드 수정 로직을 직접 구현하지 않는다**: 코드 읽기/수정/명령 실행은 Agent SDK adapter에 위임한다.
6. **작동하는 작은 단위 우선**: 큰 설계보다 작은 수용 기준을 통과하는 구현을 우선한다.
7. **검증 없는 완료 금지**: 테스트/빌드/타입체크 중 실행 가능한 검증을 수행하고 결과를 기록한다. 실행 불가 시 이유를 명시한다.
8. **무관한 리팩터링 금지**: 현재 Task ID의 수용 기준과 직접 관련 없는 대규모 구조 변경을 하지 않는다.

## 1. PoC 구현 범위

### 포함

- Orchestrator Server: Project, Issue, Context Document, Agent Run, Approval, Artifact, Run Event 관리
- MCP Server: issue/context/run/approval/artifact 조회 및 제어 tool 제공
- VS Code Extension: 이슈 목록, 실행 시작, SDK Runner 실행, 로그 표시, 승인 처리, diff/test 결과 확인
- Agent SDK Runner: Planner/Coder/Reviewer 흐름, 코드 수정은 SDK adapter에 위임
- Git 연동: local branch, diff 추적, 선택적 Draft PR 생성
- Audit Tracking: SDK event, shell command, 변경 파일, 테스트 결과, 승인 이력 저장

### 제외

- Jira 연동
- Slack 연동
- 자동 배포
- 자동 merge
- production secret 접근
- 결제/과금/멀티테넌트
- VS Code Extension 내부의 자체 patch engine / 자체 shell tool loop

## 2. `/track` 디렉토리 계약

루트에는 반드시 다음 구조를 유지한다.

```txt
track/
├── MASTER.md                 # 전체 구현 작업 목록의 단일 진실 공급원
├── CURRENT.md                # 현재 진행 중인 작업 1개와 작업 컨텍스트
├── DECISIONS.md              # 구현 중 확정된 기술 결정 기록
├── RISKS.md                  # 위험, 차단, 미해결 이슈 기록
├── CHANGELOG.md              # 구현 완료 이력
├── tasks/                    # 작업별 상세 추적 파일
│   ├── README.md
│   └── <TASK-ID>-<slug>.md
├── logs/                     # Codex 실행 세션 로그
│   └── YYYY-MM-DD-<TASK-ID>.md
├── evidence/                 # 테스트 결과, 스크린샷, diff 요약 등 증거 자료
│   └── <TASK-ID>/
└── templates/
    ├── task-template.md
    └── session-log-template.md
```

### 파일별 규칙

- `track/MASTER.md`: 전체 작업 목록, 상태, 우선순위, 수용 기준을 관리한다.
- `track/CURRENT.md`: 현재 진행 중인 작업이 없으면 `No active task`로 둔다.
- `track/tasks/<TASK-ID>-<slug>.md`: 실제 구현 전 반드시 생성한다.
- `track/logs/YYYY-MM-DD-<TASK-ID>.md`: Codex 실행 단위별 작업 로그를 남긴다.
- `track/evidence/<TASK-ID>/`: 검증 결과, 테스트 로그, diff 요약 등 산출물을 둔다.

## 3. Task ID 및 상태 규칙

### Task ID 형식

```txt
<AREA>-<NNN>
```

예시:

- `TRK-001`: tracking/rule 관련 작업
- `SRV-001`: Orchestrator Server 작업
- `DB-001`: Prisma/DB 작업
- `API-001`: REST API 작업
- `MCP-001`: MCP Server 작업
- `EXT-001`: VS Code Extension 작업
- `SDK-001`: Agent SDK Runner 작업
- `GIT-001`: Git/Diff/PR 작업
- `UI-001`: Web/UI 작업
- `SEC-001`: 보안 작업
- `TST-001`: 테스트/검증 작업

### 상태 값

다음 값만 사용한다.

```txt
not_started | planned | in_progress | blocked | implemented | verified | skipped
```

- `not_started`: 아직 착수하지 않음
- `planned`: 상세 task 파일이 생성되고 수용 기준이 정의됨
- `in_progress`: 현재 Codex가 구현 중
- `blocked`: 외부 의존성 또는 모호한 요구사항으로 중단
- `implemented`: 코드 구현은 완료됐으나 검증이 충분하지 않음
- `verified`: 구현 및 실행 가능한 검증 완료
- `skipped`: PoC 범위에서 제외됨. 반드시 사유 기록

## 4. 작업 시작 절차

Codex는 코드 변경 전에 다음을 수행한다.

1. `AGENTS.md`를 읽는다.
2. `/track/MASTER.md`를 읽고 다음 작업 ID를 확인한다.
3. `/track/CURRENT.md`에 다른 `in_progress` 작업이 없는지 확인한다.
4. 작업별 파일이 없으면 `/track/templates/task-template.md`를 기준으로 생성한다.
5. `MASTER.md`에서 해당 작업 상태를 `in_progress`로 변경한다.
6. `CURRENT.md`에 작업 ID, 목표, 범위, 예상 변경 파일, 검증 명령을 기록한다.
7. 작업 구현 범위가 너무 크면 코드를 수정하지 말고 먼저 작업을 더 작은 단위로 분해한다.

## 5. 구현 중 규칙

1. 현재 Task ID의 수용 기준에 필요한 파일만 수정한다.
2. 새로운 dependency를 추가하기 전 이유를 `tasks/<TASK-ID>.md`에 기록한다.
3. public API, DB schema, auth/security 관련 변경은 `RISKS.md`에 기록한다.
4. 기존 파일을 대량 재작성하지 않는다. 필요한 최소 diff를 선호한다.
5. generated file, build output, `node_modules`, `.next`, `dist`, coverage output은 커밋 대상으로 만들지 않는다.
6. 코드 스타일은 기존 repository convention을 우선한다.
7. 타입 정의와 validation schema는 구현과 함께 갱신한다.
8. 실패한 시도도 중요한 경우 session log에 기록한다.

## 6. 구현 완료 절차

코드 변경 후 다음을 반드시 수행한다.

1. 가능한 검증 명령을 실행한다.
   - 예: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
   - repo가 `pnpm`/`yarn`/`bun`을 사용하면 기존 lockfile 기준으로 선택한다.
2. 실행한 명령과 결과를 작업 파일에 기록한다.
3. 변경 파일 목록과 핵심 변경 요약을 작업 파일에 기록한다.
4. `track/evidence/<TASK-ID>/`에 필요한 검증 결과를 저장한다.
5. `MASTER.md` 상태를 다음 중 하나로 변경한다.
   - 검증 완료: `verified`
   - 구현 완료, 검증 미완료: `implemented`
   - 진행 불가: `blocked`
6. `CHANGELOG.md`에 완료 이력을 추가한다.
7. `CURRENT.md`를 `No active task`로 되돌린다.
8. 최종 응답에 Task ID, 변경 요약, 검증 결과, 추적 파일 갱신 내역, 다음 추천 작업을 포함한다.

## 7. 작업 분해 기준

하나의 작업은 다음 기준을 만족해야 한다.

- 하나의 명확한 수용 기준을 가진다.
- 가능하면 1~5개 파일 변경으로 끝난다.
- 독립적으로 검증 가능하다.
- 실패해도 다른 작업을 크게 막지 않는다.
- 1개의 PR 또는 1개의 local diff로 리뷰 가능하다.

작업이 다음 중 하나에 해당하면 더 쪼갠다.

- 여러 도메인(DB + API + UI + Extension)을 동시에 바꾼다.
- 수용 기준이 3개를 초과한다.
- 신규 dependency가 2개 이상 필요하다.
- 구현 후 검증 명령이 명확하지 않다.
- 예상 변경 파일이 6개 이상이다.

## 8. Git 규칙

1. 작업 시작 전 현재 branch와 working tree 상태를 확인한다.
2. 가능하면 작업 branch를 만든다.

```txt
poc/<TASK-ID>-<short-slug>
```

3. 다른 작업의 미완료 변경이 있으면 덮어쓰지 않는다.
4. 자동 merge는 하지 않는다.
5. Draft PR 생성은 명시된 Task에서만 수행한다.
6. 최종 보고 시 `git diff --stat` 수준의 변경 요약을 포함한다.

## 9. Orchestrator Server 구현 규칙

1. Next.js App Router 기반으로 구현한다.
2. API 응답은 일관된 형식을 사용한다.

```ts
type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> };
type ApiError = { error: { code: string; message: string } };
```

3. 입력 검증은 Zod schema를 사용한다.
4. DB 접근은 Prisma client wrapper를 통해 수행한다.
5. 인증/권한은 PoC 최소 구현으로 시작하되, API token은 평문 저장하지 않는다.
6. Run/Event/Artifact/Approval은 audit 추적 가능하게 저장한다.
7. Jira/Slack webhook route는 PoC에서 만들지 않는다.

## 10. MCP 구현 규칙

1. MCP는 Orchestrator 상태와 컨텍스트를 Agent/Extension에 제공하는 계층이다.
2. PoC MCP tool은 최소 기능부터 구현한다.

필수 tool:

```txt
project.list
project.get
issue.list
issue.get
issue.create
run.start
run.status
run.append_event
approval.list
approval.request
approval.respond
artifact.create
artifact.get
context.search
```

3. 코드 수정용 MCP tool을 직접 구현하지 않는다. 코드 수정은 Agent SDK Runner가 담당한다.
4. 모든 write 성격 tool은 인증과 입력 검증을 거친다.
5. tool 실패 시 사람이 읽을 수 있는 error code/message를 반환한다.

## 11. VS Code Extension 구현 규칙

1. Extension은 개발자의 control surface다.
2. Extension이 직접 AI patch engine, file edit tool loop, shell tool loop를 구현하지 않는다.
3. Extension은 SDK adapter를 호출하고 이벤트를 Orchestrator에 업로드한다.
4. API token/provider key는 VS Code SecretStorage에 저장한다.
5. settings.json에는 server URL, feature flag 등 민감하지 않은 값만 저장한다.
6. UI는 PoC 기준으로 다음만 우선 구현한다.
   - 연결 상태 표시
   - Issues Tree
   - Runs Tree
   - Approvals Tree
   - Run Console
   - Approval Panel
   - Diff/Test Result 확인
7. Extension 명령은 작고 명확하게 구현한다.

## 12. Agent SDK Runner 규칙

1. 기본 adapter 이름은 `LocalCodingAgentAdapter`로 한다.
2. PoC 구현체는 하나만 만든다.

```ts
class ClaudeAgentSdkAdapter implements LocalCodingAgentAdapter {}
```

3. Codex/OpenAI/다른 SDK는 adapter 교체 가능성을 위해 interface만 고려하고, PoC에서는 과도하게 구현하지 않는다.
4. SDK 이벤트는 다음 형태로 정규화해 Orchestrator에 저장한다.

```ts
type CodingAgentEvent = {
  runId: string;
  type: 'message' | 'tool_call' | 'tool_result' | 'file_change' | 'command' | 'test_result' | 'error' | 'done';
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
```

5. shell command 실행 결과는 command, exitCode, durationMs, stdout/stderr summary를 기록한다.
6. production secret, deploy command, destructive command는 실행하지 않는다.

## 13. Approval / Risk 규칙

다음 변경은 자동 완료하지 말고 approval 기록을 만든다.

- DB schema/migration 파일 변경
- auth/session/permission 코드 변경
- billing/payment 코드 변경
- deployment/infra 파일 변경
- destructive command 실행 필요
- package dependency 추가
- 대규모 파일 삭제 또는 디렉토리 구조 변경

Approval 기록에는 다음을 포함한다.

- reason
- changed files
- risk score 0~100
- diff summary
- required reviewer action

## 14. 테스트 및 검증 규칙

1. repo의 package manager는 lockfile 기준으로 판단한다.
   - `pnpm-lock.yaml` → `pnpm`
   - `yarn.lock` → `yarn`
   - `bun.lockb` 또는 `bun.lock` → `bun`
   - `package-lock.json` → `npm`
2. 실행 가능한 검증 명령을 우선순위대로 시도한다.
   - lint
   - typecheck
   - unit test
   - build
3. 테스트가 없으면 최소 smoke test 또는 typecheck를 수행한다.
4. 검증 실패 시 임의로 숨기지 말고 실패 로그와 원인을 기록한다.
5. 실패가 현재 Task 범위 밖이면 `RISKS.md`에 기록하고 현재 Task 상태를 `implemented` 또는 `blocked`로 둔다.

## 15. 보안 규칙

1. `.env`, API key, token, private key를 생성하거나 커밋하지 않는다.
2. 예시는 `.env.example`에 placeholder로만 작성한다.
3. API token은 hash 저장을 전제로 구현한다.
4. Extension secret은 SecretStorage 사용을 전제로 구현한다.
5. production deploy, migration apply, secret rotation은 PoC에서 실행하지 않는다.
6. 외부 네트워크 접근이 필요한 경우 작업 파일에 이유를 기록한다.

## 16. Codex 최종 응답 형식

작업 완료 후 반드시 다음 형식으로 응답한다.

```md
## 완료 작업
- Task ID:
- 상태:
- 요약:

## 변경 파일
- `path`: 변경 내용

## 검증
- 실행 명령:
- 결과:
- 실패/미실행 사유:

## 추적 업데이트
- `track/MASTER.md`:
- `track/CURRENT.md`:
- `track/tasks/...`:
- `track/CHANGELOG.md`:

## 다음 추천 작업
- Task ID:
- 이유:
```
