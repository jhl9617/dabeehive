# WFL-001 — Run State Machine

## Status

- Status: verified
- Priority: P0
- Area: Workflow
- Created At: 2026-05-04 19:04:50 KST
- Started At: 2026-05-04 19:04:50 KST
- Completed At: 2026-05-04 19:06:30 KST

## Objective

Define the run state machine for queued/planning/waiting/coding/reviewing/succeeded/failed workflow states.

## Acceptance Criteria

- [x] `RUN_STATUS_TRANSITIONS` exists and includes queued/planning/waiting_approval/coding/reviewing/succeeded/failed states.
- [x] Helpers exist for allowed transition checks, next-status lookup, and terminal status checks.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/run-state-machine.ts`
- `packages/shared/src/index.ts`
- WFL-001 tracking, log, and evidence files

### Out of Scope

- API route changes
- database writes
- approval creation/resume behavior
- artifact persistence
- SDK invocation
- VS Code UI
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/run-state-machine.ts`: run state machine definition and helpers
- `packages/shared/src/index.ts`: state machine export
- `track/MASTER.md`: WFL-001 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-WFL-001.md`: session log
- `track/evidence/WFL-001/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep state transition logic deterministic and framework-neutral.
- Do not call any SDK, shell command, REST API, or database from the state machine.

## Dependencies / Decisions

- Depends on shared `RunStatus` type.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript state machine helper only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `RUN_STATUS_TRANSITIONS` and `TERMINAL_RUN_STATUSES`.
- Added `getNextRunStatuses`, `canTransitionRunStatus`, `isTerminalRunStatus`, and `assertRunStatusTransition`.
- Exported the state machine from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| run state machine smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `run-state-machine.ts`, then verified allowed/blocked transitions, terminal statuses, next states, and assertion error output. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `RUN_STATUS_TRANSITIONS` | Passed | Found transition table, terminal statuses, helper functions, task references, and shared export. |

## Evidence

- `track/evidence/WFL-001/validation.txt`

## Follow-up Tasks

- WFL-002
