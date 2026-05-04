# EXT-009 — Create Issue Command

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:26:23 KST
- Started At: 2026-05-04 18:26:23 KST
- Completed At: 2026-05-04 18:28:31 KST

## Objective

Implement a VS Code command that creates an issue through the Orchestrator REST client.

## Acceptance Criteria

- [x] Extension manifest contributes a create issue command.
- [x] Command prompts for required issue fields and calls Orchestrator issue creation.
- [x] Typecheck/compile/lint, mocked create issue command smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- EXT-009 tracking, log, and evidence files

### Out of Scope

- issue tree auto-refresh eventing
- start run command
- run console webview
- approval panel webview
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: create issue command contribution
- `apps/vscode-extension/src/extension.ts`: create issue command handler and prompts
- `apps/vscode-extension/src/orchestratorClient.ts`: POST request support and issue creation method
- `track/MASTER.md`: EXT-009 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-009.md`: session log
- `track/evidence/EXT-009/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use existing REST API routes only.
- Keep prompts simple and avoid local persistence of issue data.
- Do not implement a custom AI code editing engine or SDK runner behavior.

## Dependencies / Decisions

- Depends on EXT-004 and API-004.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: no
- Reason: Adds an extension command that creates PoC issue records through an existing API; no secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `dabeehive.createIssue` activation and command contribution to the extension manifest.
- Added `CreateIssueInput`, `createIssue()`, and POST request body support to the Orchestrator REST client.
- Registered a create issue command that prompts for project ID, title, and optional body, then calls `POST /api/issues`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension typecheck completed with no output. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile completed. |
| mocked create issue command smoke | Passed | Mocked VS Code API and fetch verified command registration, input trimming, Bearer header, JSON POST body, and success message. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for create issue command/client paths | Passed | Found expected command contribution, command handler, client input type, POST method, and JSON content type. |

## Evidence

- `track/evidence/EXT-009/validation.txt`

## Follow-up Tasks

- EXT-010
