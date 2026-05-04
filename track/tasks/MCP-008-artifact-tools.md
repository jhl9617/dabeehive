# MCP-008 — artifact.create/get tools

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:44:56 KST
- Started At: 2026-05-04 17:44:56 KST
- Completed At: 2026-05-04 17:47:16 KST

## Objective

Register MCP `artifact.create` and `artifact.get` tools backed by the existing Prisma `Artifact` model.

## Acceptance Criteria

- [x] MCP `tools/list` exposes `artifact.create` and `artifact.get`.
- [x] Artifact tools validate inputs and return serialized artifact data or controlled tool errors.
- [x] build/typecheck/lint and MCP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-008 tracking, log, and evidence files
- `track/RISKS.md` artifact content risk note

### Out of Scope

- Artifact list MCP tool
- External artifact storage
- PR creation
- Diff rendering
- Run/approval/context MCP tools
- MCP resources and prompts
- REST API changes
- Auth hardening beyond MCP-002
- Seed data or migrations
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: artifact MCP tools
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-008 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-008.md`: session log
- `track/evidence/MCP-008/validation.txt`: validation evidence

## Implementation Notes

- Use `server.registerTool` from `@modelcontextprotocol/sdk`.
- Reuse artifact type values already used by REST artifact routes.
- Use `zod` schema for tool input.
- Use `getPrismaClient` from `apps/server/src/lib/db/prisma.ts`.
- Return tool output as JSON text content.
- `artifact.create` must require at least one of `content` or `uri`.

## Dependencies / Decisions

- Depends on MCP-001, MCP-002, DB-009, API-013, and SRV-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: no
- Reason: Adds a write MCP artifact creation tool behind the existing Bearer guard with input validation; no schema, dependency, deployment, or destructive changes.

## Changes Made

- Registered `artifact.create` and `artifact.get` on the existing authenticated MCP handler.
- Added Zod input schemas aligned with the existing REST artifact type values and payload limits.
- Added content-or-uri validation before artifact creation.
- Added Prisma-backed artifact creation and detail lookup with ISO date serialization.
- Added controlled artifact tool errors for missing content/uri, not-found, foreign-key failures, and generic create/get failures.
- Recorded the artifact content storage risk before redaction and storage policy exist.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled successfully. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript check completed with exit code 0. |
| `pnpm lint` | Passed | `basic lint passed`. |
| MCP `tools/list` smoke with Bearer token | Passed | HTTP 200 event stream included `artifact.create` and `artifact.get`. |
| MCP `tools/call` validation smoke for invalid `artifact.create` | Passed | HTTP 200 tool error returned controlled content-or-uri error. |

## Evidence

- `track/evidence/MCP-008/validation.txt`

## Follow-up Tasks

- EXT-001
