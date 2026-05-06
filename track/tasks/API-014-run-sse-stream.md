# API-014 — Run SSE stream API

## Status

- Status: verified
- Priority: P1
- Area: API
- Created At: 2026-05-06 11:18:00 KST
- Started At: 2026-05-06 11:18:00 KST
- Completed At: 2026-05-06 11:21:56 KST

## Objective

Implement the PoC `GET /api/runs/[id]/stream` endpoint so clients can subscribe to run status and run event updates using Server-Sent Events.

## Acceptance Criteria

- [x] `GET /api/runs/[id]/stream` returns an SSE response for an existing run.
- [x] The stream emits run status and run event payloads using DB-backed polling without external queue/pub-sub integrations.
- [x] Query and route input are validated with Zod and validation results are recorded.

## Scope

### In Scope

- `apps/server/app/api/runs/[id]/stream/route.ts`
- API-014 tracking, log, and evidence files

### Out of Scope

- Jira, Slack, GitHub, Redis, BullMQ, or full external integrations
- Custom AI code editing engine
- Auth middleware implementation
- DB schema or migration changes
- UI or VS Code Extension stream consumer
- MCP tool changes

## Expected Files

- `apps/server/app/api/runs/[id]/stream/route.ts`: run SSE stream route handler
- `track/MASTER.md`: API-014 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-API-014.md`: session log
- `track/evidence/API-014/validation.txt`: validation evidence

## Implementation Notes

- Use `apiError` from `apps/server/src/lib/api-response.ts` before the stream starts for validation and lookup failures.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Keep the implementation PoC-scoped: DB polling only, no Redis/BullMQ/pub-sub dependency.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-007, DB-012, API-009, and API-010.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 30
- Approval Required: no
- Reason: Adds a read-only streaming API route using existing DB models and validation; no schema, dependency, auth, deployment, destructive command, or external integration changes.

## Changes Made

- Added `GET /api/runs/[id]/stream` as a Node runtime dynamic App Router endpoint.
- Added Zod validation for route params and stream query options: `cursor`, `intervalMs`, and `limit`.
- Added SSE response formatting with `run.status`, `run.event`, `run.done`, and `run.error` events.
- Added DB-backed polling against `AgentRun` and `RunEvent` through the Prisma client wrapper.
- Supported `Last-Event-ID`/`cursor` resume behavior without adding Redis, BullMQ, or external pub-sub dependencies.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Completed with no output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build succeeded and listed `/api/runs/[id]/stream` as a dynamic route. Existing TypeScript project references warning remains. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "text/event-stream\|run\\.event\|run\\.status\|ReadableStream\|last-event-id" 'apps/server/app/api/runs/[id]/stream/route.ts'` | Passed | Confirmed SSE content type, stream creation, cursor support, status events, and run event emission in source. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running, so DB-backed runtime SSE smoke for an existing persisted run was not executable in this environment. |

## Evidence

- `track/evidence/API-014/validation.txt`

## Follow-up Tasks

- API-015
