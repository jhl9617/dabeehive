# MCP-006 — run.append_event tool

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:36:09 KST
- Started At: 2026-05-04 17:36:09 KST
- Completed At: 2026-05-04 17:38:34 KST

## Objective

Register MCP `run.append_event` tool backed by the existing Prisma `RunEvent` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `run.append_event`.
- [x] `run.append_event` validates normalized SDK event input and returns serialized event data or controlled tool errors.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-006 tracking, log, and evidence files
- `track/RISKS.md` run event metadata risk note

### Out of Scope

- Changes to `run.start` or `run.status`
- SDK runner execution
- Workflow state transitions
- Event streaming
- Approval/artifact/context MCP tools
- MCP resources and prompts
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: run append event MCP tool
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-006 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-006.md`: session log
- `track/evidence/MCP-006/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Reuse the normalized run event type values already used by REST run event append.
- Use `zod` schema for tool input.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- Keep event storage only; do not trigger workflow status transitions.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-007, API-010, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: no
- Reason: Adds a write MCP run event ingestion tool behind the existing Bearer guard with input validation; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `run.append_event` on the existing authenticated MCP handler.
- Added Zod input schema for normalized SDK event type, message, metadata, and required `runId`.
- Added Prisma-backed RunEvent creation with ISO date serialization and JSON text MCP result.
- Added controlled run event tool errors for missing run and generic append failure.
- Recorded the event metadata ingestion risk before redaction policy exists.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `run.append_event`. |
| MCP `tools/call` validation smoke for invalid `run.append_event` | Passed | HTTP 200 tool error returned Zod validation message for missing `runId`. |

## Evidence

- `track/evidence/MCP-006/validation.txt`

## Follow-up Tasks

- MCP-007
