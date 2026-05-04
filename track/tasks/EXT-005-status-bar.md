# EXT-005 — connection status bar

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:07:50 KST
- Started At: 2026-05-04 18:07:50 KST
- Completed At: 2026-05-04 18:09:37 KST

## Objective

Add VS Code status bar connection state display for the Orchestrator extension.

## Acceptance Criteria

- [x] Extension creates a status bar item for Dabeehive connection state.
- [x] Refresh health check updates the status bar to connected or disconnected.
- [x] Typecheck/compile/lint, mocked status bar smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- EXT-005 tracking, log, and evidence files

### Out of Scope

- real tree data loading
- create issue/start run commands
- webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/src/extension.ts`: status bar item and refresh state updates
- `apps/vscode-extension/src/vscode.d.ts`: local VS Code API shim expansion
- `track/MASTER.md`: EXT-005 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-005.md`: session log
- `track/evidence/EXT-005/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the status bar command wired to existing refresh.
- Do not add background polling in this task.

## Dependencies / Decisions

- Depends on EXT-004.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds passive status bar UI state only; no secrets, auth storage, package dependency, deployment, or destructive changes.

## Changes Made

- Added a Dabeehive status bar item with the refresh command attached.
- Set initial status to disconnected during activation.
- Updated status to connected on successful health refresh and disconnected on refresh failure.
- Expanded the local VS Code API type shim for StatusBarItem and StatusBarAlignment.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Typecheck completed with exit code 0. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile script emitted ignored `dist/` output. |
| mocked status bar refresh smoke | Passed | Initial disconnected, refresh success connected, refresh failure disconnected. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for status bar connected/disconnected labels | Passed | Status bar API and connected/disconnected labels found. |

## Evidence

- `track/evidence/EXT-005/validation.txt`

## Follow-up Tasks

- EXT-006
