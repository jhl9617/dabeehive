# DB-003 — Project 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:23:37 KST
- Started At: 2026-05-04 15:23:37 KST
- Completed At: 2026-05-04 15:24:56 KST

## Objective

Prisma schema에 Project 모델을 추가해 프로젝트 기본 정보와 repo/workspace 연결 필드를 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `Project` 모델이 name/status/timestamp 필드를 가진다.
- [x] `Project` 모델이 repo URL/owner/name/default branch/workspace path 필드를 가진다.
- [x] `Project`와 `User` owner 관계가 정의되고 Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-003 tracking, log, and evidence files

### Out of Scope

- Issue, Document, Run, Approval, Artifact models
- Project API routes or repository layer
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `Project` model and user owner relation
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-003 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-003/validation.txt`: validation evidence

## Implementation Notes

- Keep future model relations out until their corresponding DB tasks define those models.
- Include both repository identity fields and a local workspace path field for PoC run context.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-001 Prisma schema initialization and DB-002 User model.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `Project` model with owner relation and repo/workspace connection fields.
- Required reviewer action: Confirm project repo/workspace schema fields are acceptable before migration tasks are introduced.

## Changes Made

- Added `Project` model with name, description, status, timestamps, and owner relation.
- Added repo/workspace connection fields: `repoProvider`, `repoUrl`, `repoOwner`, `repoName`, `defaultBranch`, `workspacePath`.
- Added indexes for owner, status, and repo owner/name lookup.
- Added `User.projects` relation and kept later Issue/Document/Run relations deferred.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-003/validation.txt`

## Follow-up Tasks

- DB-004
