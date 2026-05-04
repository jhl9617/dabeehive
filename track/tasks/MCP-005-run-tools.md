# MCP-005 — run.start/status tools

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:32:09 KST
- Started At: 2026-05-04 17:32:09 KST
- Completed At: 2026-05-04 17:34:35 KST

## Objective

Register MCP `run.start` and `run.status` tools backed by the existing Prisma `AgentRun` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `run.start` and `run.status`.
- [x] `run.start` creates only a queued run record and `run.status` returns serialized run state or controlled tool errors.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-005 tracking, log, and evidence files
- `track/RISKS.md` run MCP write surface risk note

### Out of Scope

- SDK runner execution
- Workflow state transitions beyond initial `queued`
- Run cancellation
- Run event append
- Approval/artifact/context MCP tools
- MCP resources and prompts
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: run MCP tools
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-005 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-005.md`: session log
- `track/evidence/MCP-005/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Reuse the run enum values already used by REST run routes.
- Use `zod` schemas for all tool inputs.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- `run.start` must create an AgentRun with status `queued` only.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-006, API-008, API-009, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 70
- Approval Required: no
- Reason: Adds a write MCP run creation tool behind the existing Bearer guard with input validation; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `run.start` and `run.status` on the existing authenticated MCP handler.
- Added Zod input schemas aligned with the existing REST run enum values and payload limits.
- Added Prisma-backed queued AgentRun creation and run status lookup with ISO date serialization.
- Added controlled run tool errors for not-found, start foreign-key failures, and generic start/status failures.
- Recorded the write-surface risk for MCP run creation before workflow/SDK execution exists.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `run.start` and `run.status`. |
| MCP `tools/call` validation smoke for invalid `run.start` | Passed | HTTP 200 tool error returned Zod validation message for missing `projectId`. |

## Evidence

- `track/evidence/MCP-005/validation.txt`

## Follow-up Tasks

- MCP-006
