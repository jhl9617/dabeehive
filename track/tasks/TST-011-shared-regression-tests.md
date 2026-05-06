# TST-011 — Shared Helper Regression Tests

## Status

- Status: verified
- Priority: P1
- Area: Test
- Created At: 2026-05-06 16:21:21 KST
- Started At: 2026-05-06 16:21:21 KST
- Completed At: 2026-05-06 16:23:57 KST

## Objective

Add dependency-free regression tests for high-value shared helpers that currently rely mostly on source checks: Draft PR command planning, PR body rendering, and Git diff summary generation.

## Acceptance Criteria

- [x] A root `pnpm test:shared` command runs deterministic shared helper regression tests.
- [x] Tests cover blocked/ready Draft PR command behavior, PR body normalization, and diff summary totals/omitted files.
- [x] Validation, review notes, and tracking updates are recorded.

## Scope

### In Scope

- Root package test script.
- Node-based regression test script under `scripts/`.
- TST-011 evidence, validation, review notes, task/log/changelog tracking.

### Out of Scope

- Product source behavior changes beyond adding tests.
- New package dependencies.
- Jira, Slack, full external integrations, deployment, automatic merge, production secret access, DB-backed smoke re-runs, or custom AI code editing engine.

## Expected Files

- `scripts/shared-regression-tests.mjs`: shared helper regression test script.
- `package.json`: root `test:shared` script.
- `track/evidence/TST-011/validation.txt`: validation evidence.
- `track/evidence/TST-011/review.md`: post-change review notes.
- `track/MASTER.md`: TST-011 status update.
- `track/CURRENT.md`: active task state.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- Follow existing smoke test style by transpiling TypeScript with the server workspace TypeScript dependency.
- Keep tests deterministic and database-free.
- Do not add a test framework dependency.

## Dependencies / Decisions

- No package dependencies.
- Uses existing TypeScript dependency through `apps/server/package.json`.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Test-only script and root npm script addition; no runtime source, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `scripts/shared-regression-tests.mjs`.
- Added root `pnpm test:shared`.
- Covered Draft PR command planning/runner behavior, PR body normalization, and diff summary parsing/totals/omitted-file behavior.
- Added validation evidence and post-change review notes.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm test:shared` | Passed | Shared regression tests passed. |
| `pnpm lint` | Passed | Basic lint passed. |
| `pnpm test:sdk` | Passed | Existing SDK smoke still passed after adding shared tests. |
| `git diff --check` | Passed | No whitespace errors. |
| `pnpm track:status -- --task TST-011 --status verified --dry-run` | Passed | MASTER summary shows verified=124, in_progress=0, not_started=0. |

## Evidence

- `track/evidence/TST-011/validation.txt`
- `track/evidence/TST-011/review.md`

## Follow-up Tasks

- None
