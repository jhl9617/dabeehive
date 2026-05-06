# EXT-011 — Run Console Webview

## Status

- Status: verified
- Priority: P1
- Area: Extension
- Created At: 2026-05-06 13:27 KST
- Started At: 2026-05-06 13:27 KST
- Completed At: 2026-05-06 13:43 KST

## Objective

Add a VS Code Run Console webview that lets a developer open a selected run and inspect its run metadata and recorded run events/logs from the Orchestrator.

## Acceptance Criteria

- [x] A VS Code command can open a run console for a selected run.
- [x] The run console displays run identity, status, issue/project metadata when available, and event/log rows.
- [x] The console fetches data through the existing Orchestrator REST client and SecretStorage token path.
- [x] The implementation does not add a custom AI code editing engine, shell loop, Jira, Slack, or full external integration.

## Scope

### In Scope

- Extension command registration and run tree integration for opening a console.
- A minimal HTML webview for run details and event/log display.
- REST client support for run detail retrieval if needed.
- EXT-011 tracking, log, and evidence files.

### Out of Scope

- Starting/canceling SDK execution from the console.
- Custom AI patch/edit engine or shell tool loop.
- Jira, Slack, GitHub PR, deployment, or external integration behavior.
- Complex dashboard UI beyond the focused console webview.

## Expected Files

- `apps/vscode-extension/package.json`: command contribution if needed
- `apps/vscode-extension/src/extension.ts`: command, tree action, webview
- `apps/vscode-extension/src/orchestratorClient.ts`: run detail client method if needed
- `apps/vscode-extension/src/vscode.d.ts`: type shim update if needed
- `track/MASTER.md`: EXT-011 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-011.md`: session log
- `track/evidence/EXT-011/validation.txt`: validation evidence

## Implementation Notes

- Reuse existing extension patterns and REST client instead of introducing dependencies.
- Keep the console read-only.
- Webview content must escape server-provided strings before rendering.

## Dependencies / Decisions

- Depends on EXT-004, EXT-007, API-009, and API-010.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds read-only Extension UI and client calls only; no dependency, schema, auth behavior, deployment, or destructive changes.

## Changes Made

- Added `dabeehive.openRunConsole` command contribution, activation event, and Runs tree context menu action.
- Wired Run tree items to open the console directly.
- Added `OrchestratorClient.getRun()` and run detail/event types for `GET /api/runs/[id]`.
- Added a read-only webview panel that renders run metadata, output/error text, and events with HTML escaping and scripts disabled.
- Extended the local VS Code type shim for webview panel and command support.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/vscode-extension exec tsc --noEmit` | FAIL | Extension package has no local `tsc`; existing compile path uses server workspace TypeScript. |
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | PASS | No-emit typecheck passed through the existing workspace TypeScript executable. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | PASS | Extension compile passed. |
| `pnpm lint` | PASS | Basic repository lint passed. |
| `rg -n 'openRunConsole\|createWebviewPanel\|getRun\(\|enableScripts: false\|escapeHtml\|dabeehive.openRunConsole' apps/vscode-extension/package.json apps/vscode-extension/src/extension.ts apps/vscode-extension/src/orchestratorClient.ts apps/vscode-extension/src/vscode.d.ts` | PASS | Confirmed command, webview, client, and escaping implementation markers. |

## Evidence

- `track/evidence/EXT-011/validation.txt`

## Follow-up Tasks

- EXT-012
