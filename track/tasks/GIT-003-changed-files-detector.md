# GIT-003 — Changed Files Detector

## Status

- Status: verified
- Priority: P0
- Area: Git
- Created At: 2026-05-04 19:35:06 KST
- Started At: 2026-05-04 19:35:06 KST
- Completed At: 2026-05-04 19:37:26 KST

## Objective

Add a shared helper that collects changed workspace file paths from Git status output while leaving command execution to an injected runner.

## Acceptance Criteria

- [x] `getChangedFiles` collects changed files by running Git through an injected command runner.
- [x] `parseChangedFiles` handles staged, unstaged, untracked, deleted, and renamed status lines.
- [x] The helper is exported from `packages/shared`.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `packages/shared/src/git-changed-files.ts`
- `packages/shared/src/index.ts`
- GIT-003 tracking, log, and evidence files.

### Out of Scope

- Diff summary generator.
- Test result artifact creation.
- Draft PR creation or GitHub API integration.
- Automatic merge.
- Custom AI code editing engine or shell tool loop.

## Expected Files

- `packages/shared/src/git-changed-files.ts`: changed files detector implementation.
- `packages/shared/src/index.ts`: shared export update.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-GIT-003.md`: session log.
- `track/evidence/GIT-003/validation.txt`: validation evidence.

## Implementation Notes

- Use `git status --porcelain=v1 --untracked-files=all` output because it is stable and easy to parse without shell-specific behavior.
- Keep command execution injected for auditability and caller control.
- No package dependency is required.

## Dependencies / Decisions

- Builds on the Git helper pattern from GIT-001 and GIT-002.
- No dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Shared parser/helper only; no DB schema, auth, dependency, deploy, or destructive command changes.

## Changes Made

- Added `ChangedFile` types, `parseChangedFiles`, and `getChangedFiles` in `packages/shared/src/git-changed-files.ts`.
- Parsed staged, unstaged, deleted, untracked, renamed, and copied porcelain status lines.
- Exported the changed files helper from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm --filter @dabeehive/server exec node -e "<changed files helper smoke>"` | Passed | Verified parser statuses, rename metadata, injected command, cwd forwarding, include-untracked flag, and failure propagation. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `rg "getChangedFiles|parseChangedFiles|git status --porcelain|git-changed-files" packages/shared/src track/tasks/GIT-003-changed-files-detector.md` | Passed | Helper implementation, export, and task records found. |

## Evidence

- `track/evidence/GIT-003/validation.txt`

## Follow-up Tasks

- GIT-004
