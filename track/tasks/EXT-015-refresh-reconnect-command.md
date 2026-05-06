# EXT-015 — Refresh/reconnect command

## Status

- Status: verified
- Priority: P1
- Area: Extension
- Created At: 2026-05-06 13:37 KST
- Started At: 2026-05-06 13:37 KST
- Completed At: 2026-05-06 13:52 KST

## Objective

Make manual refresh update the Extension trees and add a reconnect command that rechecks the Orchestrator connection without adding background polling.

## Acceptance Criteria

- [x] The existing refresh command can reload Issues, Runs, and Approvals tree views.
- [x] A reconnect command is contributed and can re-run the connection check.
- [x] Refresh/reconnect use the existing Orchestrator REST client and SecretStorage token path.
- [x] The implementation does not add background polling, Slack, external integrations, custom AI editing, shell loops, automatic merge, or deployment behavior.

## Scope

### In Scope

- Tree data provider refresh events.
- Manual refresh command wiring for views and connection status.
- Reconnect command contribution and activation event.
- EXT-015 tracking, log, and evidence files.

### Out of Scope

- Background polling loop or SSE subscription.
- Server API/schema changes.
- Slack/external notification delivery.
- Custom AI patch/edit engine or shell tool loop.

## Expected Files

- `apps/vscode-extension/package.json`: reconnect command contribution
- `apps/vscode-extension/src/extension.ts`: tree refresh events and reconnect wiring
- `apps/vscode-extension/src/vscode.d.ts`: EventEmitter type shim if needed
- `track/MASTER.md`: EXT-015 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-015.md`: session log
- `track/evidence/EXT-015/validation.txt`: validation evidence

## Implementation Notes

- Reuse existing refresh command name for manual reload.
- Keep reconnect explicit and side-effect-light: reset connection status before rechecking and refresh trees after success/failure.

## Dependencies / Decisions

- Depends on EXT-005, EXT-006, EXT-007, EXT-008, and EXT-014.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Adds Extension command wiring and in-memory refresh events only; no server schema/auth/deployment/dependency changes.

## Changes Made

- Added `onDidChangeTreeData` refresh emitters to Projects/Issues, Runs, and Approvals tree providers.
- Updated the existing refresh command to refresh tree views after connection health checks and failures.
- Added `Dabeehive: Reconnect` command contribution and activation event.
- Added reconnect handling that resets in-memory notification de-duplication state, marks the status disconnected, refreshes views, and re-runs the existing health check path.
- Extended the local VS Code type shim with `Event` and `EventEmitter` declarations.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension TypeScript no-emit check passed. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Passed | Extension compile script passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "RECONNECT_COMMAND\|dabeehive\\.reconnect\|EventEmitter\|onDidChangeTreeData\|refreshViews\|reconnectOrchestrator\|resetNotificationState\|refresh\\(\\): void" apps/vscode-extension/package.json apps/vscode-extension/src/extension.ts apps/vscode-extension/src/vscode.d.ts` | Passed | Source check confirmed command contribution, tree refresh events, and reconnect wiring. |

## Evidence

- `track/evidence/EXT-015/validation.txt`

## Follow-up Tasks

- EXT-016
