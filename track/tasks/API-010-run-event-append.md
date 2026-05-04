# API-010 — Run event append API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:39:36 KST
- Started At: 2026-05-04 16:39:36 KST
- Completed At: 2026-05-04 16:42:39 KST

## Objective

Implement the PoC `POST /api/runs/[id]/events` route so Extension or SDK Runner clients can upload normalized SDK events for an agent run.

## Acceptance Criteria

- [x] `POST /api/runs/[id]/events` validates route params and event body with Zod.
- [x] The route creates a `RunEvent` record through the Prisma client wrapper and returns it through the shared success response shape.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/runs/[id]/events/route.ts`
- API-010 tracking, log, and evidence files
- `track/RISKS.md` public write API/event metadata risk note

### Out of Scope

- Event listing beyond API-009 run detail
- Run status transitions
- Workflow state machine
- SSE streaming
- SDK runner execution
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/runs/[id]/events/route.ts`: event append route handler
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-010 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-010.md`: session log
- `track/evidence/API-010/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Event types must match shared `RunEventType` / AGENTS `CodingAgentEvent.type` values.
- Do not update run status or trigger workflow behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-007, API-009, and shared `RunEventType` values.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 55
- Approval Required: no
- Reason: Adds a PoC event write REST handler using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `POST /api/runs/[id]/events` with route parameter validation, JSON parsing, event body validation, Prisma `runEvent.create`, and ISO serialization.
- Limited event `type` to normalized SDK event values: `message`, `tool_call`, `tool_result`, `file_change`, `command`, `test_result`, `error`, and `done`.
- Mapped Prisma foreign-key failure to controlled `RUN_NOT_FOUND` and kept run status transitions out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded; `/api/runs/[id]/events` route listed as dynamic. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/runs/[id]/events` | Passed | Returned HTTP 400 for missing and invalid event type. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted run data. |

## Evidence

- `track/evidence/API-010/validation.txt`

## Follow-up Tasks

- API-011
