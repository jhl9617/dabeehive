# MCP-007 — approval.list/request/respond tools

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:40:23 KST
- Started At: 2026-05-04 17:40:23 KST
- Completed At: 2026-05-04 17:43:13 KST

## Objective

Register MCP `approval.list`, `approval.request`, and `approval.respond` tools backed by the existing Prisma `Approval` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `approval.list`, `approval.request`, and `approval.respond`.
- [x] Approval tools validate inputs and return serialized approval data or controlled tool errors.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-007 tracking, log, and evidence files
- `track/RISKS.md` approval write surface risk note

### Out of Scope

- Workflow continuation after approval response
- Run state changes
- Notification delivery
- Approval detail MCP resource
- Artifact/context MCP tools
- MCP resources and prompts
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: approval MCP tools
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-007 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-007.md`: session log
- `track/evidence/MCP-007/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Reuse approval status/type/action values already used by REST approval routes.
- Use `zod` schemas for tool input.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- `approval.respond` must only update approval response fields; do not resume workflows.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-008, API-011, API-012, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: no
- Reason: Adds write MCP approval request/respond tools behind the existing Bearer guard with input validation; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `approval.list`, `approval.request`, and `approval.respond` on the existing authenticated MCP handler.
- Added Zod input schemas aligned with the existing REST approval status/type/action values.
- Added Prisma-backed approval list, request creation, and response update operations with ISO date serialization.
- Added controlled approval tool errors for list/request/respond failures, missing target, not-found, and foreign-key failures.
- Recorded the approval write-surface risk before workflow policy and role enforcement exist.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `approval.list`, `approval.request`, and `approval.respond`. |
| MCP `tools/call` validation smoke for invalid `approval.request` | Passed | HTTP 200 tool error returned Zod validation message for missing `type`. |

## Evidence

- `track/evidence/MCP-007/validation.txt`

## Follow-up Tasks

- MCP-008
