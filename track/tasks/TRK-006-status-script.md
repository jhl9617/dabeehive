# TRK-006 — Task Status Update Script

## Status

- Status: verified
- Priority: P1
- Area: Tracking
- Created At: 2026-05-06 10:41:30 KST
- Started At: 2026-05-06 10:41:30 KST
- Completed At: 2026-05-06 10:45:11 KST

## Objective

Add a small, dependency-free helper script and npm entrypoint that can update a task status in `track/MASTER.md` and recalculate the status summary counts.

## Acceptance Criteria

- [x] A status update helper script or npm script exists.
- [x] The helper validates allowed task status values and updates `track/MASTER.md` status/counts in a dry-run safe way.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `scripts/track-status.mjs` helper script.
- Root `package.json` script entry.
- Tracking, log, and evidence updates for TRK-006.

### Out of Scope

- Product source/runtime behavior.
- Jira, Slack, deployment, auto merge, or external integrations.
- Full workflow automation or multi-file tracking mutation beyond `track/MASTER.md`.

## Expected Files

- `scripts/track-status.mjs`: dependency-free helper for status updates.
- `package.json`: npm script entrypoint.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/TRK-006-status-script.md`: task details and validation results.
- `track/logs/2026-05-06-TRK-006.md`: session log.
- `track/evidence/TRK-006/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- The helper should not edit task files, changelog, logs, or current task state; Codex tracking rules still require those explicit updates.
- The helper should be safe to validate with `--dry-run`.
- No package dependencies are planned.

## Dependencies / Decisions

- No new package dependency.
- Use the existing repository Node.js script style under `scripts/`.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: dependency-free developer helper scoped to tracking files and root package scripts.

## Changes Made

- Added `scripts/track-status.mjs`, a dependency-free helper that updates one task status in `track/MASTER.md`, validates allowed statuses, refuses multiple `in_progress` tasks, supports `--dry-run`, and recalculates summary counts from task rows.
- Added root `pnpm track:status` script.
- Used the helper to close TRK-006 as `verified`, which normalized the `MASTER.md` summary to 131 task rows, 81 verified, 3 implemented, 1 blocked, and 46 not_started.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node -c scripts/track-status.mjs` | Passed | Script syntax is valid. |
| `node scripts/track-status.mjs --help` | Passed | Usage text prints allowed statuses and options. |
| `node scripts/track-status.mjs --task TRK-006 --status in_progress --dry-run` | Passed | Dry-run printed current status and recalculated counts without writing. |
| `pnpm track:status -- --task TRK-006 --status in_progress --dry-run` | Passed | npm script entrypoint passes arguments correctly after supporting standalone `--`. |
| `node scripts/track-status.mjs --file /private/tmp/dabeehive-TRK-006-MASTER.md --task TRK-006 --status verified` | Passed | Temp copy write path updated TRK-006 and summary counts. |
| `node scripts/track-status.mjs --task TRK-006 --status verified` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |
| `pnpm lint` | Passed | `basic lint passed`. |

## Evidence

- `track/evidence/TRK-006/validation.txt`

## Follow-up Tasks

- FND-006
