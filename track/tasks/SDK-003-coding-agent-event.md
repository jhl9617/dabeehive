# SDK-003 — CodingAgentEvent Type

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:40:30 KST
- Started At: 2026-05-04 18:40:30 KST
- Completed At: 2026-05-04 18:41:42 KST

## Objective

Define the normalized `CodingAgentEvent` type for Agent SDK runner events.

## Acceptance Criteria

- [x] `CodingAgentEvent` type exists and is exported.
- [x] Type supports message/tool/file/command/test/error/done event categories.
- [x] Typecheck/lint and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/agent-sdk.ts`
- SDK-003 tracking, log, and evidence files

### Out of Scope

- event normalization implementation
- Claude adapter implementation
- SDK invocation
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/agent-sdk.ts`: `CodingAgentEvent` type
- `track/MASTER.md`: SDK-003 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-003.md`: session log
- `track/evidence/SDK-003/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Match the normalized event shape defined in AGENTS.md.
- Do not implement conversion from provider SDK events in this task.

## Dependencies / Decisions

- Depends on SDK-001/SDK-002 shared SDK types.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds exported TypeScript types only; no runtime, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `CodingAgentEvent` with `runId`, normalized `RunEventType`, optional `message`, optional `metadata`, and `createdAt`.
- Reused the shared `RunEventType` union so message/tool/file/command/test/error/done categories stay aligned with domain/API event storage.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `CodingAgentEvent` | Passed | Found `CodingAgentEvent`, `RunEventType`, key categories, and timestamp field. |

## Evidence

- `track/evidence/SDK-003/validation.txt`

## Follow-up Tasks

- SDK-004
