# EXT-010 — Start Run Command

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:30:26 KST
- Started At: 2026-05-04 18:30:26 KST
- Completed At: 2026-05-04 18:32:38 KST

## Objective

Implement a VS Code command that starts an Orchestrator run from a selected issue.

## Acceptance Criteria

- [x] Extension manifest contributes a start run command for issue tree items.
- [x] Command creates a queued run using the selected issue, with prompt fallback for command palette usage.
- [x] Typecheck/compile/lint, mocked selected issue command smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- EXT-010 tracking, log, and evidence files

### Out of Scope

- SDK runner invocation
- run console webview
- run tree auto-refresh eventing
- approval panel webview
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: start run command contribution and issue item menu
- `apps/vscode-extension/src/extension.ts`: selected issue command handler
- `apps/vscode-extension/src/orchestratorClient.ts`: run creation method
- `track/MASTER.md`: EXT-010 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-010.md`: session log
- `track/evidence/EXT-010/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use existing REST API routes only.
- Create only the Orchestrator run record; do not call an SDK adapter.
- Use `planner` as the PoC default agent role unless the user invokes the fallback prompt.

## Dependencies / Decisions

- Depends on EXT-006, EXT-004, and API-008.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: no
- Reason: Adds an extension command that creates PoC run records through an existing API; no secrets, schema, package dependency, deployment, SDK execution, or destructive changes.

## Changes Made

- Added `dabeehive.startRun` activation, command contribution, and issue tree item context menu.
- Added `CreateRunInput` and `createRun()` to the Orchestrator REST client.
- Registered a start run command that uses a selected issue node or prompts for project/issue IDs, then creates a queued planner run.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension typecheck completed with no output. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile completed. |
| mocked selected issue start run command smoke | Passed | Mocked VS Code API and fetch verified command registration, selected issue input, Bearer header, JSON POST body, default planner role, and success message. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for start run command/client paths | Passed | Found expected command contribution, context menu, command handler, client input type, default role, and createRun method. |

## Evidence

- `track/evidence/EXT-010/validation.txt`

## Follow-up Tasks

- SDK-001 or EXT-011 depending on next P0 selection
