# GIT-002 — Task Branch Creation

## Status

- Status: verified
- Priority: P0
- Area: Git
- Created At: 2026-05-04 19:31:06 KST
- Started At: 2026-05-04 19:31:06 KST
- Completed At: 2026-05-04 19:33:06 KST

## Objective

Add a small shared helper that constructs PoC task branch names in the `poc/<TASK-ID>-slug` format and requests branch creation through an injected command runner.

## Acceptance Criteria

- [x] `buildTaskBranchName` creates stable `poc/<TASK-ID>-slug` names from a task ID and title.
- [x] `createTaskBranch` dispatches `git switch -c <branch>` through an injected command runner and reports failures.
- [x] The helper is exported from `packages/shared`.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `packages/shared/src/git-branch.ts`
- `packages/shared/src/index.ts`
- GIT-002 tracking, log, and evidence files.

### Out of Scope

- Automatic merge.
- Draft PR creation or GitHub API integration.
- Workspace status parsing from GIT-001.
- Changed files detector, diff summary generator, or test result artifact creation.
- Custom AI code editing engine or shell tool loop.

## Expected Files

- `packages/shared/src/git-branch.ts`: task branch helper implementation.
- `packages/shared/src/index.ts`: shared export update.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-GIT-002.md`: session log.
- `track/evidence/GIT-002/validation.txt`: validation evidence.

## Implementation Notes

- Branch creation must be command-runner based so callers keep control over execution, logging, approvals, and workspace boundaries.
- No package dependency is required.

## Dependencies / Decisions

- Depends on GIT-001 only for the broader Git phase ordering.
- No dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Shared helper only; no DB schema, auth, dependency, deploy, or destructive command changes.

## Changes Made

- Added `buildTaskBranchName`, `slugifyTaskBranchTitle`, and `createTaskBranch` in `packages/shared/src/git-branch.ts`.
- Exported the branch helper from `packages/shared/src/index.ts`.
- Recorded validation evidence for the GIT-002 checks.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm --filter @dabeehive/server exec node -e "<task branch helper smoke>"` | Passed | Verified branch name, injected `git switch -c` command, cwd forwarding, and failure propagation. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `rg "createTaskBranch|buildTaskBranchName|slugifyTaskBranchTitle|git switch|git-branch" packages/shared/src track/tasks/GIT-002-task-branch-creation.md` | Passed | Helper implementation, export, and task records found. |

## Evidence

- `track/evidence/GIT-002/validation.txt`

## Follow-up Tasks

- GIT-003
