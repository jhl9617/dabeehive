# API-002 — Project list/create API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 15:56:34 KST
- Started At: 2026-05-04 15:56:34 KST
- Completed At: 2026-05-04 15:59:53 KST

## Objective

Implement the PoC `GET /api/projects` and `POST /api/projects` route so clients can list existing projects and create a project through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/projects` returns projects through the shared success response shape.
- [x] `POST /api/projects` validates input with Zod and creates a project through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/projects/route.ts`
- API-002 tracking, log, and evidence files
- `track/RISKS.md` public API/DB access risk note

### Out of Scope

- Project detail/update/delete routes
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools, SDK runner changes
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/projects/route.ts`: list/create route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-002 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-002.md`: session log
- `track/evidence/API-002/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Accept explicit `ownerId` until auth middleware supplies identity in a later task.
- Do not add migrations, seed data, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-002, and DB-003.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/projects` with optional `ownerId` and `status` query validation.
- Added `POST /api/projects` with Zod body validation and Prisma project creation through `getPrismaClient`.
- Added project serialization so Date fields return ISO strings.
- Added controlled API errors for validation, invalid JSON, project list failure, owner foreign-key failure, and create failure.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build includes dynamic `/api/projects` route. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/projects` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for missing `ownerId` and `name`. |
| HTTP validation smoke for invalid `GET /api/projects?status=bad` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for invalid status. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide a project owner and schema. |

## Evidence

- `track/evidence/API-002/validation.txt`

## Follow-up Tasks

- API-003
