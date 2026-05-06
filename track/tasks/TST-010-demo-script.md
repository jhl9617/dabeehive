# TST-010 — Demo Script

## Status

- Status: verified
- Priority: P1
- Area: Test
- Created At: 2026-05-06 16:13:43 KST
- Started At: 2026-05-06 16:13:43 KST
- Completed At: 2026-05-06 16:16:47 KST

## Objective

Write a PoC demo script that gives presenters a clear order of operations, expected results, validation commands, and explicit blocker or skip callouts for DB-backed and out-of-scope parts.

## Acceptance Criteria

- [x] Demo script documents preparation, baseline validation, server/API/MCP/Extension/SDK/UI walkthrough steps, expected results, and blocked or skipped steps.
- [x] Demo script references TST-008 acceptance and TST-009 known issues so reviewers understand what is verified, blocked, or out of scope.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Demo script under `track/evidence/TST-010/`.
- Validation evidence for demo script section coverage and lint.
- TST-010 tracking, log, and changelog files.

### Out of Scope

- New product source code or feature implementation.
- Jira, Slack, full external integrations, deployment, automatic merge, or production secret access.
- DB migration/seed execution, REST/MCP authenticated smoke re-run, or full E2E demo re-run.
- Custom AI code editing engine.

## Expected Files

- `track/evidence/TST-010/demo-script.md`: ordered demo script and expected results.
- `track/evidence/TST-010/validation.txt`: validation evidence.
- `track/MASTER.md`: TST-010 status update.
- `track/CURRENT.md`: active task state.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- The demo script should be usable with the current PoC state and explicitly mark DB-backed live sections as blocked unless PostgreSQL is available.
- AGENTS PoC exclusions override broader PRD MVP items that mention Slack, full external integrations, deployment, or custom execution sandbox behavior.

## Dependencies / Decisions

- Depends on TST-008 final acceptance checklist and TST-009 known issues.
- No package dependencies.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Documentation/evidence task only; no source behavior, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `track/evidence/TST-010/demo-script.md`.
- Documented prerequisites, baseline validation, server walkthrough, REST walkthrough, MCP walkthrough, VS Code walkthrough, SDK walkthrough, UI walkthrough, expected results, blocked steps, explicit out-of-scope items, and closing checklist.
- Split current non-DB demo steps from DB-backed optional steps that require PostgreSQL and seeded token data.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "Demo script\|Prerequisites\|Baseline validation\|Server walkthrough\|REST walkthrough\|MCP walkthrough\|VS Code walkthrough\|SDK walkthrough\|Expected results\|Blocked steps\|Out of scope" track/evidence/TST-010/demo-script.md` | Passed | Required demo script sections are present. |
| `pnpm track:status -- --task TST-010 --status verified --dry-run` | Passed | MASTER summary shows verified=123, in_progress=0, not_started=0. |

## Evidence

- `track/evidence/TST-010/demo-script.md`
- `track/evidence/TST-010/validation.txt`

## Follow-up Tasks

- None
