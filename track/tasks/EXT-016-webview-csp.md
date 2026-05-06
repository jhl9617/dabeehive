# EXT-016 — Webview CSP

## Status

- Status: verified
- Priority: P2
- Area: Extension
- Created At: 2026-05-06 13:55 KST
- Started At: 2026-05-06 13:55 KST
- Completed At: 2026-05-06 13:57 KST

## Objective

Set explicit, reusable Content Security Policy handling for VS Code Extension webviews so read-only and script-enabled panels keep a minimal default CSP.

## Acceptance Criteria

- [x] Run Console and Artifact Viewer webviews render with an explicit CSP that blocks scripts by default.
- [x] Approval Panel webviews render with an explicit nonce-based script CSP for the approval action handler.
- [x] CSP generation is centralized enough to avoid divergent string literals across webview shells.
- [x] The implementation does not add external integrations, background polling, a custom AI editing engine, a shell loop, automatic merge, deployment behavior, or new package dependencies.

## Scope

### In Scope

- Existing VS Code Extension webview HTML shell helpers.
- Existing local VS Code type shim if needed for webview CSP source types.
- EXT-016 tracking, log, and evidence files.

### Out of Scope

- New webview features or layout redesign.
- Server API/schema changes.
- Jira, Slack, GitHub PR creation, deployment, or automatic merge behavior.
- Custom AI code editing/shell execution logic.

## Expected Files

- `apps/vscode-extension/src/extension.ts`: centralized webview CSP generation and shell usage
- `apps/vscode-extension/src/vscode.d.ts`: webview type shim update if required
- `track/MASTER.md`: EXT-016 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-016.md`: session log
- `track/evidence/EXT-016/validation.txt`: validation evidence

## Implementation Notes

- Keep scripts disabled for Run Console and Artifact Viewer panels.
- Keep Approval Panel scripts enabled only for the existing nonce-based approval button handler.
- Use no new dependencies.

## Dependencies / Decisions

- Depends on EXT-011, EXT-012, and EXT-013 webview functionality.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Extension webview HTML hardening only; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added centralized `renderWebviewCspMeta` and `buildWebviewCsp` helpers.
- Updated Approval Panel shell to use the shared CSP helper with the existing nonce.
- Updated Run Console and Artifact Viewer shell to use the shared CSP helper with explicit `script-src 'none'`.
- Kept existing `enableScripts` behavior: only Approval Panel enables scripts.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension TypeScript no-emit check passed. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Passed | Extension compile script passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "renderWebviewCspMeta\|buildWebviewCsp\|script-src 'none'\|script-src 'nonce\|Content-Security-Policy\|enableScripts: false\|enableScripts: true" apps/vscode-extension/src/extension.ts` | Passed | Source check confirmed CSP helper, read-only script denial, nonce script CSP, and webview script settings. |

## Evidence

- `track/evidence/EXT-016/validation.txt`

## Follow-up Tasks

- SDK-010
