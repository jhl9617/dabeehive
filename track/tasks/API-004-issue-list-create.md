# API-004 — Issue list/create API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:06:37 KST
- Started At: 2026-05-04 16:06:37 KST
- Completed At: 2026-05-04 16:09:15 KST

## Objective

Implement the PoC `GET /api/issues` and `POST /api/issues` route so clients can list issues and create an issue through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/issues` returns issues through the shared success response shape with useful filters.
- [x] `POST /api/issues` validates input with Zod and creates an issue through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/issues/route.ts`
- API-004 tracking, log, and evidence files
- `track/RISKS.md` public API/DB access risk note

### Out of Scope

- Issue detail/update/delete routes
- Issue delegation route
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools, SDK runner changes
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/issues/route.ts`: list/create route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-004 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-004.md`: session log
- `track/evidence/API-004/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Accept explicit `projectId` until auth/project context is introduced.
- Do not add migrations, seed data, delegation behavior, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-003, and DB-004.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/issues` with optional project, parent, type, status, priority, and assignee role filters.
- Added `POST /api/issues` with Zod validation and Prisma issue creation through `getPrismaClient`.
- Added issue serialization so Date fields return ISO strings.
- Added controlled API errors for validation, invalid JSON, issue list failure, project/parent FK failure, and create failure.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build includes dynamic `/api/issues` route. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/issues` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for missing `projectId` and `title`. |
| HTTP validation smoke for invalid `GET /api/issues?status=bad` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for invalid status. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted project data. |

## Evidence

- `track/evidence/API-004/validation.txt`

## Follow-up Tasks

- API-005
