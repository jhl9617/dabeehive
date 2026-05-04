# DB-007 — RunEvent 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:36:14 KST
- Started At: 2026-05-04 15:36:14 KST
- Completed At: 2026-05-04 15:38:32 KST

## Objective

Prisma schema에 RunEvent 모델을 추가해 SDK message/tool/command/test/error 이벤트를 AgentRun 단위로 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `RunEvent` 모델이 runId/type/message/metadata/createdAt 필드를 가진다.
- [x] `RunEvent` 모델이 `AgentRun`과 cascade 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-007 tracking, log, and evidence files

### Out of Scope

- Approval or Artifact models
- SDK runner implementation
- run event API routes or SSE
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `RunEvent` model and AgentRun relation
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-007 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-007/validation.txt`: validation evidence

## Implementation Notes

- Align event type storage with `CodingAgentEvent.type` from AGENTS.md.
- Store command/test/tool details in JSON metadata for PoC flexibility.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-006 AgentRun model.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `RunEvent` model with AgentRun cascade relation and event metadata storage.
- Required reviewer action: Confirm event schema basics are acceptable before migration tasks are introduced.

## Changes Made

- Added `RunEvent` model with runId, type, optional message, metadata JSON, and createdAt fields.
- Added `AgentRun.events` relation with cascade delete.
- Added indexes for run timeline lookup and event type filtering.
- Kept Approval and Artifact models deferred to DB-008 and DB-009.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-007/validation.txt`

## Follow-up Tasks

- DB-008
