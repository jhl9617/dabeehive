# <TASK-ID> — <Task Title>

## Template Usage

- File Name: `track/tasks/<TASK-ID>-<short-slug>.md`
- Create this file before implementation starts.
- Replace every `<...>` placeholder before moving the task to `in_progress`.
- Keep one task file focused on one Task ID and one independently verifiable scope.
- Do not use this template for session logs; use `track/templates/session-log-template.md`.

## Status

- Status: planned
- Priority: P0 | P1 | P2 | P3
- Area: Tracking | Foundation | Server | DB | API | MCP | Extension | SDK | Workflow | Git | UI | Security | Test
- Created At: YYYY-MM-DD HH:mm:ss ZZZ
- Started At:
- Completed At:

Allowed status values:

```txt
not_started | planned | in_progress | blocked | implemented | verified | skipped
```

## Objective

Describe the task goal in one short paragraph. State the expected outcome, not a broad design direction.

## Acceptance Criteria

- [ ] One concrete, observable criterion.
- [ ] Another concrete, observable criterion.
- [ ] Validation and tracking updates are recorded.

## Scope

### In Scope

- Files, modules, or documents this task is allowed to change.
- Behaviors or checks required to satisfy the acceptance criteria.

### Out of Scope

- Explicit exclusions from this task.
- PoC-excluded integrations or broad refactors when not part of this Task ID.

## Expected Files

- `path/to/file`: expected change or validation-only note.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/<TASK-ID>/...`: validation evidence.

## Implementation Notes

- Record important implementation constraints, assumptions, and non-obvious choices.
- Note if a file already exists and the task is validation-only.

## Dependencies / Decisions

- List prerequisite tasks, dependency additions, or decisions.
- If adding a package dependency, record the reason here before implementation.

## Risk / Approval

- Risk Score: 0
- Approval Required: no
- Reason:

If approval is required, include:

- Reason:
- Changed files:
- Risk score:
- Diff summary:
- Required reviewer action:

## Changes Made

- List completed changes after implementation.
- Include validation-only findings when no source changes were needed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `command` | Passed / Failed / Not run | Short result or reason. |

## Evidence

- `track/evidence/<TASK-ID>/...`

## Follow-up Tasks

- Next task ID or `None`.
