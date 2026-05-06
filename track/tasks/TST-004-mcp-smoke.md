# TST-004 — MCP Smoke Validation

## Status

- Status: implemented
- Priority: P0
- Area: Test
- Created At: 2026-05-06 10:16:10 KST
- Started At: 2026-05-06 10:16:10 KST
- Completed At: 2026-05-06 10:23:59 KST

## Objective

Validate core MCP tool exposure and smoke-call readiness for the PoC server.

## Acceptance Criteria

- [x] MCP endpoint rejects unauthenticated requests.
- [ ] MCP initialize/tools smoke succeeds with a valid local token.
- [ ] At least one core MCP tool call succeeds.
- [x] Validation evidence and tracking updates are recorded.

## Scope

### In Scope

- MCP route auth/tool contract inspection.
- Minimal MCP smoke runner if needed.
- Local server smoke validation attempt.
- TST-004 tracking, log, and evidence files.

### Out of Scope

- New MCP tools beyond the existing PoC surface.
- REST happy path validation.
- VS Code extension validation.
- Jira, Slack, deployment, or full external integrations.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-06-TST-004.md`: session log.
- `track/evidence/TST-004/validation.txt`: validation evidence.
- Optional smoke script if a reusable MCP check is needed.

## Implementation Notes

- SEC-002 changed MCP auth to DB-backed Bearer token verification.
- Full MCP tool calls require a reachable PostgreSQL database and a valid seeded API token.
- No package dependency additions are planned.

## Dependencies / Decisions

- Depends on MCP-001 through MCP-008.
- Depends on SEC-002 DB-backed token verification.
- Depends on reachable DB state for authenticated MCP tool calls.
- No dependency additions.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds a local smoke script and demo seed API token hash, but does not store a plaintext token in the DB, change schema, add dependencies, deploy, or run destructive commands.

## Changes Made

- Added a deterministic demo API token hash to the seed for local MCP smoke auth.
- Added a reusable MCP JSON-RPC smoke script for initialize, tools/list, and `project.list`.
- Recorded demo token seed risk in `track/RISKS.md`.
- Attempted MCP smoke against a local server; authenticated initialize is blocked because DB-backed token verification cannot reach PostgreSQL.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Pass | Exited 0 with no compiler output. |
| `pnpm lint` | Pass | `basic lint passed`. |
| `node -c scripts/mcp-smoke.mjs` | Pass | Smoke script syntax is valid. |
| `node -c apps/server/prisma/seed.cjs` | Pass | Seed script syntax is valid after demo token hash support. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Pass | Schema is valid. |
| `DATABASE_URL=postgresql://jongha@localhost:55432/dabeehive_tst_002 pnpm --filter @dabeehive/server exec next dev --hostname 127.0.0.1 --port 18082` | Pass | Local server started after sandbox escalation. |
| MCP initialize without Bearer token | Pass | HTTP 401 `invalid_token`, `No authorization provided`. |
| `DABEEHIVE_MCP_BASE_URL=http://127.0.0.1:18082/api/mcp DABEEHIVE_MCP_TOKEN=demo-local-mcp-token node scripts/mcp-smoke.mjs` | Blocked | Authenticated initialize returned HTTP 401 because token lookup cannot reach `localhost:55432`. |

## Evidence

- `track/evidence/TST-004/validation.txt`

## Follow-up Tasks

- TST-005
