# EXT-012 — Approval Panel Webview

## Status

- Status: verified
- Priority: P1
- Area: Extension
- Created At: 2026-05-06 13:48 KST
- Started At: 2026-05-06 13:48 KST
- Completed At: 2026-05-06 14:02 KST

## Objective

Add a VS Code Approval Panel webview that lets a developer inspect a selected approval and submit approve/reject/request changes actions through the Orchestrator.

## Acceptance Criteria

- [x] A VS Code command can open an approval panel for a selected approval.
- [x] The panel displays approval detail, risk, changed files, diff summary, and required action when available.
- [x] Approve, reject, and request changes actions call the existing Orchestrator REST API through the Extension client and SecretStorage token path.
- [x] The implementation does not add Jira, Slack, custom AI editing, shell loops, automatic merge, or deployment behavior.

## Scope

### In Scope

- Extension command registration and approval tree integration.
- Read-only approval detail rendering plus approve/reject/request changes buttons.
- REST client support for approval detail/response if needed.
- EXT-012 tracking, log, and evidence files.

### Out of Scope

- Workflow auto-resume UI beyond submitting an approval response.
- Custom AI patch/edit engine or shell tool loop.
- Jira, Slack, GitHub PR, deployment, automatic merge, or external integration behavior.
- Server approval API/schema changes.

## Expected Files

- `apps/vscode-extension/package.json`: command contribution if needed
- `apps/vscode-extension/src/extension.ts`: command, webview, approval actions
- `apps/vscode-extension/src/orchestratorClient.ts`: approval detail/respond client methods if needed
- `apps/vscode-extension/src/vscode.d.ts`: type shim update if needed
- `track/MASTER.md`: EXT-012 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-012.md`: session log
- `track/evidence/EXT-012/validation.txt`: validation evidence

## Implementation Notes

- Reuse existing extension webview/client patterns from EXT-011.
- Use VS Code webview message passing only for approval actions.
- Keep submitted reviewer identity minimal and PoC-scoped.

## Dependencies / Decisions

- Depends on EXT-008, API-011, and API-012.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds Extension UI that calls existing approval response API; no server schema/auth/deployment/dependency changes.

## Changes Made

- Added `dabeehive.openApprovalPanel` command contribution, activation event, and Approvals tree context menu action.
- Wired approval tree items to open the panel directly.
- Added `OrchestratorClient.getApproval()` and `respondApproval()` for existing approval detail/respond API routes.
- Added an approval webview panel with detail rendering, changed file display, approve/reject/request changes buttons, nonce-based script CSP, and message handling.
- Extended the local VS Code type shim for webview message handling.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | PASS | No-emit typecheck passed. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | PASS | Extension compile passed. |
| `pnpm lint` | PASS | Basic repository lint passed. |
| `rg -n 'openApprovalPanel\|respondApproval\|getApproval\(\|onDidReceiveMessage\|approvalResponse\|enableScripts: true\|data-approval-action\|request_changes\|dabeehive.openApprovalPanel' apps/vscode-extension/package.json apps/vscode-extension/src/extension.ts apps/vscode-extension/src/orchestratorClient.ts apps/vscode-extension/src/vscode.d.ts` | PASS | Confirmed command, client, message, and action implementation markers. |

## Evidence

- `track/evidence/EXT-012/validation.txt`

## Follow-up Tasks

- EXT-013
