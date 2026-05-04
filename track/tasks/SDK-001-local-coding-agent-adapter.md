# SDK-001 — LocalCodingAgentAdapter Interface

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:34:17 KST
- Started At: 2026-05-04 18:34:17 KST
- Completed At: 2026-05-04 18:36:01 KST

## Objective

Define the `LocalCodingAgentAdapter` interface for swappable local coding agent implementations.

## Acceptance Criteria

- [x] `LocalCodingAgentAdapter` type exists and is exported.
- [x] Interface is adapter-oriented and does not implement a custom AI code editing engine.
- [x] Typecheck/lint and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/agent-sdk.ts`
- `packages/shared/src/index.ts`
- SDK-001 tracking, log, and evidence files

### Out of Scope

- Claude adapter implementation
- SDK invocation
- SDK event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/agent-sdk.ts`: SDK adapter interface and minimal related request/result types
- `packages/shared/src/index.ts`: shared export
- `track/MASTER.md`: SDK-001 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-001.md`: session log
- `track/evidence/SDK-001/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the interface narrow: `start` and `cancel` methods only.
- Avoid tool schemas, shell execution, patch loops, or provider-specific implementation.

## Dependencies / Decisions

- Depends on FND-005 shared package.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds exported TypeScript types only; no runtime, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `packages/shared/src/agent-sdk.ts` with `LocalCodingAgentAdapter` plus minimal start/cancel request and run handle types.
- Exported the SDK adapter types from the shared package index.
- Kept implementation provider-neutral with no SDK invocation, shell execution, tool schema, or patch loop.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/shared exec tsc -p tsconfig.json --noEmit` | Failed | `tsc` executable is not installed in the shared workspace; no dependency added in this task. |
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed using the existing server workspace TypeScript executable. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `LocalCodingAgentAdapter` | Passed | Found interface, request/handle types, and shared index export. |

## Evidence

- `track/evidence/SDK-001/validation.txt`

## Follow-up Tasks

- SDK-002
