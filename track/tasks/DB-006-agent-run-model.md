# DB-006 — AgentRun 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:32:52 KST
- Started At: 2026-05-04 15:32:52 KST
- Completed At: 2026-05-04 15:34:18 KST

## Objective

Prisma schema에 AgentRun 모델을 추가해 run 상태와 project/issue 연결을 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `AgentRun` 모델이 status, agent role/provider/model, input/output/error, timestamp 필드를 가진다.
- [x] `AgentRun` 모델이 `Project`와 필수 관계, `Issue`와 선택 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-006 tracking, log, and evidence files

### Out of Scope

- RunEvent, Approval, Artifact models
- AgentProfile model or management UI
- Agent SDK runner implementation
- run API routes or repository layer
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `AgentRun` model and project/issue relations
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-006 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-006/validation.txt`: validation evidence

## Implementation Notes

- Store agent role/provider/model snapshots directly on `AgentRun` for PoC scope because MASTER has no separate AgentProfile model task.
- Keep SDK event storage deferred to DB-007 RunEvent.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-003 Project model and DB-004 Issue model.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `AgentRun` model with status and project/issue relations.
- Required reviewer action: Confirm run schema basics and direct agent snapshot fields are acceptable before migration tasks are introduced.

## Changes Made

- Added `AgentRun` model with status, agent role/provider/model snapshot fields, JSON context/artifact fields, output/error fields, and run timestamps.
- Added required `Project` relation and optional `Issue` relation.
- Added `Project.runs` and `Issue.runs` relations.
- Added indexes for project, issue, and status lookup.
- Kept SDK event details deferred to DB-007.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-006/validation.txt`

## Follow-up Tasks

- DB-007
