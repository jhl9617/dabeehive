# TRK-004 — Task Template Rules

## Status

- Status: verified
- Priority: P0
- Area: Tracking
- Created At: 2026-05-04 14:24:16 KST
- Started At: 2026-05-04 14:24:16 KST
- Completed At: 2026-05-04 14:26:18 KST

## Objective

Clarify the task file template and task README so new task files have explicit creation, status, scope, validation, evidence, and follow-up recording rules.

## Acceptance Criteria

- [x] `track/templates/task-template.md` describes required task file fields clearly.
- [x] `track/templates/task-template.md` includes validation and evidence recording expectations.
- [x] `track/tasks/README.md` documents the task file naming and creation flow.
- [x] Tracking files record the start and completion of this task.

## Scope

### In Scope

- Update `track/templates/task-template.md`.
- Update `track/tasks/README.md`.
- Record validation evidence for `TRK-004`.

### Out of Scope

- Jira, Slack, or full external integrations.
- Custom AI code editing engine.
- Product implementation outside tracking templates.
- Session log template changes, which belong to `TRK-005`.

## Expected Files

- `track/templates/task-template.md`: clarify new task file structure and field expectations.
- `track/tasks/README.md`: clarify task file naming and creation flow.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/TRK-004-task-template.md`: task details and validation result.
- `track/logs/2026-05-04-TRK-004.md`: session log.
- `track/evidence/TRK-004/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion entry.

## Implementation Notes

- Keep changes documentation-only and limited to task template rules.
- Do not modify the session log template in this task.
- `docs/codex-implementation-rules.md` is deleted in the working tree at task start but is unrelated to `TRK-004` and will not be touched.

## Dependencies / Decisions

- Depends on `TRK-001`, `TRK-002`, and `TRK-003` being verified.

## Risk / Approval

- Risk Score: 0
- Approval Required: no
- Reason: Tracking documentation only; no sensitive code, dependency, schema, auth, deployment, or destructive operation changes.

## Changes Made

- Expanded `track/templates/task-template.md` with template usage, file naming, allowed status values, field expectations, validation, evidence, and approval notes.
- Expanded `track/tasks/README.md` with file naming, creation flow, required sections, and task file rules.
- Created this task detail file and session log.
- Recorded validation evidence in `track/evidence/TRK-004/validation.txt`.
- Updated `track/MASTER.md`, `track/CURRENT.md`, and `track/CHANGELOG.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `rg "File Name\|Creation Flow\|Status\|Validation\|Evidence\|Risk / Approval" track/templates/task-template.md track/tasks/README.md` | Passed | Required rule sections are present. |
| `rg "not_started \| planned \| in_progress \| blocked \| implemented \| verified \| skipped\|track/evidence/<TASK-ID>\|Approval Required\|Expected Files" track/templates/task-template.md` | Passed | Template documents status, expected files, approval, and evidence requirements. |
| `rg "<TASK-ID>-<short-slug>\|track/templates/task-template.md\|track/CURRENT.md\|track/MASTER.md\|One task file covers one Task ID" track/tasks/README.md` | Passed | README documents naming and creation flow. |
| `rg "TRK-004 \| in_progress\|Task ID: TRK-004\|Status: in_progress" track/MASTER.md track/CURRENT.md track/tasks/TRK-004-task-template.md` | Passed | Pre-implementation tracking state was present before validation. |

## Evidence

- `track/evidence/TRK-004/validation.txt`

## Follow-up Tasks

- `TRK-005`: session log template 정리.
