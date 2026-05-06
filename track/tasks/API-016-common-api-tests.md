# API-016 — Common API tests

## Status

- Status: implemented
- Priority: P1
- Area: API
- Created At: 2026-05-06 11:35:14 KST
- Started At: 2026-05-06 11:35:14 KST
- Completed At: 2026-05-06 12:05:51 KST

## Objective

Add a common API happy-path test command for the core REST flow so the project -> issue -> run -> approval path can be run consistently against a local Orchestrator server.

## Acceptance Criteria

- [x] A repository-level API test command exists.
- [x] The REST happy-path smoke script supports shared request behavior, response shape assertions, and optional Bearer token input.
- [x] The test command is validated or the DB/runtime blocker is recorded with evidence.

## Scope

### In Scope

- Root package script for API happy-path smoke validation.
- Existing REST happy-path smoke script improvements.
- API-016 tracking, log, and evidence files.

### Out of Scope

- Adding a test framework dependency.
- Mocking Prisma or replacing DB-backed route behavior.
- Full route-by-route auth rollout.
- Jira, Slack, GitHub, deployment, automatic merge, or external integrations.
- VS Code Extension or MCP tests.

## Expected Files

- `package.json`: API test command
- `scripts/rest-happy-path-smoke.mjs`: shared request/assertion behavior and optional Bearer token
- `track/RISKS.md`: DB-backed happy-path blocker note
- `track/MASTER.md`: API-016 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-API-016.md`: session log
- `track/evidence/API-016/validation.txt`: validation evidence

## Implementation Notes

- Reuse the existing TST-003 happy-path smoke script instead of adding a new dependency.
- Keep the script DB-backed because the core API happy path depends on persisted Project, Issue, Run, and Approval records.
- Support `DABEEHIVE_REST_TOKEN` for future authenticated REST rollout while keeping the token optional for current routes.

## Dependencies / Decisions

- Depends on API-002 through API-015 route behavior.
- Depends on a reachable local PostgreSQL database for full happy-path execution.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds/updates validation scripts only; no schema, auth behavior, dependency, deployment, destructive command, or external integration changes.

## Changes Made

- Added root `pnpm test:api` script for the REST happy-path smoke command.
- Updated `scripts/rest-happy-path-smoke.mjs` with shared request headers, optional `DABEEHIVE_REST_TOKEN`, API response shape checks, per-step assertions, and structured output.
- Recorded that the DB-backed happy-path execution remains blocked by missing local PostgreSQL.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node -c scripts/rest-happy-path-smoke.mjs` | Passed | Script syntax is valid. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n '"test:api"\|DABEEHIVE_REST_TOKEN\|assertString\|assertEqual\|authenticated\|steps' package.json scripts/rest-happy-path-smoke.mjs` | Passed | Confirmed command and script behavior. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec next start --hostname 127.0.0.1 --port 18086` | Passed after approval | Sandboxed start failed with `listen EPERM`; escalated local server start succeeded. |
| `curl -i http://127.0.0.1:18086/api/health` | Passed | Local server returned HTTP 200. |
| `DABEEHIVE_REST_BASE_URL=http://127.0.0.1:18086 pnpm test:api` | Failed | `POST /api/projects` returned HTTP 500 because Prisma cannot reach PostgreSQL at `localhost:55432`. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running. |

## Evidence

- `track/evidence/API-016/validation.txt`

## Follow-up Tasks

- MCP-009
