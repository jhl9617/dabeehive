# API-005 — Issue detail/update API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:11:14 KST
- Started At: 2026-05-04 16:11:14 KST
- Completed At: 2026-05-04 16:13:57 KST

## Objective

Implement `GET /api/issues/[id]` and `PATCH /api/issues/[id]` so clients can retrieve and update a single issue through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/issues/[id]` returns one issue through the shared success response shape or a controlled not-found error.
- [x] `PATCH /api/issues/[id]` validates update input with Zod and updates an issue through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/issues/[id]/route.ts`
- API-005 tracking, log, and evidence files
- `track/RISKS.md` public API/workflow-field risk note

### Out of Scope

- Issue delete route
- Issue delegation route
- Workflow state machine enforcement
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools, SDK runner changes
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/issues/[id]/route.ts`: detail/update route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-005 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-005.md`: session log
- `track/evidence/API-005/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Do not add delete, delegation, migration, seed, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-004, and API-004 route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/issues/[id]` with route parameter validation, Prisma `findUnique`, ISO serialization, and controlled not-found/error responses.
- Added `PATCH /api/issues/[id]` with Zod update validation, Prisma `update`, and controlled not-found/error responses.
- Kept delete, delegation, project reassignment, and workflow state enforcement out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build includes dynamic `/api/issues/[id]` route. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `PATCH /api/issues/[id]` | Passed | Returned HTTP 400 for empty body and invalid priority. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted issue data. |

## Evidence

- `track/evidence/API-005/validation.txt`

## Follow-up Tasks

- API-006
