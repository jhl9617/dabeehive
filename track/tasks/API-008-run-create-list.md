# API-008 — Run create/list API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:25:25 KST
- Started At: 2026-05-04 16:25:25 KST
- Completed At: 2026-05-04 16:32:16 KST

## Objective

Implement the PoC `GET /api/runs` and `POST /api/runs` route so clients can list agent runs and create queued run records through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/runs` returns runs through the shared success response shape with useful filters.
- [x] `POST /api/runs` validates input with Zod and creates a queued run through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/runs/route.ts`
- API-008 tracking, log, and evidence files
- `track/RISKS.md` public API/workflow risk note

### Out of Scope

- Run detail route
- Run event append route
- Run cancellation
- Workflow state machine
- SDK runner execution
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/runs/route.ts`: create/list route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-008 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-008.md`: session log
- `track/evidence/API-008/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Default new runs to `queued`; do not start SDK execution here.
- Do not add migrations, seed data, workflow behavior, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-006, and prior API route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/runs` with optional `projectId`, `issueId`, `status`, and `agentRole` filters.
- Added `POST /api/runs` with Zod validation, queued run creation, Prisma foreign-key error mapping, and ISO date serialization.
- Recorded public API/workflow sequencing risk in `track/RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded; `/api/runs` route listed as dynamic. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/runs` | Passed | Returned 400 `VALIDATION_ERROR` for missing `projectId` and `agentRole`. |
| HTTP validation smoke for invalid `GET /api/runs?status=unknown` | Passed | Returned 400 `VALIDATION_ERROR` for invalid status enum. |
| DB happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide a known database state. |

## Evidence

- `track/evidence/API-008/validation.txt`

## Follow-up Tasks

- API-009
