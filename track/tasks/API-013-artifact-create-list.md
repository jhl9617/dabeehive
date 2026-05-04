# API-013 — Artifact create/list API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:58:47 KST
- Started At: 2026-05-04 16:58:47 KST
- Completed At: 2026-05-04 17:04:50 KST

## Objective

Implement the PoC `GET /api/artifacts` and `POST /api/artifacts` routes so clients can store and query run artifacts such as plans, diffs, and test reports.

## Acceptance Criteria

- [x] `GET /api/artifacts` returns artifacts through the shared success response shape with useful filters.
- [x] `POST /api/artifacts` validates input with Zod and creates an artifact through the Prisma client wrapper.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/artifacts/route.ts`
- API-013 tracking, log, and evidence files
- `track/RISKS.md` public artifact content risk note

### Out of Scope

- Artifact detail route
- External file storage or upload handling
- PR creation
- Workflow state machine
- SDK runner execution
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/artifacts/route.ts`: artifact create/list route handlers
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-013 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-013.md`: session log
- `track/evidence/API-013/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Support artifact types from the shared `ArtifactType` union.
- Require either inline `content` or `uri` when creating an artifact.
- Do not add file upload, external storage, PR, workflow, migration, seed, or auth behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-009, and prior API route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 55
- Approval Required: no
- Reason: Adds PoC artifact REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/artifacts` with optional `runId`, `issueId`, and `type` filters.
- Added `POST /api/artifacts` with Zod body validation, artifact type checks, `content` or `uri` requirement, Prisma `artifact.create`, and ISO serialization.
- Mapped Prisma foreign-key failure to a controlled run/issue not-found error and kept external storage and PR behavior out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded; `/api/artifacts` route listed as dynamic. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `GET /api/artifacts` | Passed | Returned HTTP 400 for invalid artifact type. |
| HTTP validation smoke for invalid `POST /api/artifacts` | Passed | Returned HTTP 400 for missing required fields and for missing content/uri. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted run data. |

## Evidence

- `track/evidence/API-013/validation.txt`

## Follow-up Tasks

- MCP-001
