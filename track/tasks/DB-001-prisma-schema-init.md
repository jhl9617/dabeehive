# DB-001 — Prisma 설치 및 Schema 초기화

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:14:59 KST
- Started At: 2026-05-04 15:14:59 KST
- Completed At: 2026-05-04 15:18:02 KST

## Objective

Server package에 Prisma CLI를 추가하고 초기 `schema.prisma`를 생성해 후속 DB model 작업의 기반을 만든다.

## Acceptance Criteria

- [x] Server package에 Prisma 6.x CLI가 설치되어 있다.
- [x] `apps/server/prisma/schema.prisma`가 존재하고 PostgreSQL datasource와 Prisma client generator를 정의한다.
- [x] Prisma schema validation, build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- Add `prisma` 6.x dev dependency to the server package.
- `apps/server/prisma/schema.prisma`
- `apps/server/package.json`
- `pnpm-lock.yaml`
- `track/RISKS.md`
- DB-001 tracking, log, and evidence files

### Out of Scope

- DB model definitions beyond the empty initial schema shell
- migration creation or migration apply
- real database connection or production secret access
- seed scripts
- repository CRUD layer
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: initial Prisma schema
- `apps/server/package.json`: add Prisma CLI dev dependency
- `pnpm-lock.yaml`: lock Prisma CLI dependency
- `track/RISKS.md`: record DB schema initialization risk
- `track/MASTER.md`: DB-001 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-001/validation.txt`: validation evidence

## Implementation Notes

- Use Prisma 6.x as required by the PRD.
- Place schema under `apps/server/prisma/schema.prisma` because `apps/server` is the Next.js server package root in this monorepo.
- Keep model definitions for DB-002 through DB-009.
- Do not run migrations or connect to a production database.

## Dependencies / Decisions

- Depends on SRV-005 `@prisma/client` dependency and Prisma client wrapper path.
- Add `prisma` dev dependency to run schema validation and future generate/migrate commands.

## Risk / Approval

- Risk Score: 55
- Approval Required: yes
- Reason: Package dependency addition and DB schema file creation.
- Changed files: `apps/server/package.json`, `pnpm-lock.yaml`, `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add Prisma CLI 6.x and initial PostgreSQL schema shell without models or migrations.
- Required reviewer action: Confirm Prisma CLI dependency and initial schema shell are acceptable; no migration will be applied in this task.

## Changes Made

- Added `prisma` 6.x to the server package dev dependencies.
- Added `apps/server/prisma/schema.prisma` with `prisma-client-js` generator and PostgreSQL datasource.
- Validated the schema with a placeholder local `DATABASE_URL`.
- Ran Prisma generate for validation only; generated output remains ignored under `node_modules`.
- Kept DB models and migrations deferred to DB-002 through DB-011.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server add -D prisma@6` | Passed | Installed `prisma@^6.19.3`. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Failed then Passed | Initial sandbox run could not reach Prisma engine host; escalated run passed. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Failed then Passed | Initial sandbox run could not reach Prisma engine host; escalated run generated client under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-001/validation.txt`

## Follow-up Tasks

- DB-002
