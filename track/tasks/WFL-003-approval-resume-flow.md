# WFL-003 — Approval Resume Flow

## Status

- Status: verified
- Priority: P0
- Area: Workflow
- Created At: 2026-05-04 19:14:14 KST
- Started At: 2026-05-04 19:14:14 KST
- Completed At: 2026-05-04 19:15:56 KST

## Objective

Add the workflow helper that resumes a run after an approval response.

## Acceptance Criteria

- [x] `resumeRunAfterApproval` exists.
- [x] Helper maps approval response actions to next run status and calls `agentRun.update()`.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/server/src/lib/workflow/approval-resume.ts`
- WFL-003 tracking, log, and evidence files

### Out of Scope

- API route changes
- database schema changes
- final diff approval creation
- artifact persistence
- SDK invocation
- VS Code UI
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/server/src/lib/workflow/approval-resume.ts`: approval response run resume helper
- `track/MASTER.md`: WFL-003 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-WFL-003.md`: session log
- `track/evidence/WFL-003/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the workflow helper deterministic and framework-neutral.
- Do not add a new API route or modify DB schema in this task.

## Dependencies / Decisions

- Depends on existing `AgentRun` status vocabulary and `Approval` response action vocabulary.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 30
- Approval Required: no
- Reason: Adds a server helper that updates an existing AgentRun status shape only; no schema, auth, public route, package dependency, deployment, or destructive changes.

## Changes Made

- Added `resumeRunAfterApproval`, `getRunStatusAfterApprovalResponse`, and `buildApprovalRunUpdateData`.
- Mapped approve/reject/request_changes actions to coding/planning/succeeded/failed run statuses.
- Kept API route wiring, DB schema, final diff approval creation, and artifact persistence out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server typecheck completed with no output. |
| approval resume helper smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `approval-resume.ts`, then verified approve/reject/request_changes mappings and fake Prisma `agentRun.update()` calls. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `resumeRunAfterApproval` | Passed | Found helper, status mapper, update data builder, agent run update call, task references, and source path. |

## Evidence

- `track/evidence/WFL-003/validation.txt`

## Follow-up Tasks

- WFL-004
