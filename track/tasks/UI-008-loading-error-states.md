# UI-008 — Basic Loading/Error States

## Status

- Status: verified
- Priority: P2
- Area: UI
- Created At: 2026-05-06 15:27:46 KST
- Started At: 2026-05-06 15:27:46 KST
- Completed At: 2026-05-06 15:30:14 KST

## Objective

Add a basic App Router loading state and verify the existing error/not-found surfaces remain available for the web UI.

## Acceptance Criteria

- [x] A global `loading.js` state exists for dynamic route transitions.
- [x] Loading UI follows the existing operational style and does not add dependencies.
- [x] Existing error and not-found states are preserved.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/loading.js`
- Small CSS additions in `apps/server/app/globals.css`
- Tracking files and validation evidence for `UI-008`

### Out of Scope

- Per-route skeletons for every page.
- Client polling/loading state frameworks.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.

## Expected Files

- `apps/server/app/loading.js`: global loading state.
- `apps/server/app/globals.css`: loading state styling.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-008/validation.txt`: validation evidence.

## Implementation Notes

- Reuse `state-page`, `state-panel`, and existing status indicator conventions.
- Preserve `apps/server/app/error.js` and `apps/server/app/not-found.js`.

## Dependencies / Decisions

- Depends on `SRV-007` and `UI-001`.
- No package dependency additions.

## Risk / Approval

- Risk Score: 3
- Approval Required: no
- Reason: Additive loading UI and CSS only.

## Changes Made

- Added `apps/server/app/loading.js` using the existing `state-page` and `state-panel` layout.
- Added a small animated loading meter in `apps/server/app/globals.css`.
- Confirmed existing `error.js` and `not-found.js` state pages remain present.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Loading orchestrator\|loading-meter\|@keyframes loading-meter\|Something went wrong\|Page not found\|state-page\|state-panel" apps/server/app/loading.js apps/server/app/error.js apps/server/app/not-found.js apps/server/app/globals.css` | Passed | Source check confirmed loading state, loading CSS, existing error state, and not-found state. |

## Evidence

- `track/evidence/UI-008/validation.txt`

## Follow-up Tasks

- SEC-004
