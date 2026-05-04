# MCP-003 — project.list/get tools

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:20:55 KST
- Started At: 2026-05-04 17:20:55 KST
- Completed At: 2026-05-04 17:25:34 KST

## Objective

Register read-only MCP `project.list` and `project.get` tools backed by the existing Prisma `Project` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `project.list` and `project.get`.
- [x] `project.list` and `project.get` have Zod input schemas and return serialized project data.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-003 tracking, log, and evidence files
- `track/RISKS.md` project MCP read surface risk note

### Out of Scope

- `project.create`, update, or delete MCP tools
- Issue/run/approval/artifact MCP tools
- MCP resources and prompts
- Context search
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: project MCP tools
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-003 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-003.md`: session log
- `track/evidence/MCP-003/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Use `zod` schemas for tool input.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- Keep tools read-only and do not add project creation/update behavior in this task.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-003, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: no
- Reason: Adds read-only MCP project tools behind the existing Bearer guard; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `project.list` and `project.get` on the existing authenticated MCP handler.
- Added Zod input schemas for optional project list filters and required project id lookup.
- Added Prisma-backed read queries with ISO date serialization and JSON text MCP tool results.
- Recorded the read-surface risk for project metadata exposed through MCP.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `project.list` and `project.get`. |
| MCP `tools/call` validation smoke for invalid `project.get` | Passed | HTTP 200 tool error returned Zod validation message for missing `id`. |

## Evidence

- `track/evidence/MCP-003/validation.txt`

## Follow-up Tasks

- MCP-004
