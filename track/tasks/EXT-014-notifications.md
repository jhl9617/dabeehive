# EXT-014 — Extension notifications

## Status

- Status: verified
- Priority: P1
- Area: Extension
- Created At: 2026-05-06 14:24 KST
- Started At: 2026-05-06 14:24 KST
- Completed At: 2026-05-06 14:32 KST

## Objective

Add VS Code notifications for newly observed completed/failed/cancelled runs and pending approvals during Extension refresh.

## Acceptance Criteria

- [x] Refresh can notify when a run reaches a terminal state.
- [x] Refresh can notify when a pending approval is observed.
- [x] Notifications use existing Orchestrator REST client and SecretStorage token path.
- [x] The implementation does not add Slack, external push services, background daemons, custom AI editing, shell loops, automatic merge, or deployment behavior.

## Scope

### In Scope

- Extension-side notification state for de-duplicating observed runs/approvals.
- Refresh-time checks using existing list runs and list pending approvals APIs.
- EXT-014 tracking, log, and evidence files.

### Out of Scope

- Slack, web push, OS-level background agent, or server-side notification delivery.
- SSE subscription/polling loop.
- Server API/schema changes.
- Custom AI patch/edit engine or shell tool loop.

## Expected Files

- `apps/vscode-extension/src/extension.ts`: notification state and refresh checks
- `track/MASTER.md`: EXT-014 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-014.md`: session log
- `track/evidence/EXT-014/validation.txt`: validation evidence

## Implementation Notes

- Keep notifications scoped to explicit refresh to avoid adding a background polling loop.
- De-duplicate by run ID plus terminal status and by approval ID.
- Notify only with non-sensitive IDs/titles already shown in the Extension trees.

## Dependencies / Decisions

- Depends on EXT-007, EXT-008, and EXT-015 follow-up for richer refresh/reconnect behavior.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Adds Extension-only notifications using existing read APIs; no server schema/auth/deployment/dependency changes.

## Changes Made

- Added `NotificationState` with de-duplication sets for terminal runs and pending approvals.
- Added refresh-time notification checks using existing `listRuns()` and `listPendingApprovals()` client methods.
- Added terminal run notifications for `succeeded`, `failed`, and `cancelled`.
- Added pending approval request notifications.
- Isolated notification check failures so health refresh still controls connected/disconnected status.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | PASS | No-emit typecheck passed. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | PASS | Extension compile passed. |
| `pnpm lint` | PASS | Basic repository lint passed. |
| `rg -n 'NotificationState\|createNotificationState\|notifyObservedChanges\|RUN_TERMINAL_STATUSES\|pendingApprovalIds\|terminalRunKeys\|notification check failed\|approval requested\|Dabeehive run' apps/vscode-extension/src/extension.ts` | PASS | Confirmed notification state, checks, and failure isolation markers. |

## Evidence

- `track/evidence/EXT-014/validation.txt`

## Follow-up Tasks

- EXT-015
