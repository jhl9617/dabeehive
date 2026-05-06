# TST-009 — Known Issues Documentation

## Status

- Status: verified
- Priority: P1
- Area: Test
- Created At: 2026-05-06 16:08:18 KST
- Started At: 2026-05-06 16:08:18 KST
- Completed At: 2026-05-06 16:10:58 KST

## Objective

Document the remaining known issues, blockers, residual risks, and PoC-excluded scope so reviewers can clearly distinguish implemented behavior from unverified or intentionally omitted behavior.

## Acceptance Criteria

- [x] Known issues document lists remaining blockers, implemented-but-not-runtime-verified items, residual risks, explicit out-of-scope items, and production-readiness gaps.
- [x] Document references the existing final acceptance checklist and relevant risk/evidence records.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Known issues documentation under `track/evidence/TST-009/`.
- Validation evidence for section coverage and lint.
- TST-009 tracking, log, and changelog files.

### Out of Scope

- New product source code or feature implementation.
- Jira, Slack, full external integrations, deployment, automatic merge, or production secret access.
- DB migration/seed execution, REST/MCP authenticated smoke re-run, or full E2E demo re-run.
- Custom AI code editing engine.

## Expected Files

- `track/evidence/TST-009/known-issues.md`: known issues and residual gap document.
- `track/evidence/TST-009/validation.txt`: validation evidence.
- `track/MASTER.md`: TST-009 status update.
- `track/CURRENT.md`: active task state.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- AGENTS PoC exclusions override broader PRD MVP items that mention Slack, full external integrations, deployment, or custom execution sandbox behavior.
- TST-008 already records final acceptance status; TST-009 should summarize the actionable known issue inventory.

## Dependencies / Decisions

- Depends on TST-008 final acceptance checklist and `track/RISKS.md`.
- No package dependencies.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Documentation/evidence task only; no source behavior, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `track/evidence/TST-009/known-issues.md`.
- Documented DB/Docker validation blockers, implemented-but-not-runtime-verified test areas, residual security/workflow risks, explicit PoC exclusions, production readiness gaps, non-claimed acceptance areas, and revalidation steps.
- Linked the known issue inventory to TST-008, TST-007, TST-002 through TST-004, RISKS, and relevant task records.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "Known issues\|Blocked\|Implemented but not runtime verified\|Residual risks\|Out of scope\|Production readiness\|TST-010" track/evidence/TST-009/known-issues.md` | Passed | Required known issue sections and next-task reference are present. |
| `pnpm track:status -- --task TST-009 --status verified --dry-run` | Passed | MASTER summary shows verified=122, in_progress=0, not_started=1. |

## Evidence

- `track/evidence/TST-009/known-issues.md`
- `track/evidence/TST-009/validation.txt`

## Follow-up Tasks

- TST-010
