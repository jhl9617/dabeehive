# DB-004 — Issue 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:26:43 KST
- Started At: 2026-05-04 15:26:43 KST
- Completed At: 2026-05-04 15:28:11 KST

## Objective

Prisma schema에 Issue 모델을 추가해 프로젝트별 작업 항목의 title/body/status/priority를 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `Issue` 모델이 title/body/status/priority 필드를 가진다.
- [x] `Issue` 모델이 `Project`와 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-004 tracking, log, and evidence files

### Out of Scope

- Document, Run, Approval, Artifact, PR link models
- Issue API routes or repository layer
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `Issue` model and project relation
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-004 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-004/validation.txt`: validation evidence

## Implementation Notes

- Keep fields aligned with PRD issue basics: title, body, type, status, priority, assignee role.
- Keep future run/approval/PR relations out until their corresponding model tasks define those models.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-003 Project model.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `Issue` model with project relation and status/priority indexes.
- Required reviewer action: Confirm issue schema basics are acceptable before migration tasks are introduced.

## Changes Made

- Added `Issue` model with title, body, type, status, priority, assignee role, labels, and timestamps.
- Added project relation and `Project.issues`.
- Added optional parent/children self relation for epic-to-issue hierarchy.
- Added indexes for project, parent, status, and priority lookup.
- Kept Run/Approval/Artifact/PR relations deferred to later model tasks.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-004/validation.txt`

## Follow-up Tasks

- DB-005
