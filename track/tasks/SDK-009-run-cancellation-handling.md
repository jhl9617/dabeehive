# SDK-009 — Run Cancellation Handling

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 19:01:27 KST
- Started At: 2026-05-04 19:01:27 KST
- Completed At: 2026-05-04 19:03:11 KST

## Objective

Add run cancellation handling so a cancellation command is passed to the local coding agent adapter.

## Acceptance Criteria

- [x] `dispatchRunCancellation` exists and is exported.
- [x] Cancellation dispatch calls adapter `cancel()` with run id, reason, and requested-at timestamp.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/run-cancellation.ts`
- `packages/shared/src/index.ts`
- SDK-009 tracking, log, and evidence files

### Out of Scope

- real SDK process cancellation
- shell execution
- API route changes
- database writes
- workflow state transitions
- VS Code commands
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/run-cancellation.ts`: cancellation dispatch helper
- `packages/shared/src/index.ts`: helper export
- `track/MASTER.md`: SDK-009 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-009.md`: session log
- `track/evidence/SDK-009/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep cancellation dispatch deterministic and provider-neutral.
- Do not call any real SDK, shell command, REST API, or database from the helper.

## Dependencies / Decisions

- Depends on SDK-001.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript cancellation dispatch helper only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `RunCancellationCommand`, `buildRunCancellationCommand`, and `dispatchRunCancellation`.
- Normalized empty cancellation reasons to a deterministic fallback message.
- Exported the cancellation helper from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| run cancellation smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `run-cancellation.ts`, then verified fake adapter received the normalized cancel command. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `dispatchRunCancellation` | Passed | Found dispatcher, command builder/type, adapter cancel call, task references, and shared export. |

## Evidence

- `track/evidence/SDK-009/validation.txt`

## Follow-up Tasks

- WFL-001
