# GIT-001 — Workspace Git Status Helper

## Status

- Status: verified
- Priority: P0
- Area: Git
- Created At: 2026-05-04 19:25:01 KST
- Started At: 2026-05-04 19:25:01 KST
- Completed At: 2026-05-04 19:26:43 KST

## Objective

Add a workspace git status helper that reads branch and dirty state from git status output.

## Acceptance Criteria

- [x] `parseWorkspaceGitStatus` exists and is exported.
- [x] Helper parses branch, ahead/behind text, changed files, untracked files, and dirty state from `git status --short --branch`.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/git-status.ts`
- `packages/shared/src/index.ts`
- GIT-001 tracking, log, and evidence files

### Out of Scope

- direct shell execution loop
- branch creation
- changed file detector beyond status output parsing
- diff summary generation
- PR creation or GitHub integration
- API route changes
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/git-status.ts`: git status parser/helper
- `packages/shared/src/index.ts`: helper export
- `track/MASTER.md`: GIT-001 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-GIT-001.md`: session log
- `track/evidence/GIT-001/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the helper deterministic and dependency-injected.
- Do not execute shell commands directly from the parser.

## Dependencies / Decisions

- Depends on no external GitHub integration.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds deterministic TypeScript parsing/helper code only; no schema, auth, public route, package dependency, deployment, destructive command, or direct shell loop changes.

## Changes Made

- Added `parseWorkspaceGitStatus` and `getWorkspaceGitStatus`.
- Parsed branch, upstream, ahead/behind counts, dirty state, staged/unstaged/untracked file status, and raw output.
- Exported the helper from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| git status helper smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `git-status.ts`, then verified branch/upstream/ahead/behind/dirty/file parsing, injected command arguments, and error handling. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `parseWorkspaceGitStatus` | Passed | Found parser, injected helper, status types, command runner type, task references, and shared export. |

## Evidence

- `track/evidence/GIT-001/validation.txt`

## Follow-up Tasks

- GIT-002
