# Codex Session Log — <TASK-ID>

## Template Usage

- File Name: `track/logs/YYYY-MM-DD-<TASK-ID>.md`
- Create or update this file during each Codex execution for the active Task ID.
- Keep the log factual: record what was read, changed, validated, failed, or deferred.
- Do not use this file as the task spec; use `track/tasks/<TASK-ID>-<short-slug>.md` for task details.

## Session Metadata

- Date: YYYY-MM-DD
- Task ID: <TASK-ID>
- Branch: <branch-name>
- Started At: YYYY-MM-DD HH:mm:ss ZZZ
- Finished At:

## Initial Context Read

- [ ] AGENTS.md
- [ ] track/MASTER.md
- [ ] track/CURRENT.md
- [ ] track/tasks/<TASK-ID>.md
- [ ] relevant source files
- [ ] relevant validation or config files

## Plan

1. Confirm tracking state and scope.
2. Implement or verify only this Task ID.
3. Run validation, record evidence, close tracking, and commit if requested.

## Actions

| Time | Action | Files/Commands | Result |
|---|---|---|---|
| YYYY-MM-DD HH:mm ZZZ | Short action description | `file` or `command` | Completed / Failed / Deferred |

Action rows should include:

- Context reads that affect implementation.
- Tracking state changes.
- File edits or validation-only decisions.
- Failed attempts when they matter to the final result.
- Explicitly deferred work and reason.

## Validation

| Command | Result | Notes |
|---|---|---|
| `command` | Passed / Failed / Not run | Short result, failure cause, or reason not run. |

Validation rows should include:

- Lint, typecheck, unit test, build, smoke test, or documentation checks that were executable.
- Any failed validation that affected task status.
- The path to saved evidence when relevant.

## Final Summary

- Status:
- Changed files:
- Validation result:
- Evidence:

## Issues / Follow-ups

- Blockers, unrelated dirty files, residual risk, or next Task ID.
