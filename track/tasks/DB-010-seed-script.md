# DB-010 — Seed Script

## Status

- Status: implemented
- Priority: P1
- Area: DB
- Created At: 2026-05-06 11:04:01 KST
- Started At: 2026-05-06 11:04:01 KST
- Completed At: 2026-05-06 11:05:37 KST

## Objective

Validate that the repository has a Prisma seed script capable of creating demo project, issue, and document data for the PoC.

## Acceptance Criteria

- [x] Seed script exists.
- [x] Demo project, issue, and document creation logic is present.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Existing `apps/server/prisma/seed.cjs` validation.
- Prisma schema validation.
- Local DB availability check and blocker recording.
- Tracking, log, and evidence updates.

### Out of Scope

- Schema or migration changes.
- Starting Docker/PostgreSQL.
- Production seed data, secrets, Jira/Slack/full external integrations, or new dependencies.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/DB-010-seed-script.md`: task details and validation results.
- `track/logs/2026-05-06-DB-010.md`: session log.
- `track/evidence/DB-010/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- `apps/server/prisma/seed.cjs` already exists from TST-002 and includes demo user, API token hash, project, issue, document, run, event, approval, and artifact upserts.
- Because local PostgreSQL is unavailable, this task can validate implementation presence but cannot verify actual DB insertion in this environment.

## Dependencies / Decisions

- No new package dependency.
- Depends on DB schema and TST-002 seed entrypoint.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: validation/tracking task only; no schema, migration, secret, dependency, deployment, or source behavior changes planned.

## Changes Made

- Confirmed existing `apps/server/prisma/seed.cjs` includes demo user, API token hash, project, issue, document, run, event, approval, and artifact upserts.
- Confirmed seed syntax, project/issue/document upsert logic, Prisma schema validity, and root lint.
- Actual DB insertion remains unverified because no local PostgreSQL server is reachable.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node -c apps/server/prisma/seed.cjs` | Passed | Seed script syntax is valid. |
| `rg "prisma.project.upsert" apps/server/prisma/seed.cjs` | Passed | Demo project upsert is present. |
| `rg "prisma.issue.upsert" apps/server/prisma/seed.cjs` | Passed | Demo issue upsert is present. |
| `rg "prisma.document.upsert" apps/server/prisma/seed.cjs` | Passed | Demo document upsert is present. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid; Prisma emitted existing package.json#prisma deprecation warning. |
| `pg_isready -h localhost -p 55432` | Failed / Blocked | `localhost:55432 - no response`. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma db seed --schema prisma/schema.prisma` | Failed / Blocked | Seed command ran and failed at `prisma.user.upsert()` because PostgreSQL at `localhost:55432` is unreachable. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `node scripts/track-status.mjs --task DB-010 --status implemented` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |

## Evidence

- `track/evidence/DB-010/validation.txt`

## Follow-up Tasks

- DB-011
