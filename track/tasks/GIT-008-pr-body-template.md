# GIT-008 — PR Body Template

## Status

- Status: verified
- Priority: P2
- Area: Git
- Created At: 2026-05-06 14:50:16 KST
- Started At: 2026-05-06 14:50:16 KST
- Completed At: 2026-05-06 14:52:14 KST

## Objective

Add a reusable PR body template helper that includes plan, diff, test, approval, and artifact references for optional Draft PR creation.

## Acceptance Criteria

- [x] A shared PR body template helper exists.
- [x] Generated body includes issue/run context plus plan, diff, test, approval, and artifact references when provided.
- [x] Empty optional sections are omitted or rendered with clear fallback text.
- [x] The implementation does not call GitHub, create PRs, add dependencies, or implement a full external integration.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Shared PR body template helper/types.
- Export from shared package.
- Typecheck/lint/source validation.

### Out of Scope

- GitHub API calls, actual PR creation, automatic merge, automatic deploy, Jira, Slack, full external integrations, package dependencies, DB schema changes, or custom AI editing engine.

## Expected Files

- `packages/shared/src/pr-body-template.ts`: PR body helper/types.
- `packages/shared/src/index.ts`: export helper.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/GIT-008-pr-body-template.md`: task details and validation results.
- `track/logs/2026-05-06-GIT-008.md`: session log.
- `track/evidence/GIT-008/validation.txt`: validation evidence.

## Implementation Notes

- Keep output deterministic Markdown.
- Do not embed secrets or external API calls.
- Limit the helper to body text generation.

## Dependencies / Decisions

- Can be used by GIT-007 Draft PR command helper in later wiring.
- No package dependency additions.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Adds deterministic text generation only; no secrets, external calls, dependencies, schema, deployment, or destructive changes.

## Changes Made

- Added shared deterministic PR body template helper and types.
- Added context, references, changed files, validation, and artifact sections.
- Rendered missing plan/diff/test/approval references with `not provided` fallback text.
- Exported the helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check completed successfully. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "PrBody\|buildPrBody\|buildReferencesSection\|buildArtifactSection\|buildValidationSection\|buildChangedFilesSection\|Plan\|Diff\|Test\|Approval\|Artifacts\|pr-body-template" packages/shared/src/pr-body-template.ts packages/shared/src/index.ts` | Passed | Source check confirmed PR body template sections and export. |

## Evidence

- `track/evidence/GIT-008/validation.txt`

## Follow-up Tasks

- UI-001
