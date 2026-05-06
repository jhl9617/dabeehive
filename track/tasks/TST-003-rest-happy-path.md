# TST-003 — REST Happy Path Validation

## Status

- Status: implemented
- Priority: P0
- Area: Test
- Created At: 2026-05-04 20:16:56 KST
- Started At: 2026-05-04 20:16:56 KST
- Completed At: 2026-05-06 10:13:33 KST

## Objective

Validate the REST happy path for project to issue to run to approval flow against the local Orchestrator server.

## Acceptance Criteria

- [ ] Project creation succeeds over REST.
- [ ] Issue creation succeeds for the created project over REST.
- [ ] Run creation succeeds for the created issue over REST.
- [ ] Approval request/response flow succeeds over REST.
- [x] Validation evidence and tracking updates are recorded.

## Scope

### In Scope

- REST route contract inspection for projects, issues, runs, and approvals.
- Minimal local smoke runner if needed to exercise the flow.
- Local server and DB-backed validation attempt.
- TST-003 tracking, log, and evidence files.

### Out of Scope

- MCP smoke validation.
- VS Code extension validation.
- Web dashboard validation.
- Jira, Slack, deployment, or full external integrations.
- Auth/session hardening beyond existing PoC behavior.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-TST-003.md`: session log.
- `track/evidence/TST-003/validation.txt`: validation evidence.
- Optional smoke script if a reusable REST check is needed.

## Implementation Notes

- TST-002 added migration/seed support but did not verify DB-backed execution because no local PostgreSQL server or Docker daemon is available.
- If the same DB blocker prevents REST success, record it explicitly and keep the task unverified.
- No package dependency additions are planned.

## Dependencies / Decisions

- Depends on API-002 through API-012 route implementations.
- Depends on a reachable PostgreSQL database for DB-backed happy path success.
- No dependency additions.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds a minimal REST approval request endpoint and smoke script, but does not change schema, auth/session code, dependencies, deployment, or destructive behavior.

## Changes Made

- Added `POST /api/approvals` for minimal pending approval request creation over REST.
- Added a reusable REST happy path smoke script for project, issue, run, approval request, and approval response.
- Recorded REST approval request endpoint risk in `track/RISKS.md`.
- Attempted REST smoke against a local server; full flow is blocked at project creation because the local PostgreSQL database is not reachable.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Pass | Exited 0 with no compiler output. |
| `pnpm lint` | Pass | `basic lint passed`. |
| `node -c scripts/rest-happy-path-smoke.mjs` | Pass | Smoke script syntax is valid. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Pass | Schema is valid. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec next dev --hostname 127.0.0.1 --port 18081` | Pass | Local server started after sandbox escalation. |
| `curl -i http://127.0.0.1:18081/api/health` | Pass | Health endpoint returned HTTP 200. |
| `curl -i -X POST http://127.0.0.1:18081/api/approvals -H 'content-type: application/json' -d '{}'` | Pass | New route validation returned HTTP 400 before DB access. |
| `DABEEHIVE_REST_BASE_URL=http://127.0.0.1:18081 node scripts/rest-happy-path-smoke.mjs` | Blocked | `POST /api/projects` returned HTTP 500 because Prisma cannot reach `localhost:55432`. |

## Evidence

- `track/evidence/TST-003/validation.txt`

## Follow-up Tasks

- TST-004
