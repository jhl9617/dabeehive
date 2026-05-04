# TST-002 — DB Migrate And Seed Validation

## Status

- Status: implemented
- Priority: P0
- Area: Test
- Created At: 2026-05-04 20:08:14 KST
- Started At: 2026-05-04 20:08:14 KST
- Completed At: 2026-05-04 20:14:24 KST

## Objective

Validate local Prisma database migrate and seed behavior enough to prove demo data can be created for the PoC.

## Acceptance Criteria

- [x] Prisma schema validation passes.
- [x] Local/test migration validation is executed or an explicit local DB blocker is recorded.
- [x] Demo seed data is generated or an explicit local DB/seed blocker is recorded.
- [x] Validation evidence and tracking updates are recorded.

## Scope

### In Scope

- Prisma schema and package seed configuration inspection.
- Minimal seed/migration support only if directly required for demo data validation.
- Local/test-safe Prisma validation commands and evidence.
- TST-002 tracking, log, and evidence files.

### Out of Scope

- Production DB access or production migration apply.
- DB repository layer work from DB-012.
- Full REST/MCP happy path validation.
- Jira, Slack, deployment, or full external integrations.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-TST-002.md`: session log.
- `track/evidence/TST-002/validation.txt`: validation evidence.
- Optional server Prisma/package files if seed validation support is missing.

## Implementation Notes

- Use local/test database configuration only.
- No production secret, deploy command, or destructive command is allowed.
- Package dependency additions are not planned.

## Dependencies / Decisions

- Depends on DB-001 through DB-009 Prisma models.
- DB-010 seed script is still P1/not_started, so this task will first determine whether seed validation support already exists.
- No dependency additions.

## Risk / Approval

- Risk Score: 40
- Approval Required: yes
- Reason: TST-002 requires adding a minimal Prisma seed entrypoint and generating an initial migration artifact to validate local demo data creation.
- Changed files:
  - `apps/server/package.json`
  - `apps/server/prisma/seed.cjs`
  - `apps/server/prisma/migrations/...`
- Diff summary: Adds Prisma seed configuration, deterministic demo seed data, and a migration artifact generated from the existing schema.
- Required reviewer action: Confirm the local-only migration/seed validation evidence before using seeded data in later smoke tasks.

## Changes Made

- Added Prisma seed configuration to the server package.
- Added deterministic demo seed data for user, project, issue, document, run, event, approval, and artifact records.
- Added initial migration SQL generated from the existing Prisma schema.
- Recorded migration/seed validation risk in `track/RISKS.md`.
- Local DB-backed migrate/seed execution is blocked because this machine has libpq client tools but no PostgreSQL server binary, and Docker daemon is not running.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Pass | Schema is valid. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Pass | Prisma Client generated under ignored `node_modules`. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` | Pass | Initial migration SQL generated from schema. |
| `node -c apps/server/prisma/seed.cjs` | Pass | Seed script syntax is valid. |
| `initdb -D /private/tmp/dabeehive-tst-002-pg-20260504-2010 -A trust` | Failed | Local libpq install lacks the `postgres` server binary needed by `initdb`. |
| `docker ps --format ...` | Failed | Docker daemon socket was unavailable. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma migrate deploy --schema prisma/schema.prisma` | Blocked | No local PostgreSQL server is reachable at `localhost:55432`. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma db seed --schema prisma/schema.prisma` | Blocked | Seed entrypoint runs, then Prisma cannot reach `localhost:55432`. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Pass | Exited 0 with no compiler output. |
| `pnpm lint` | Pass | Exited 0; `basic lint passed`. |

## Evidence

- `track/evidence/TST-002/validation.txt`

## Follow-up Tasks

- TST-003
