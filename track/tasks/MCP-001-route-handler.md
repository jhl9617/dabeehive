# MCP-001 — MCP route handler

## Status

- Status: verified
- Priority: P0
- Area: MCP
- Created At: 2026-05-04 17:07:30 KST
- Started At: 2026-05-04 17:07:30 KST
- Completed At: 2026-05-04 17:13:58 KST

## Objective

Initialize the PoC MCP route handler in the Next.js server so a baseline MCP endpoint exists for later project/issue/run/approval/artifact tools.

## Acceptance Criteria

- [x] MCP route handler exists in the Next.js App Router API tree.
- [x] MCP handler dependencies are installed and recorded before use.
- [x] build/typecheck/lint and endpoint reachability smoke results are recorded.

## Scope

### In Scope

- `apps/server/app/api/[transport]/route.ts`
- `apps/server/package.json`
- `pnpm-lock.yaml`
- MCP-001 tracking, log, and evidence files
- `track/RISKS.md` dependency/protocol surface risk note

### Out of Scope

- MCP auth guard
- MCP project/issue/run/approval/artifact tools
- MCP resources and prompts
- Context search
- SDK runner execution
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- Custom AI code editing engines

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: MCP route handler
- `apps/server/package.json`: MCP dependencies
- `pnpm-lock.yaml`: dependency lock updates
- `track/RISKS.md`: risk note
- `track/MASTER.md`: MCP-001 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-MCP-001.md`: session log
- `track/evidence/MCP-001/validation.txt`: validation evidence

## Implementation Notes

- Use `mcp-handler` with `@modelcontextprotocol/sdk` as documented by the Vercel MCP handler project.
- Keep this route minimal and register no domain tools in MCP-001.
- Use `basePath: "/api"` to match `apps/server/app/api/[transport]/route.ts`.
- Do not add auth, tools, resources, prompts, or workflow behavior in this task.

## Dependencies / Decisions

- Add `mcp-handler` and `@modelcontextprotocol/sdk` to `@dabeehive/server`.
- Reason: MCP-001 requires a real MCP route handler and later MCP tool tasks should build on the official MCP handler adapter instead of a custom protocol implementation.
- Source checked: Vercel `mcp-handler` README documents installing `mcp-handler @modelcontextprotocol/sdk zod@^3` and using `app/api/[transport]/route.ts`.

## Risk / Approval

- Risk Score: 70
- Approval Required: yes
- Reason: Package dependency addition and new protocol endpoint surface.
- Changed files:
  - `apps/server/package.json`
  - `pnpm-lock.yaml`
  - `apps/server/app/api/[transport]/route.ts`
- Diff summary: Add official MCP handler dependencies and initialize a minimal Next.js App Router MCP handler without domain tools.
- Required reviewer action: Review dependency and new endpoint surface before using it with auth/tools in later tasks.

## Changes Made

- Added `mcp-handler` and `@modelcontextprotocol/sdk` to `@dabeehive/server`.
- Pinned `@modelcontextprotocol/sdk` to `^1.26.0` after the initial install produced a `mcp-handler` peer dependency warning with `1.29.0`.
- Added `apps/server/app/api/[transport]/route.ts` with a minimal `createMcpHandler` setup, server info, `/api` base path, and SSE disabled.
- Verified `/api/mcp` initializes successfully and `/api/health` still resolves to the existing REST route.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server add mcp-handler @modelcontextprotocol/sdk` | Passed with warning | Installed dependencies, then corrected SDK peer version. |
| `pnpm --filter @dabeehive/server add @modelcontextprotocol/sdk@1.26.0` | Passed | Resolved `mcp-handler` peer dependency warning. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build includes dynamic `/api/[transport]`. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed without output. |
| `pnpm lint` | Passed | Basic lint passed. |
| MCP initialize smoke on `POST /api/mcp` | Passed | Returned HTTP 200 with `dabeehive-orchestrator` server info. |
| REST route precedence smoke on `GET /api/health` | Passed | Existing health endpoint returned HTTP 200. |

## Evidence

- `track/evidence/MCP-001/validation.txt`

## Follow-up Tasks

- MCP-002
