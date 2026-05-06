# SRV-006 — Server Logger

## Status

- Status: verified
- Priority: P1
- Area: Server
- Created At: 2026-05-06 10:55:57 KST
- Started At: 2026-05-06 10:55:57 KST
- Completed At: 2026-05-06 10:58:01 KST

## Objective

Add a small server logger wrapper that can be reused for API request/error logs and run event logs while redacting secrets from structured metadata.

## Acceptance Criteria

- [x] A server logger wrapper exists.
- [x] The wrapper supports API and run event log helpers with secret redaction.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/src/lib/logger.ts`.
- Dependency-free JSON console sink.
- Secret redaction using the existing server redaction helper.
- Tracking, log, and evidence updates.

### Out of Scope

- Route-wide adoption across all API handlers.
- DB persistence of logs, external logging sinks, queues, or deployment logging.
- Jira, Slack, or full external integrations.
- New package dependencies.

## Expected Files

- `apps/server/src/lib/logger.ts`: logger wrapper.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/SRV-006-server-logger.md`: task details and validation results.
- `track/logs/2026-05-06-SRV-006.md`: session log.
- `track/evidence/SRV-006/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- Reuse `redactSecrets` from `apps/server/src/lib/security/secret-redaction.ts`.
- Keep the default sink as console JSON output for local/server runtime.
- Expose a default `serverLogger` plus a factory for tests or future injected sinks.

## Dependencies / Decisions

- No new package dependency.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: small dependency-free server helper; no schema, auth, secret, deployment, or external integration changes.

## Changes Made

- Added `apps/server/src/lib/logger.ts` with a dependency-free JSON console logger.
- Exposed `createServerLogger` and default `serverLogger`.
- Added `logApiRequest`, `logApiError`, `logRunEvent`, child logger, min-level filtering, injectable clock/sink, error normalization, and secret redaction via `redactSecrets`.
- Did not wire the logger through every route or add external log sinks.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Exited 0 with no compiler output. |
| `rg "createServerLogger" apps/server/src/lib/logger.ts` | Passed | Factory and default logger are present. |
| `rg "logRunEvent" apps/server/src/lib/logger.ts` | Passed | Run event helper is present. |
| `rg "redactSecrets" apps/server/src/lib/logger.ts` | Passed | Logger redacts structured entries before writing. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `node scripts/track-status.mjs --task SRV-006 --status verified` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |

## Evidence

- `track/evidence/SRV-006/validation.txt`

## Follow-up Tasks

- SRV-007
