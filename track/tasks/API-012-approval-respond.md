# API-012 — Approval respond API

## Status

- Status: verified
- Priority: P0
- Area: API
- Created At: 2026-05-04 16:53:38 KST
- Started At: 2026-05-04 16:53:38 KST
- Completed At: 2026-05-04 16:56:39 KST

## Objective

Implement the PoC approval response API so clients can approve, reject, or request changes for one approval record through the Orchestrator REST API.

## Acceptance Criteria

- [x] `POST /api/approvals/[id]` accepts `approve`, `reject`, and `request_changes` response actions.
- [x] The route updates approval status/responded fields through the Prisma client wrapper and returns the updated approval through the shared success response shape.
- [x] build/typecheck/lint, Prisma validate/generate, and route smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/approvals/[id]/route.ts`
- API-012 tracking, log, and evidence files
- `track/RISKS.md` public approval mutation risk note

### Out of Scope

- Approval creation
- Workflow continuation
- Run state transitions
- Notification delivery
- Auth middleware or API token checks
- Seed data or migrations
- Prisma repository layer
- UI, MCP tools
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge

## Expected Files

- `apps/server/app/api/approvals/[id]/route.ts`: add response handler
- `track/RISKS.md`: API risk note
- `track/MASTER.md`: API-012 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-API-012.md`: session log
- `track/evidence/API-012/validation.txt`: validation evidence

## Implementation Notes

- Use `apiSuccess`/`apiError` from `apps/server/src/lib/api-response.ts`.
- Use `validateInput` from `apps/server/src/lib/validation.ts`.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Map response action `approve` to approval status `approved`, `reject` to `rejected`, and `request_changes` to `changes_requested`.
- Do not continue workflow or update run state in this task.

## Dependencies / Decisions

- Depends on SRV-003, SRV-004, SRV-005, DB-008, and API-011.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 60
- Approval Required: no
- Reason: Adds PoC approval status mutation through existing DB model and validation; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `POST /api/approvals/[id]` response handling to the existing approval detail route.
- Added response body validation for `action`, optional `respondedById`, and optional `reason`.
- Mapped `approve` to `approved`, `reject` to `rejected`, and `request_changes` to `changes_requested`, while setting `respondedAt` and serializing the updated approval.
- Kept workflow continuation, run state transitions, notifications, and auth behavior out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| HTTP validation smoke for invalid `POST /api/approvals/[id]` | Passed | Returned HTTP 400 for missing and invalid response action. |
| DB-backed happy-path smoke | Not run | Deferred until migration/seed/local DB tasks provide persisted approval data. |

## Evidence

- `track/evidence/API-012/validation.txt`

## Follow-up Tasks

- API-013
