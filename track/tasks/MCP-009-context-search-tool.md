# MCP-009 — context.search tool

## Status

- Status: verified
- Priority: P1
- Area: MCP
- Created At: 2026-05-06 12:08:12 KST
- Started At: 2026-05-06 12:08:12 KST
- Completed At: 2026-05-06 12:11:33 KST

## Objective

Add the PoC MCP `context.search` tool so MCP clients can search issue and document context by keyword through the existing authenticated MCP endpoint.

## Acceptance Criteria

- [x] MCP `tools/list` includes `context.search`.
- [x] `context.search` validates input with Zod and returns issue/document search results.
- [x] The tool is DB-backed, read-only, and does not implement code editing, Jira, Slack, vector search, or external integrations.

## Scope

### In Scope

- Existing MCP route handler tool registration.
- Keyword search over Issue and Document records.
- MCP-009 tracking, log, risk, and evidence files.

### Out of Scope

- Vector search, embeddings, ranking services, or external search systems.
- Code modification MCP tools.
- Jira, Slack, GitHub, deployment, or automatic merge.
- UI, VS Code Extension, REST API changes.
- DB schema or migration changes.

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: `context.search` MCP tool
- `track/RISKS.md`: context exposure risk note
- `track/MASTER.md`: MCP-009 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-MCP-009.md`: session log
- `track/evidence/MCP-009/validation.txt`: validation evidence

## Implementation Notes

- Follow existing MCP tool registration and JSON text response patterns.
- Use Zod for `query`, optional `projectId`, optional `types`, and `limit`.
- Keep search simple and deterministic: Prisma `contains` filters and a bounded result limit.
- Return source type, id, project/issue metadata, title, excerpt, and created/updated timestamps.

## Dependencies / Decisions

- Depends on MCP-001 through MCP-008 and DB Issue/Document models.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 55
- Approval Required: no
- Reason: Adds a read-only authenticated MCP search tool over existing issue/document context; no schema, auth, dependency, deployment, destructive command, or external integration changes.

## Changes Made

- Registered authenticated MCP `context.search` in the existing route handler.
- Added Zod input validation for `query`, optional `projectId`, optional `types`, and bounded `limit`.
- Added read-only DB-backed keyword search over Issue title/body and Document title/type/content.
- Returned bounded context excerpts with source type, IDs, project ID, title, metadata, and timestamps.
- Recorded context exposure risk in `track/RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Completed with no output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build succeeded for `/api/[transport]`. Existing TypeScript project references warning remains. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "context\\.search\|Search context\|searchIssueContext\|searchDocumentContext\|CONTEXT_SEARCH_FAILED\|contextSearchSourceTypeSchema\|MCP-009" 'apps/server/app/api/[transport]/route.ts' track/RISKS.md` | Passed | Confirmed tool registration, input schema, issue/document helpers, error mapping, and risk note. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running; authenticated MCP runtime smoke and DB-backed search execution were not executable in this environment. |

## Evidence

- `track/evidence/MCP-009/validation.txt`

## Follow-up Tasks

- MCP-010
