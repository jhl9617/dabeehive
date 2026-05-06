# SEC-007 — Basic Abuse Guard

## Status

- Status: verified
- Priority: P2
- Area: Security
- Created At: 2026-05-06 15:53:59 KST
- Started At: 2026-05-06 15:53:59 KST
- Completed At: 2026-05-06 15:58:05 KST

## Objective

Add a basic PoC abuse guard for API token authentication calls so repeated token verification requests are bounded before they can repeatedly scan active token hashes.

## Acceptance Criteria

- [x] API token calls have a bounded in-memory request guard with retry metadata.
- [x] REST API token middleware returns a standard 429 API error when the guard is exceeded.
- [x] MCP bearer verification uses the same guard before DB-backed token verification.
- [x] Guard keys do not persist raw Bearer token values.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Dependency-free in-memory fixed-window guard.
- REST API token middleware integration.
- MCP bearer verification integration.
- Local smoke script covering allow/limit/key-redaction behavior.
- SEC-007 tracking, log, risk, and evidence files.

### Out of Scope

- Redis/distributed rate limiting.
- Account-specific or paid-plan quotas.
- DB schema changes, auth/session model changes, or token scope model changes.
- External integrations, deployment, package dependencies, or production secret access.

## Expected Files

- `apps/server/src/lib/security/basic-abuse-guard.ts`: fixed-window guard helper.
- `apps/server/src/lib/security/api-token-auth.ts`: REST middleware 429 integration.
- `apps/server/app/api/[transport]/route.ts`: MCP verification guard integration.
- `scripts/api-token-abuse-guard-smoke.mjs`: local smoke coverage.
- `package.json`: root smoke command.
- `track/RISKS.md`: residual rate limit caveat.
- `track/MASTER.md`: SEC-007 status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/SEC-007/validation.txt`: validation evidence.

## Implementation Notes

- Keep guard state process-local for PoC only.
- Hash token material before using it in a guard key.
- Do not log or persist raw Bearer token values.

## Dependencies / Decisions

- No package dependencies.
- Uses Node built-in crypto for stable token key hashing.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds protective middleware/helper behavior only; no schema, auth model, dependency, deployment, or destructive changes.

## Changes Made

- Added process-local fixed-window API token abuse guard with retry/rate metadata.
- Added guard key creation using client address and a SHA-256 token hash prefix, without storing raw Bearer token values.
- Wired REST `withApiTokenAuth` to return standard API 429 `RATE_LIMITED` responses with retry/rate headers.
- Wired MCP bearer verification to use the same guard before DB-backed token verification.
- Added root `pnpm test:abuse-guard` smoke coverage.
- Recorded residual process-local rate limit caveat in `RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server TypeScript no-emit check passed. |
| `pnpm test:abuse-guard` | Passed | Smoke confirmed allow/limit/reset/retry and raw token redaction. |
| `pnpm lint` | Passed | Basic lint passed. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build passed. |
| `rg -n "checkBasicAbuseGuard\|buildApiTokenAbuseGuardKey\|createApiTokenRateLimitedResponse\|RATE_LIMITED\|Retry-After\|test:abuse-guard\|api-token-abuse-guard" apps/server/src/lib/security/basic-abuse-guard.ts apps/server/src/lib/security/api-token-auth.ts 'apps/server/app/api/[transport]/route.ts' package.json scripts/api-token-abuse-guard-smoke.mjs` | Passed | Source check confirmed guard, REST/MCP wiring, command, and smoke coverage. |
| `pnpm track:status -- --task SEC-007 --status verified --dry-run` | Passed | MASTER summary shows verified=120, in_progress=0, not_started=3. |

## Evidence

- `track/evidence/SEC-007/validation.txt`

## Follow-up Tasks

- TST-008
