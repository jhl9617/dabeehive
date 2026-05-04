# SDK-004 — Claude Agent SDK Adapter Skeleton

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:43:21 KST
- Started At: 2026-05-04 18:43:21 KST
- Completed At: 2026-05-04 18:44:33 KST

## Objective

Add a Claude Agent SDK adapter skeleton that implements `LocalCodingAgentAdapter`.

## Acceptance Criteria

- [x] `ClaudeAgentSdkAdapter` class exists and is exported.
- [x] Class implements `LocalCodingAgentAdapter` with `start` and `cancel` method structure.
- [x] Typecheck/lint and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/claude-agent-sdk-adapter.ts`
- `packages/shared/src/index.ts`
- SDK-004 tracking, log, and evidence files

### Out of Scope

- Claude SDK package dependency
- real SDK invocation
- event streaming
- event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/claude-agent-sdk-adapter.ts`: adapter skeleton
- `packages/shared/src/index.ts`: skeleton export
- `track/MASTER.md`: SDK-004 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-004.md`: session log
- `track/evidence/SDK-004/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Do not call Claude SDK or shell commands.
- Return a run handle from `start`; make `cancel` a no-op skeleton.

## Dependencies / Decisions

- Depends on SDK-001/SDK-002 shared SDK types.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 30
- Approval Required: no
- Reason: Adds a provider-neutral skeleton class without external dependency, SDK execution, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `ClaudeAgentSdkAdapter` skeleton implementing `LocalCodingAgentAdapter`.
- Added `start()` and `cancel()` method structure without real SDK invocation or package dependency.
- Exported the skeleton from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `ClaudeAgentSdkAdapter` | Passed | Found class, interface implementation, start/cancel methods, and shared index export. |

## Evidence

- `track/evidence/SDK-004/validation.txt`

## Follow-up Tasks

- SDK-005
