# GIT-007 — Optional Draft PR Command

## Status

- Status: verified
- Priority: P1
- Area: Git
- Created At: 2026-05-06 14:45:51 KST
- Started At: 2026-05-06 14:45:51 KST
- Completed At: 2026-05-06 14:48:30 KST

## Objective

Add a minimal optional Draft PR command helper that only allows Draft PR creation after final approval and delegates execution to an injected command runner.

## Acceptance Criteria

- [x] Helper refuses Draft PR creation unless the final approval is approved.
- [x] Helper refuses execution when Draft PR config is incomplete.
- [x] Helper builds an explicit `gh pr create --draft` command and delegates to an injected runner.
- [x] Validation does not call GitHub or create a PR.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Shared Draft PR command helper/types.
- Final approval/config guards.
- Typecheck/lint/source validation.

### Out of Scope

- GitHub API clients, Octokit integration, actual PR creation during validation, automatic merge, automatic deploy, Jira, Slack, or full external integrations.
- Real token handling, package dependencies, DB schema changes, or custom AI editing engine.

## Expected Files

- `packages/shared/src/draft-pr-command.ts`: Draft PR command helper/types.
- `packages/shared/src/index.ts`: export helper.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/GIT-007-optional-draft-pr-command.md`: task details and validation results.
- `track/logs/2026-05-06-GIT-007.md`: session log.
- `track/evidence/GIT-007/validation.txt`: validation evidence.

## Implementation Notes

- Keep execution injectable for deterministic validation.
- Do not execute `gh`, call GitHub, or create PRs during this task.
- Require `final_approval` with `approved` status.

## Dependencies / Decisions

- Depends on GIT-006 Draft PR config status helper.
- No package dependency additions.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds command construction and guard helper only; no real external call, secret handling, dependency, schema, deployment, or destructive command.

## Changes Made

- Added shared Draft PR command plan/run helper with final approval and config guards.
- Added explicit `gh pr create --draft` command construction with repo/base/head/title/body arguments.
- Ensured execution is delegated to an injected command runner and skipped when blocked.
- Exported the helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check completed successfully. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "DraftPrCommand\|buildDraftPrCommandPlan\|runDraftPrCommand\|approval_not_final\|approval_not_approved\|config_incomplete\|gh\|pr\|create\|--draft\|final_approval\|approved\|draft-pr-command" packages/shared/src/draft-pr-command.ts packages/shared/src/index.ts` | Passed | Source check confirmed helper exports, approval/config guards, and command construction. |

## Evidence

- `track/evidence/GIT-007/validation.txt`

## Follow-up Tasks

- GIT-008
