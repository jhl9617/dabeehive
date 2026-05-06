# GIT-006 — Draft PR Config

## Status

- Status: verified
- Priority: P1
- Area: Git
- Created At: 2026-05-06 14:41:18 KST
- Started At: 2026-05-06 14:41:18 KST
- Completed At: 2026-05-06 14:43:59 KST

## Objective

Add a configuration structure for optional Draft PR creation that can validate GitHub repository and token configuration without calling GitHub or creating PRs.

## Acceptance Criteria

- [x] A reusable Draft PR config type/helper exists.
- [x] GitHub owner/repo/token presence can be validated without exposing token values.
- [x] `.env.example` documents placeholder-only config keys for local use.
- [x] The implementation does not create PRs, call GitHub, add dependencies, or implement a full external integration.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Shared Draft PR config helper/types.
- Placeholder-only environment documentation.
- Typecheck/lint/source validation.

### Out of Scope

- GitHub API calls, Octokit integration, Draft PR creation command, automatic merge, automatic deploy, Jira, Slack, or full external integrations.
- Real token generation/storage, secrets, DB schema changes, package dependencies, or custom AI editing engine.

## Expected Files

- `packages/shared/src/draft-pr-config.ts`: Draft PR config helper/types.
- `packages/shared/src/index.ts`: export helper.
- `.env.example`: placeholder-only local config documentation.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/GIT-006-draft-pr-config.md`: task details and validation results.
- `track/logs/2026-05-06-GIT-006.md`: session log.
- `track/evidence/GIT-006/validation.txt`: validation evidence.

## Implementation Notes

- Config validation must redact token values and only report token presence.
- Do not add package dependencies or network access.
- Keep the helper deterministic and provider-specific only to GitHub Draft PR config.

## Dependencies / Decisions

- Depends on existing project `repoOwner`/`repoName` fields and optional `pr_url` artifact type.
- No package dependency additions.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds placeholder config helper and env example only; no real secrets, API calls, deployment, dependency, schema, or destructive changes.

## Changes Made

- Added shared Draft PR config status types and helpers for owner/repo/token presence.
- Added env-key constants and env/project fallback config builder.
- Added placeholder-only Draft PR config keys to `.env.example`.
- Exported the helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check completed successfully. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "DraftPr\|DRAFT_PR_ENV_KEYS\|buildDraftPrConfigStatus\|buildDraftPrConfigStatusFromEnv\|summarizeDraftPrConfigStatus\|DABEEHIVE_DRAFT_PR_GITHUB\|DABEEHIVE_DRAFT_PR_BASE_BRANCH\|draft-pr-config" packages/shared/src/draft-pr-config.ts packages/shared/src/index.ts .env.example` | Passed | Source check confirmed config helper exports and placeholder env keys. |

## Evidence

- `track/evidence/GIT-006/validation.txt`

## Follow-up Tasks

- GIT-007
