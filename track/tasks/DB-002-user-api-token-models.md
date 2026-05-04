# DB-002 — User/ApiToken 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:20:31 KST
- Started At: 2026-05-04 15:20:31 KST
- Completed At: 2026-05-04 15:21:52 KST

## Objective

Prisma schema에 PoC 인증 기반이 되는 `User`와 `ApiToken` 모델을 추가하고 API token hash 저장 구조를 정의한다.

## Acceptance Criteria

- [x] `User` 모델이 식별자, email, role, timestamp 필드를 가진다.
- [x] `ApiToken` 모델이 `tokenHash` unique 필드와 사용자 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-002 tracking, log, and evidence files

### Out of Scope

- Account/Session auth provider models
- Project, Issue, Document, Run, Approval, Artifact models
- migrations or migration apply
- API token generation, hashing implementation, or auth middleware
- production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `User` and `ApiToken`
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-002 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-002/validation.txt`: validation evidence

## Implementation Notes

- Store only token hashes in the schema; plaintext token storage is out of scope and prohibited.
- Keep future relation fields out until the corresponding model tasks define them.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-001 initial Prisma schema.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 50
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `User` and `ApiToken` models with unique email/token hash and cascade user-token relation.
- Required reviewer action: Confirm the User/ApiToken schema shape is acceptable before migration tasks are introduced.

## Changes Made

- Added `User` model with unique email, role, optional profile fields, timestamps, and API token relation.
- Added `ApiToken` model with unique `tokenHash`, user relation, optional usage/expiry timestamps, and userId index.
- Preserved plaintext token exclusion by storing only `tokenHash`.
- Kept other auth/provider and domain models deferred to later tasks.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-002/validation.txt`

## Follow-up Tasks

- DB-003
