# API-007 — Document detail/update API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:20:18 KST
- Started At: 2026-05-04 16:20:18 KST
- Completed At: 2026-05-04 16:23:16 KST

## Objective

Implement `GET /api/documents/[id]` and `PATCH /api/documents/[id]` so clients can retrieve and update a single context document through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/documents/[id]` returns one document through the shared success response shape or a controlled not-found error.
- [x] `PATCH /api/documents/[id]` validates update input with Zod and updates a document through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/documents/[id]/route.ts`
- API-007 tracking, log, and evidence files
- `track/RISKS.md` public API/context update risk note

### Out of Scope

- Document delete route
- Search/retrieval semantics
- Versioning automation
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools, SDK runner changes
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/documents/[id]/route.ts`: detail/update route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-007 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-007.md`: session log
- `track/evidence/API-007/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Do not add delete, search, versioning automation, migration, seed, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-005, and API-006 route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/documents/[id]` with route parameter validation, Prisma `findUnique`, ISO serialization, and controlled not-found/error responses.
- Added `PATCH /api/documents/[id]` with Zod update validation, Prisma `update`, and controlled not-found/error responses.
- Kept delete, search, and versioning automation out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build includes dynamic `/api/documents/[id]` route. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `PATCH /api/documents/[id]` | Passed | Returned HTTP 400 for empty body and invalid status. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted document data. |

## Evidence

- `track/evidence/API-007/validation.txt`

## Follow-up Tasks

- API-008
