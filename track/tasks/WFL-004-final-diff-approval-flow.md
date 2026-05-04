# WFL-004 — Final Diff Approval Flow

## Status

- Status: verified
- Priority: P0
- Area: Workflow
- Created At: 2026-05-04 19:17:44 KST
- Started At: 2026-05-04 19:17:44 KST
- Completed At: 2026-05-04 19:19:18 KST

## Objective

Add the final diff approval creation flow after code changes are produced.

## Acceptance Criteria

- [x] `createFinalDiffApproval` exists.
- [x] Helper creates a pending `final_approval` linked to run and issue from diff summary and changed files.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/server/src/lib/workflow/final-diff-approval.ts`
- WFL-004 tracking, log, and evidence files

### Out of Scope

- API route changes
- database schema changes
- approval response/resume behavior
- artifact persistence
- SDK invocation
- VS Code UI
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/server/src/lib/workflow/final-diff-approval.ts`: final diff approval creation helper
- `track/MASTER.md`: WFL-004 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-WFL-004.md`: session log
- `track/evidence/WFL-004/validation.txt`: validation evidence

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

- Added `createFinalDiffApproval` and `buildFinalDiffApprovalData`.
- Created pending `final_approval` data with run/issue links, diff summary, normalized changed files, required action, reason, and risk score.
- Kept API routes, DB schema, artifact persistence, and approval response/resume behavior out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server typecheck completed with no output. |
| final diff approval helper smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `final-diff-approval.ts`, then verified fake Prisma `approval.create()` received pending `final_approval` data linked to run and issue. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `createFinalDiffApproval` | Passed | Found helper, data builder, final approval type, task references, and source path. |

## Evidence

- `track/evidence/WFL-004/validation.txt`

## Follow-up Tasks

- WFL-005
