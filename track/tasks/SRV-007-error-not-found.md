# SRV-007 — Error And Not Found UX

## Status

- Status: verified
- Priority: P1
- Area: Server
- Created At: 2026-05-06 11:00:03 KST
- Started At: 2026-05-06 11:00:03 KST
- Completed At: 2026-05-06 11:01:59 KST

## Objective

Add basic root App Router error and not-found pages that present clear recovery actions while preserving the existing server UI style.

## Acceptance Criteria

- [x] Root error boundary exists.
- [x] Root not-found page exists.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/error.js`.
- `apps/server/app/not-found.js`.
- Small CSS additions in `apps/server/app/globals.css`.
- Tracking, log, and evidence updates.

### Out of Scope

- API error response changes.
- Route-wide exception handling integration.
- Auth/session UX, dashboard pages, external integrations, deployment, or new dependencies.

## Expected Files

- `apps/server/app/error.js`: root error boundary UI.
- `apps/server/app/not-found.js`: root 404 UI.
- `apps/server/app/globals.css`: shared state-page styles.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/SRV-007-error-not-found.md`: task details and validation results.
- `track/logs/2026-05-06-SRV-007.md`: session log.
- `track/evidence/SRV-007/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- Match the existing `.shell` visual language and avoid adding a large dashboard surface in this task.
- Error page must be a client component so it can call `reset()`.

## Dependencies / Decisions

- No new package dependency.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: small UI fallback additions with no schema, auth, dependency, deployment, or external integration changes.

## Changes Made

- Added root App Router `error.js` client error boundary with retry and home actions.
- Added root `not-found.js` fallback with home action.
- Added shared state-page CSS in `globals.css` aligned with the existing server shell.
- Did not change API error response contracts or route handlers.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build compiled and generated pages successfully; emitted the existing project references warning. |
| `rg "Something went wrong" apps/server/app/error.js` | Passed | Error boundary text is present. |
| `rg "Page not found" apps/server/app/not-found.js` | Passed | Not-found text is present. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `node scripts/track-status.mjs --task SRV-007 --status verified` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |

## Evidence

- `track/evidence/SRV-007/validation.txt`

## Follow-up Tasks

- DB-010
