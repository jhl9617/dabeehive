# SDK-002 — CodingRunInput Type

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:37:34 KST
- Started At: 2026-05-04 18:37:34 KST
- Completed At: 2026-05-04 18:38:58 KST

## Objective

Define the `CodingRunInput` type with run, issue, workspace, and system instruction fields.

## Acceptance Criteria

- [x] `CodingRunInput` type exists and is exported.
- [x] Type includes runId, issue, workspace, and systemInstruction fields.
- [x] Typecheck/lint and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/agent-sdk.ts`
- SDK-002 tracking, log, and evidence files

### Out of Scope

- `CodingAgentEvent` type
- Claude adapter implementation
- SDK invocation
- SDK event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/agent-sdk.ts`: `CodingRunInput` and adapter start type wiring
- `track/MASTER.md`: SDK-002 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-002.md`: session log
- `track/evidence/SDK-002/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the type provider-neutral and serializable.
- Do not introduce event streaming or provider-specific SDK options.

## Dependencies / Decisions

- Depends on SDK-001 shared adapter interface.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds exported TypeScript types only; no runtime, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `CodingRunInput` with `runId`, `project`, `issue`, `workspace`, `systemInstruction`, optional `agentRole`, `model`, `context`, and `metadata`.
- Added supporting `CodingRunWorkspace`, `CodingRunModel`, and `CodingRunProject` types.
- Wired `LocalCodingAgentAdapter.start()` to accept `CodingRunInput` while keeping `LocalCodingAgentStartRequest` as a compatibility alias.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `CodingRunInput` | Passed | Found `CodingRunInput`, supporting types, `systemInstruction`, alias, and adapter start wiring. |

## Evidence

- `track/evidence/SDK-002/validation.txt`

## Follow-up Tasks

- SDK-003
