# TST-013 — Single-command Temporary Dev Stack

## Status

- Status: verified
- Priority: P1
- Area: Test
- Created At: 2026-05-06 16:41:25 KST
- Started At: 2026-05-06 16:41:25 KST
- Completed At: 2026-05-06 16:54 KST

## Objective

Add one local command that starts an independent temporary database, applies Prisma migrations, seeds demo data, and launches the Next.js server against that temporary database.

## Acceptance Criteria

- [x] A root command can run the temporary local dev stack without a developer-installed PostgreSQL server or Docker daemon.
- [x] The command applies migrations and seed data before starting the server.
- [x] The command has a smoke mode that verifies server startup and exits cleanly for CI/local validation.
- [x] Documentation and tracking evidence are updated.

## Scope

### In Scope

- Root package script for the single-command temporary dev stack.
- A local orchestration script under `scripts/`.
- README usage note.
- TST-013 tracking, log, evidence, and changelog files.

### Out of Scope

- Docker Compose.
- Production PostgreSQL provider replacement.
- Deployment, Jira, Slack, production secrets, automatic PR creation, or custom AI code editing engine.
- Long-running background daemon management beyond the current command process.

## Expected Files

- `package.json`: root `dev:temp` command.
- `scripts/dev-temp-stack.mjs`: temporary DB and server orchestration.
- `README.md`: one-command local stack usage.
- `track/evidence/TST-013/validation.txt`: validation evidence.
- `track/MASTER.md`: TST-013 status update.
- `track/CURRENT.md`: active task state.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- Reuse the PGlite socket approach introduced by TST-012.
- Keep the database temporary and local-only by default.
- In normal mode, keep the Next.js dev server attached to the foreground process until Ctrl-C.
- In smoke mode, start the stack, wait for `/api/health`, then shut everything down and clean up.

## Dependencies / Decisions

- No new dependency is planned. Reuse `@electric-sql/pglite` and `@electric-sql/pglite-socket`.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds local developer orchestration only, with no dependency, schema, auth, deployment, or external integration changes.
- Changed files:
  - `package.json`
  - `scripts/dev-temp-stack.mjs`
  - `README.md`
- Diff summary: Add one command for temporary DB preparation and server startup.
- Required reviewer action: Run `pnpm dev:temp -- --smoke` locally.

## Changes Made

- Added root `pnpm dev:temp` command.
- Added `scripts/dev-temp-stack.mjs`, which starts a temporary PGlite PostgreSQL socket, runs Prisma generate/migrate/seed, starts Next.js dev server, and cleans up on exit.
- Added `--smoke` mode to verify `/api/health` and DB-backed `/api/projects`, then stop cleanly.
- Added CLI options for server host/port, DB host/port, timeout, and help output.
- Tuned the server `DATABASE_URL` with single-connection PgBouncer mode for stable Prisma queries through the PGlite socket.
- Documented the one-command temporary stack in README.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm dev:temp -- --smoke` | Pass | Started PGlite, generated Prisma client, migrated, seeded, launched server, verified health and DB-backed project list, then cleaned up. |
| `pnpm lint` | Pass | Basic repository lint passed. |
| `pnpm test:temp-db` | Pass | Existing isolated PGlite migrate/seed smoke still passes. |
| `pnpm dev:temp -- --help` | Pass | Usage text renders. |
| `pnpm track:status -- --task TST-013 --status verified --dry-run` | Pass | MASTER summary would become verified=126, in_progress=0. |
| `git diff --check` | Pass | No whitespace errors. |

## Evidence

- `track/evidence/TST-013/validation.txt`

## Follow-up Tasks

- Optional REST/MCP smoke wrappers can reuse the generated `DATABASE_URL` if a future task needs a longer-running scripted stack.
