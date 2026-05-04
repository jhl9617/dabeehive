# API-009 — Run detail API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:34:18 KST
- Started At: 2026-05-04 16:34:18 KST
- Completed At: 2026-05-04 16:37:29 KST

## Objective

Implement the PoC `GET /api/runs/[id]` route so clients can retrieve one agent run with its ordered event history through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/runs/[id]` returns one run through the shared success response shape or a controlled not-found error.
- [x] The response includes the run's events ordered by creation time.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/runs/[id]/route.ts`
- API-009 tracking, log, and evidence files
- `track/RISKS.md` public API/run event metadata risk note

### Out of Scope

- Run cancellation
- Run event append route
- Workflow state machine or run transitions
- SDK runner execution
- Approval or artifact APIs
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/runs/[id]/route.ts`: run detail route handler
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-009 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-009.md`: session log
- `track/evidence/API-009/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Select run fields and nested events explicitly.
- Return events ordered by `createdAt` ascending.
- Do not add cancellation, event append, workflow behavior, migration, seed, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-006, DB-007, and API-008 route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: no
- Reason: Adds a PoC read-only REST handler using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/runs/[id]` with route parameter validation, Prisma `findUnique`, ISO serialization, and controlled not-found/error responses.
- Included nested run events selected explicitly and ordered by `createdAt` ascending.
- Kept cancellation, event append, workflow state transitions, and SDK execution out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded; `/api/runs/[id]` route listed as dynamic. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `GET /api/runs/[id]` | Passed | Returned HTTP 400 for whitespace route id. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted run data. |

## Evidence

- `track/evidence/API-009/validation.txt`

## Follow-up Tasks

- API-010
