# TST-012 — PGlite Temporary DB Smoke

## Status

- Status: verified
- Priority: P1
- Area: Test
- Created At: 2026-05-06 16:27:58 KST
- Started At: 2026-05-06 16:27:58 KST
- Completed At: 2026-05-06 16:44 KST

## Objective

Add an H2-like independent temporary database path for local smoke validation by using PGlite-backed PostgreSQL without requiring a developer-installed PostgreSQL server or Docker daemon.

## Acceptance Criteria

- [x] A root command starts an isolated temporary PGlite PostgreSQL socket, applies Prisma migration, runs seed, and verifies seeded data.
- [x] The command cleans up its temporary data directory and does not require external PostgreSQL or Docker.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Root package scripts for the temporary DB smoke.
- PGlite temporary DB smoke script under `scripts/`.
- Required dev dependencies for PGlite and socket access.
- README/demo/known issue wording updates if the blocker changes.
- TST-012 tracking, evidence, and changelog files.

### Out of Scope

- Replacing the production PostgreSQL provider.
- Full REST/MCP/E2E smoke unless the temporary DB socket proves compatible in this task.
- Jira, Slack, full external integrations, deployment, automatic merge, production secret access, or custom AI code editing engine.

## Expected Files

- `package.json`: root temporary DB smoke script and dev dependencies.
- `pnpm-lock.yaml`: dependency lockfile update.
- `scripts/pglite-temp-db-smoke.mjs`: temporary PGlite migration/seed smoke.
- `README.md`: temporary DB usage note.
- `track/evidence/TST-012/validation.txt`: validation evidence.
- `track/MASTER.md`: TST-012 status update.
- `track/CURRENT.md`: active task state.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- PGlite is a WASM PostgreSQL implementation that can run in Node without a local PostgreSQL daemon or Docker.
- Use `@electric-sql/pglite-socket` so existing Prisma CLI paths can connect through a PostgreSQL-compatible socket URL.
- Keep the script deterministic, temporary-directory based, and local-only.

## Dependencies / Decisions

- Add dev dependencies:
  - `@electric-sql/pglite`: embedded PostgreSQL engine for temporary DB.
  - `@electric-sql/pglite-socket`: PostgreSQL socket server so Prisma CLI can connect using `DATABASE_URL`.
- Reason: user requested H2-like independent temporary DB usage; existing DB-backed validation is blocked by missing local PostgreSQL/Docker.

## Risk / Approval

- Risk Score: 35
- Approval Required: yes
- Reason: Adds package dependencies and introduces a new temporary DB validation path.
- Changed files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `scripts/pglite-temp-db-smoke.mjs`
  - `README.md`
- Diff summary: Add local-only PGlite smoke command for migrate/seed validation.
- Required reviewer action: Confirm dependency addition is acceptable for PoC local validation.

## Changes Made

- Added `pnpm test:temp-db` as the root temporary DB smoke command.
- Added `scripts/pglite-temp-db-smoke.mjs`, which creates a temporary PGlite data directory, exposes it through a PostgreSQL-compatible localhost socket, runs Prisma migrate/seed, verifies seeded core tables, and removes the temporary directory on exit.
- Added PGlite dev dependencies required for the local-only temporary DB smoke.
- Updated README database and blocker documentation to include the isolated migrate/seed path without replacing production PostgreSQL.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm test:temp-db` | Pass | Temporary PGlite socket migrated, seeded, verified core table counts, and cleaned up. |
| `pnpm lint` | Pass | Basic repository lint passed. |
| `pnpm test:shared` | Pass | Existing shared helper regression tests still pass. |
| `pnpm track:status -- --task TST-012 --status verified --dry-run` | Pass | MASTER summary would become verified=125, in_progress=0. |
| `git diff --check` | Pass | No whitespace errors. |

## Evidence

- `track/evidence/TST-012/validation.txt`

## Follow-up Tasks

- DB-backed REST/MCP smoke against the temporary DB if server runtime compatibility is proven or requested separately.
