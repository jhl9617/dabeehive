# API-006 — Document list/create API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:15:53 KST
- Started At: 2026-05-04 16:15:53 KST
- Completed At: 2026-05-04 16:18:27 KST

## Objective

Implement the PoC `GET /api/documents` and `POST /api/documents` route so clients can list context documents and create PRD/ADR/spec-style documents through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/documents` returns documents through the shared success response shape with useful filters.
- [x] `POST /api/documents` validates input with Zod and creates a document through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/documents/route.ts`
- API-006 tracking, log, and evidence files
- `track/RISKS.md` public API/context document risk note

### Out of Scope

- Document detail/update/delete routes
- Search/retrieval semantics
- Versioning automation
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools, SDK runner changes
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/documents/route.ts`: list/create route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-006 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-006.md`: session log
- `track/evidence/API-006/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Accept explicit `projectId` until auth/project context is introduced.
- Do not add migrations, seed data, search behavior, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-003, and DB-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds PoC REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/documents` with optional project, type, and status filters.
- Added `POST /api/documents` with Zod validation and Prisma document creation through `getPrismaClient`.
- Added document serialization so Date fields return ISO strings.
- Added controlled API errors for validation, invalid JSON, document list failure, project FK failure, and create failure.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build includes dynamic `/api/documents` route. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/documents` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for missing required fields. |
| HTTP validation smoke for invalid `GET /api/documents?type=note` | Passed | Returned HTTP 400 with `VALIDATION_ERROR` for invalid type. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted project data. |

## Evidence

- `track/evidence/API-006/validation.txt`

## Follow-up Tasks

- API-007
