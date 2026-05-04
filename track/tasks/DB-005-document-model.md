# DB-005 — Document 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:29:55 KST
- Started At: 2026-05-04 15:29:55 KST
- Completed At: 2026-05-04 15:31:14 KST

## Objective

Prisma schema에 Document 모델을 추가해 프로젝트별 PRD/ADR/Spec 문서를 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `Document` 모델이 project/type/title/content/version/status 필드를 가진다.
- [x] `Document` 모델이 `Project`와 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-005 tracking, log, and evidence files

### Out of Scope

- AgentRun, RunEvent, Approval, Artifact models
- Document API routes or repository layer
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `Document` model and project relation
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-005 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-005/validation.txt`: validation evidence

## Implementation Notes

- Store document content as text and keep document type string-based for PRD/ADR/Spec flexibility.
- Keep version/status fields minimal for PoC review flows.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-003 Project model.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `Document` model with project relation and PRD/ADR/Spec storage fields.
- Required reviewer action: Confirm document schema basics are acceptable before migration tasks are introduced.

## Changes Made

- Added `Document` model with project relation, type, title, text content, version, status, and timestamps.
- Added `Project.documents` relation.
- Added project/type/status indexes for future document lookup.
- Kept API, repository, migration, and search behavior deferred.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-005/validation.txt`

## Follow-up Tasks

- DB-006
