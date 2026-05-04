# GIT-004 — Diff Summary Generator

## Status

- Status: verified
- Priority: P0
- Area: Git
- Created At: 2026-05-04 19:39:11 KST
- Started At: 2026-05-04 19:39:11 KST
- Completed At: 2026-05-04 19:41:38 KST

## Objective

Add a shared helper that parses Git numstat output and generates a concise human-readable diff summary for review and approval surfaces.

## Acceptance Criteria

- [x] `parseDiffNumstat` parses text and binary file diff rows.
- [x] `buildHumanReadableDiffSummary` creates a readable summary with total files, insertions, deletions, binary count, and file details.
- [x] `getDiffSummary` runs Git through an injected command runner and returns parsed files plus text.
- [x] The helper is exported from `packages/shared`.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `packages/shared/src/git-diff-summary.ts`
- `packages/shared/src/index.ts`
- GIT-004 tracking, log, and evidence files.

### Out of Scope

- Test result artifact creation.
- Draft PR creation or GitHub API integration.
- Automatic merge.
- Applying patches or changing diff contents.
- Custom AI code editing engine or shell tool loop.

## Expected Files

- `packages/shared/src/git-diff-summary.ts`: diff summary helper implementation.
- `packages/shared/src/index.ts`: shared export update.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-GIT-004.md`: session log.
- `track/evidence/GIT-004/validation.txt`: validation evidence.

## Implementation Notes

- Use `git diff --numstat` output because it is stable, concise, and parseable.
- Keep command execution injected for auditability and caller control.
- No package dependency is required.

## Dependencies / Decisions

- Builds on the Git helper pattern from GIT-001 through GIT-003.
- No dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Shared read-only parser/helper only; no DB schema, auth, dependency, deploy, or destructive command changes.

## Changes Made

- Added `DiffSummaryFile`, `DiffSummary`, `parseDiffNumstat`, `buildDiffSummary`, `buildHumanReadableDiffSummary`, and `getDiffSummary`.
- Generated readable summaries with totals, binary file count, per-file lines, and omitted-file counts.
- Exported the diff summary helper from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| `pnpm --filter @dabeehive/server exec node -e "<diff summary helper smoke>"` | Passed | Verified numstat parsing, binary file handling, summary text, staged command, cwd forwarding, and failure propagation. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `rg "getDiffSummary|parseDiffNumstat|buildHumanReadableDiffSummary|git diff --numstat|git-diff-summary" packages/shared/src track/tasks/GIT-004-diff-summary-generator.md` | Passed | Helper implementation, export, and task records found. |

## Evidence

- `track/evidence/GIT-004/validation.txt`

## Follow-up Tasks

- GIT-005
