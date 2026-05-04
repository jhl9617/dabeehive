# WFL-002 — Plan Approval Flow

## Status

- Status: verified
- Priority: P0
- Area: Workflow
- Created At: 2026-05-04 19:09:25 KST
- Started At: 2026-05-04 19:09:25 KST
- Completed At: 2026-05-04 19:11:13 KST

## Objective

Add the plan approval creation flow after planner output is produced.

## Acceptance Criteria

- [x] `createPlanApproval` exists.
- [x] Helper creates a pending `spec_approval` linked to run and issue from planner output.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/server/src/lib/workflow/plan-approval.ts`
- WFL-002 tracking, log, and evidence files

### Out of Scope

- API route changes
- database schema changes
- approval response/resume behavior
- final diff approvals
- artifact persistence
- SDK invocation
- VS Code UI
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/server/src/lib/workflow/plan-approval.ts`: plan approval creation helper
- `track/MASTER.md`: WFL-002 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-WFL-002.md`: session log
- `track/evidence/WFL-002/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the workflow helper deterministic and framework-neutral.
- Do not add a new API route or modify DB schema in this task.

## Dependencies / Decisions

- Depends on existing `Approval` Prisma model and API approval type vocabulary.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds a server helper that writes an existing Approval model shape only; no schema, auth, public route, package dependency, deployment, or destructive changes.

## Changes Made

- Added `createPlanApproval` and `buildPlanApprovalData`.
- Created pending `spec_approval` data with run/issue links, planner output, required action, reason, risk score, and empty changed file list.
- Kept API routes, DB schema, artifact persistence, and approval response/resume behavior out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server typecheck completed with no output. |
| plan approval helper smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `plan-approval.ts`, then verified fake Prisma `approval.create()` received pending `spec_approval` data linked to run and issue. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `createPlanApproval` | Passed | Found helper, data builder, spec approval type, task references, and source path. |

## Evidence

- `track/evidence/WFL-002/validation.txt`

## Follow-up Tasks

- WFL-003
