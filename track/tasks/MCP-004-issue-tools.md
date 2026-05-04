# MCP-004 — issue.list/get/create tools

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:27:50 KST
- Started At: 2026-05-04 17:27:50 KST
- Completed At: 2026-05-04 17:30:30 KST

## Objective

Register MCP `issue.list`, `issue.get`, and `issue.create` tools backed by the existing Prisma `Issue` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `issue.list`, `issue.get`, and `issue.create`.
- [x] Issue tools have Zod input schemas and return serialized issue data or controlled tool errors.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-004 tracking, log, and evidence files
- `track/RISKS.md` issue MCP write surface risk note

### Out of Scope

- `issue.update` or delete MCP tools
- Run/approval/artifact/context MCP tools
- MCP resources and prompts
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: issue MCP tools
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-004 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-004.md`: session log
- `track/evidence/MCP-004/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Reuse the issue enum values already used by REST issue routes.
- Use `zod` schemas for all tool inputs.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- Keep write behavior limited to issue creation; do not add update/delete behavior in this task.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-004, API-004, API-005, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 70
- Approval Required: no
- Reason: Adds a write MCP issue creation tool behind the existing Bearer guard with input validation; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `issue.list`, `issue.get`, and `issue.create` on the existing authenticated MCP handler.
- Added Zod input schemas aligned with the existing REST issue enum values and payload limits.
- Added Prisma-backed issue list/get/create calls with ISO date serialization and JSON text MCP results.
- Added controlled issue tool errors for not-found, create foreign-key failures, and generic list/get/create failures.
- Recorded the write-surface risk for MCP issue creation.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `issue.list`, `issue.get`, and `issue.create`. |
| MCP `tools/call` validation smoke for invalid `issue.create` | Passed | HTTP 200 tool error returned Zod validation message for missing `projectId`. |

## Evidence

- `track/evidence/MCP-004/validation.txt`

## Follow-up Tasks

- MCP-005
