# MCP-010 — MCP resources

## Status

- Status: verified
- Priority: P1
- Area: MCP
- Created At: 2026-05-06 12:15:06 KST
- Started At: 2026-05-06 12:15:06 KST
- Completed At: 2026-05-06 12:17:36 KST

## Objective

Add PoC MCP resources so MCP clients can read issue, document, and run context by URI through the existing authenticated MCP endpoint.

## Acceptance Criteria

- [x] MCP resource templates exist for `issue://{id}`, `document://{id}`, and `run://{id}`.
- [x] Resource reads return JSON text content for the selected issue, document, or run.
- [x] Resources are DB-backed, read-only, authenticated through existing MCP auth, and do not implement code editing or external integrations.

## Scope

### In Scope

- Existing MCP route resource registration.
- Issue, document, and run resource readers.
- MCP-010 tracking, log, risk, and evidence files.

### Out of Scope

- Resource listing/autocomplete beyond basic templates.
- Code modification MCP resources/tools.
- Jira, Slack, GitHub, deployment, automatic merge, or external integrations.
- UI, VS Code Extension, REST API changes.
- DB schema or migration changes.

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: MCP resource templates/read callbacks
- `track/RISKS.md`: MCP resource exposure risk note
- `track/MASTER.md`: MCP-010 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-MCP-010.md`: session log
- `track/evidence/MCP-010/validation.txt`: validation evidence

## Implementation Notes

- Use `ResourceTemplate` from the MCP SDK and existing serializers where possible.
- Return `application/json` text resources with the existing API/MCP serialized shape.
- Keep resources read-only and scoped to existing DB models.

## Dependencies / Decisions

- Depends on MCP-001 through MCP-009 and DB Issue/Document/AgentRun models.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 50
- Approval Required: no
- Reason: Adds read-only authenticated MCP resource readers over existing DB records; no schema, auth, dependency, deployment, destructive command, or external integration changes.

## Changes Made

- Registered `issue://{id}`, `document://{id}`, and `run://{id}` MCP resource templates.
- Added read callbacks that fetch existing DB records and return `application/json` text resource contents.
- Added single-variable URI validation and readable not-found errors.
- Recorded MCP resource exposure risk in `track/RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Completed with no output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build succeeded for `/api/[transport]`. Existing TypeScript project references warning remains. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "registerContextResources\|issue://\\{id\\}\|document://\\{id\\}\|run://\\{id\\}\|jsonResourceResult\|resourceReadError\|MCP-010" 'apps/server/app/api/[transport]/route.ts' track/RISKS.md` | Passed | Confirmed resource registration, templates, JSON resource helper, readable errors, and risk note. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running; authenticated MCP runtime resource read smoke was not executable in this environment. |

## Evidence

- `track/evidence/MCP-010/validation.txt`

## Follow-up Tasks

- MCP-011
