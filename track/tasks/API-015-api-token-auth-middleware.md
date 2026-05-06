# API-015 — API token auth middleware

## Status

- Status: verified
- Priority: P1
- Area: API
- Created At: 2026-05-06 11:24:36 KST
- Started At: 2026-05-06 11:24:36 KST
- Completed At: 2026-05-06 11:32:09 KST

## Objective

Add a PoC REST API token authentication middleware layer so API route handlers can require `Authorization: Bearer <token>` using the existing DB-backed API token verifier.

## Acceptance Criteria

- [x] REST API handlers can be wrapped with a shared API token auth middleware.
- [x] Missing or invalid Bearer tokens return the standard API error shape with HTTP 401 and `WWW-Authenticate: Bearer`.
- [x] A minimal authenticated REST endpoint demonstrates the middleware without requiring Jira, Slack, or full route rollout.
- [x] Auth risk/approval notes and validation results are recorded.

## Scope

### In Scope

- A route-bound REST API token auth helper that reuses the existing Bearer verifier.
- A minimal authenticated endpoint for checking the current token context.
- API-015 tracking, log, risk, and evidence files.

### Out of Scope

- Full route-by-route REST enforcement rollout.
- NextAuth session support.
- Token generation, rotation, scopes, or role/permission checks.
- DB schema or migration changes.
- Jira, Slack, GitHub, deployment, or automatic merge.
- VS Code Extension behavior changes.

## Expected Files

- `apps/server/src/lib/security/api-token-auth.ts`: route-bound API token auth middleware helper
- `apps/server/app/api/auth/token/route.ts`: minimal authenticated token context endpoint
- `track/RISKS.md`: auth change approval/risk entry
- `track/MASTER.md`: API-015 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-API-015.md`: session log
- `track/evidence/API-015/validation.txt`: validation evidence

## Implementation Notes

- Reuse `withBearerAuth` and `authenticateBearerToken` from SEC-002.
- Bind the middleware to `getPrismaClient` so REST route handlers do not repeat Prisma auth wiring.
- Keep the endpoint read-only and return token metadata only, not the raw token or hash.
- Do not wrap all REST routes in this task because that exceeds the intended small PoC task size and would require updating smoke scripts/docs.

## Dependencies / Decisions

- Depends on SEC-001 and SEC-002.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: yes
- Reason: Adds REST auth middleware behavior and a token context endpoint.
- Changed files:
  - `apps/server/src/lib/security/api-token-auth.ts`
  - `apps/server/app/api/auth/token/route.ts`
  - `track/RISKS.md`
- Diff summary: Add shared REST API token auth wrapper bound to the Prisma client and expose a minimal authenticated route that returns sanitized token context.
- Required reviewer action: Review auth error contract, token metadata exposure, and confirm full route rollout remains a separate follow-up.

## Changes Made

- Added `withApiTokenAuth`, a REST route wrapper bound to the existing DB-backed Bearer auth verifier and Prisma client wrapper.
- Added a standard API 401 response with `WWW-Authenticate: Bearer`.
- Added `GET /api/auth/token`, a minimal authenticated endpoint that returns sanitized token context: `tokenId`, `userId`, `scopes`, and `expiresAt`.
- Recorded API-015 auth risk/approval notes in `track/RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Completed with no output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build succeeded and listed `/api/auth/token` as a dynamic route. Existing TypeScript project references warning remains. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "withApiTokenAuth\|WWW-Authenticate\|Valid Bearer token\|api/auth/token\|tokenId\|api-token-auth\|API-015" apps/server/src/lib/security/api-token-auth.ts apps/server/app/api/auth/token/route.ts track/RISKS.md` | Passed | Confirmed helper, 401 header contract, token context endpoint, and risk note. |
| `pnpm --filter @dabeehive/server exec next start --hostname 127.0.0.1 --port 18085` + `curl -i http://127.0.0.1:18085/api/auth/token` | Passed | Missing token returned HTTP 401 with standard API error and `www-authenticate: Bearer`. |
| Temporary compile and fake Prisma middleware smoke | Passed | Verified valid token returns 200 and invalid/missing tokens return 401 with `WWW-Authenticate: Bearer` using the real token hash verifier. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running, so DB-backed HTTP smoke with a real persisted token was not executable in this environment. |

## Evidence

- `track/evidence/API-015/validation.txt`

## Follow-up Tasks

- API-016
