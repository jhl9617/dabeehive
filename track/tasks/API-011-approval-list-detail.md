# API-011 — Approval list/detail API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:44:31 KST
- Started At: 2026-05-04 16:44:31 KST
- Completed At: 2026-05-04 16:50:35 KST

## Objective

Implement the PoC approval read APIs so clients can list approvals and retrieve one approval record through the Orchestrator REST API.

## Acceptance Criteria

- [x] `GET /api/approvals` returns approvals through the shared success response shape with useful filters.
- [x] `GET /api/approvals/[id]` returns one approval or a controlled not-found error.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/approvals/route.ts`
- `apps/server/app/api/approvals/[id]/route.ts`
- API-011 tracking, log, and evidence files
- `track/RISKS.md` public approval read API risk note

### Out of Scope

- Approval respond/update actions
- Approval creation
- Workflow state machine
- SDK runner execution
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/approvals/route.ts`: approval list route handler
- `apps/server/app/api/approvals/[id]/route.ts`: approval detail route handler
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-011 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-011.md`: session log
- `track/evidence/API-011/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Support list filters for `issueId`, `runId`, `status`, and `type`.
- Do not add respond/update behavior in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-008, and prior API route conventions.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: no
- Reason: Adds PoC read-only REST handlers using existing DB models and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `GET /api/approvals` with optional `issueId`, `runId`, `status`, and `type` filters.
- Added `GET /api/approvals/[id]` with route parameter validation, Prisma `findUnique`, ISO serialization, and controlled not-found/error responses.
- Kept approval respond/update, creation, and workflow behavior out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded; approval list/detail routes listed as dynamic. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `GET /api/approvals` | Passed | Returned HTTP 400 for invalid status enum. |
| HTTP validation smoke for invalid `GET /api/approvals/[id]` | Passed | Returned HTTP 400 for whitespace route id. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted approval data. |

## Evidence

- `track/evidence/API-011/validation.txt`

## Follow-up Tasks

- API-012
