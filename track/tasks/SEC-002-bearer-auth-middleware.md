# SEC-002 — Bearer Auth Middleware

## Status

- Status: verified
- Priority: P0
- Area: Security
- Created At: 2026-05-04 19:53:51 KST
- Started At: 2026-05-04 19:53:51 KST
- Completed At: 2026-05-04 19:58:11 KST

## Objective

Add reusable Bearer token verification for REST handlers and wire MCP auth to DB-backed API token hash verification.

## Acceptance Criteria

- [x] Bearer tokens are parsed from `Authorization: Bearer <token>` headers.
- [x] `authenticateBearerToken` verifies tokens against stored API token hashes and rejects expired/missing/malformed tokens.
- [x] `withBearerAuth` can wrap REST handlers and return a standard 401 API error for invalid tokens.
- [x] MCP auth guard uses DB-backed token hash verification instead of accepting any non-empty token.
- [x] Approval/risk notes, validation, and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/src/lib/security/bearer-auth.ts`
- `apps/server/app/api/[transport]/route.ts`
- `track/RISKS.md`
- SEC-002 tracking, log, and evidence files.

### Out of Scope

- Full route-by-route REST enforcement rollout.
- Token generation, scope model, role/permission checks, or token rotation.
- DB schema or migration changes.
- External integrations, automatic merge, or deployment.

## Expected Files

- `apps/server/src/lib/security/bearer-auth.ts`: Bearer auth helper and REST wrapper.
- `apps/server/app/api/[transport]/route.ts`: MCP auth verifier wiring.
- `track/RISKS.md`: auth risk entry.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-SEC-002.md`: session log.
- `track/evidence/SEC-002/validation.txt`: validation evidence.

## Implementation Notes

- Reuse SEC-001 `verifyApiToken`.
- Keep token lookup PoC-scoped and document linear scan risk because the current token hash schema has no lookup prefix.
- No package dependency is required.

## Dependencies / Decisions

- Depends on SEC-001 API token hash utility.
- No dependency additions.

## Risk / Approval

- Risk Score: 80
- Approval Required: yes
- Reason: Auth middleware and MCP auth behavior change.
- Changed files:
  - `apps/server/src/lib/security/bearer-auth.ts`
  - `apps/server/app/api/[transport]/route.ts`
- Diff summary: Add DB-backed Bearer token verification against stored API token hashes, provide a REST route wrapper, and wire MCP auth to the shared verifier.
- Required reviewer action: Review auth behavior, token lookup tradeoff, and confirm route-wide REST enforcement remains deferred.

## Changes Made

- Added `parseBearerToken`, `authenticateBearerToken`, `authenticateRequestBearerToken`, `withBearerAuth`, and standard unauthorized response helpers.
- Wired MCP `withMcpAuth` verification to DB-backed API token hash verification.
- Recorded approval and residual risk notes for auth behavior and linear token hash scan tradeoff.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server typecheck completed with no output. |
| `pnpm --filter @dabeehive/server exec node -e "<bearer auth helper smoke>"` | Passed | Verified valid, wrong, and missing tokens plus REST wrapper 200/401 behavior with fake Prisma. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `rg "authenticateBearerToken|withBearerAuth|verifyApiToken|verifyBearerToken|SEC-002" apps/server/src/lib/security apps/server/app/api/[transport]/route.ts track/tasks/SEC-002-bearer-auth-middleware.md track/RISKS.md` | Passed | Helper implementation, MCP wiring, task record, and risk entry found. |

## Evidence

- `track/evidence/SEC-002/validation.txt`

## Follow-up Tasks

- SEC-003
