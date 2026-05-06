# SDK-010 — Allowed tools settings

## Status

- Status: verified
- Priority: P1
- Area: SDK
- Created At: 2026-05-06 14:00 KST
- Started At: 2026-05-06 14:00 KST
- Completed At: 2026-05-06 14:02 KST

## Objective

Define the PoC coding agent allowed tool settings for the Agent SDK adapter path so read, search, edit, and bash capabilities are explicit and reusable without implementing a custom AI code editing engine.

## Acceptance Criteria

- [x] Allowed tool names/settings for read, search, edit, and bash are defined in shared SDK code.
- [x] `CodingRunInput` and the Claude adapter skeleton can carry the allowed tool list.
- [x] Coder instructions surface the effective allowed tools and keep PoC constraints visible.
- [x] The implementation does not add external integrations, a custom AI editing engine, a shell loop, automatic merge, deployment behavior, or new package dependencies.

## Scope

### In Scope

- Shared Agent SDK types and constants.
- Claude Agent SDK adapter skeleton option/handle metadata.
- Coder instruction builder output.
- SDK-010 tracking, log, and evidence files.

### Out of Scope

- Real Claude SDK invocation.
- Tool execution implementation.
- Dangerous command blocking logic, which belongs to SDK-011.
- Test command detection, which belongs to SDK-012.
- Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `packages/shared/src/allowed-tools.ts`: allowed tool settings and normalization helper
- `packages/shared/src/agent-sdk.ts`: allowed tool typing on run input/handle/adapter
- `packages/shared/src/claude-agent-sdk-adapter.ts`: adapter option/default allowed tools
- `packages/shared/src/coder-instruction.ts`: allowed tools section in coder prompt
- `packages/shared/src/index.ts`: export new shared SDK helper
- `track/MASTER.md`: SDK-010 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-SDK-010.md`: session log
- `track/evidence/SDK-010/validation.txt`: validation evidence

## Implementation Notes

- Keep settings provider-neutral.
- Treat bash as an allowed capability with guarded scope, not an unrestricted command loop.
- Do not add package dependencies.

## Dependencies / Decisions

- Depends on SDK-001 through SDK-009.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Shared SDK configuration/types only; no real tool execution, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added provider-neutral read/search/edit/bash allowed tool settings and normalization helper.
- Added allowed tool fields to `CodingRunInput`, adapter handles, and `LocalCodingAgentAdapter`.
- Wired `ClaudeAgentSdkAdapter` options/start output to normalize and expose allowed tools.
- Added an Allowed Tools section to coder instructions.
- Exported the allowed tools helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "CODING_AGENT_TOOL_NAMES\|DEFAULT_CODING_AGENT_ALLOWED_TOOL_SETTINGS\|read\|search\|edit\|bash\|allowedTools\|Allowed Tools\|normalizeAllowedCodingAgentTools" packages/shared/src/allowed-tools.ts packages/shared/src/agent-sdk.ts packages/shared/src/claude-agent-sdk-adapter.ts packages/shared/src/coder-instruction.ts packages/shared/src/index.ts` | Passed | Source check confirmed allowed tool settings, adapter/input wiring, and coder prompt output. |

## Evidence

- `track/evidence/SDK-010/validation.txt`

## Follow-up Tasks

- SDK-011
