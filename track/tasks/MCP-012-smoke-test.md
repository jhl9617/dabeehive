# MCP-012 — MCP smoke test

## Status

- Status: implemented
- Priority: P1
- Area: MCP
- Created At: 2026-05-06 12:24:53 KST
- Started At: 2026-05-06 12:24:53 KST
- Completed At: 2026-05-06 12:36 KST

## Objective

Add a common MCP smoke test command that checks initialization, tool listing, resource template listing, prompt listing, and a representative tool call against the local MCP endpoint.

## Acceptance Criteria

- [x] A repository-level MCP smoke command exists.
- [x] The MCP smoke script checks the current required tool list including `context.search`.
- [x] The MCP smoke script checks resource templates and prompts added in MCP-010/MCP-011.
- [x] The smoke result is validated or the DB/runtime blocker is recorded with evidence.

## Scope

### In Scope

- Root package script for MCP smoke validation.
- Existing MCP smoke script updates.
- MCP-012 tracking, log, risk, and evidence files.

### Out of Scope

- Adding a test framework dependency.
- Mocking MCP auth or Prisma.
- Jira, Slack, GitHub, deployment, automatic merge, or external integrations.
- VS Code Extension or REST API tests.
- DB schema or migration changes.

## Expected Files

- `package.json`: MCP smoke command
- `scripts/mcp-smoke.mjs`: current MCP surface checks
- `track/RISKS.md`: DB-backed MCP smoke blocker note
- `track/MASTER.md`: MCP-012 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-MCP-012.md`: session log
- `track/evidence/MCP-012/validation.txt`: validation evidence

## Implementation Notes

- Reuse the existing MCP smoke script instead of adding a dependency.
- Keep the representative tool call as `project.list`.
- MCP auth is DB-backed, so full smoke execution requires local PostgreSQL and seeded API token hash.

## Dependencies / Decisions

- Depends on MCP-001 through MCP-011.
- Depends on local PostgreSQL and seeded demo API token for full authenticated smoke execution.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Updates validation script/command only; no schema, auth behavior, dependency, deployment, destructive command, or external integration changes.

## Changes Made

- Added root `pnpm test:mcp` command.
- Extended `scripts/mcp-smoke.mjs` to assert required MCP tools, resource templates, prompts, and `project.list` tool call output.
- Recorded the local PostgreSQL runtime blocker in `track/RISKS.md` and evidence.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node -c scripts/mcp-smoke.mjs` | PASS | Script syntax is valid. |
| `pnpm lint` | PASS | Basic repository lint passed. |
| `rg -n '"test:mcp"\|context\.search\|resources/templates/list\|prompts/list\|implementation-plan\|review-diff\|issue://\{id\}\|document://\{id\}\|run://\{id\}' package.json scripts/mcp-smoke.mjs` | PASS | Confirmed command and coverage markers. |
| `pg_isready -h localhost -p 55432` | FAIL | `localhost:55432 - no response`; local PostgreSQL is unavailable. |
| `DABEEHIVE_MCP_BASE_URL=http://127.0.0.1:18086/api/mcp DABEEHIVE_MCP_TOKEN=demo-local-mcp-token pnpm test:mcp` | FAIL | Server returned `invalid_token` because DB-backed token verification cannot reach PostgreSQL. |

## Evidence

- `track/evidence/MCP-012/validation.txt`

## Follow-up Tasks

- EXT-011
