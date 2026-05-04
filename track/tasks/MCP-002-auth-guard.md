# MCP-002 — MCP auth guard

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:15:52 KST
- Started At: 2026-05-04 17:15:52 KST
- Completed At: 2026-05-04 17:18:51 KST

## Objective

Add a minimal MCP Bearer authentication guard so MCP requests without a Bearer token are rejected before domain tools are exposed.

## Acceptance Criteria

- [x] MCP requests without a Bearer token are rejected.
- [x] MCP requests with a non-empty Bearer token can reach the MCP initialize flow.
- [x] build/typecheck/lint and HTTP smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- MCP-002 tracking, log, and evidence files
- `track/RISKS.md` auth risk note

### Out of Scope

- DB-backed token hash verification
- REST auth middleware
- User/session auth
- Scopes/roles enforcement
- MCP domain tools, resources, and prompts
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: MCP Bearer guard
- `track/RISKS.md`: auth risk note
- `track/MASTER.md`: MCP-002 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-002.md`: session log
- `track/evidence/MCP-002/validation.txt`: validation evidence

## Implementation Notes

- Use `withMcpAuth` from `mcp-handler`.
- Return MCP `AuthInfo` for any non-empty Bearer token only as a PoC guard.
- Do not implement token hashing, DB lookup, scopes, or role checks in this task.

## Dependencies / Decisions

- Depends on MCP-001 and its `mcp-handler` / `@modelcontextprotocol/sdk` dependencies.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: yes
- Reason: Auth/protocol guard behavior changes.
- Changed files:
  - `apps/server/app/api/[transport]/route.ts`
- Diff summary: Wrap the MCP handler with a required Bearer auth guard that rejects missing tokens and accepts non-empty tokens for PoC initialization.
- Required reviewer action: Review minimal auth behavior and confirm DB-backed token validation remains deferred to SEC/API auth tasks.

## Changes Made

- Wrapped the MCP route handler with `withMcpAuth` using `required: true`.
- Added a minimal verifier that rejects missing/empty Bearer tokens and returns MCP `AuthInfo` for non-empty tokens.
- Kept DB-backed token hash validation, scopes, roles, and REST auth middleware out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| MCP initialize smoke without Bearer token | Passed | Returned HTTP 401 `invalid_token`. |
| MCP initialize smoke with Bearer token | Passed | Returned HTTP 200 with MCP initialize payload. |
| REST route precedence smoke on `GET /api/health` | Passed | Existing health endpoint returned HTTP 200. |

## Evidence

- `track/evidence/MCP-002/validation.txt`

## Follow-up Tasks

- MCP-003
