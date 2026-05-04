# SEC-001 — API Token Hash Utility

## Status

- Status: verified
- Priority: P0
- Area: Security
- Created At: 2026-05-04 19:48:22 KST
- Started At: 2026-05-04 19:48:22 KST
- Completed At: 2026-05-04 19:51:28 KST

## Objective

Add a server-side utility for hashing and verifying API tokens so future REST/MCP auth tasks can store and compare token hashes instead of plaintext tokens.

## Acceptance Criteria

- [x] `hashApiToken` returns a stored hash payload that does not include the plaintext token.
- [x] `verifyApiToken` accepts the original token and rejects different or malformed tokens.
- [x] Verification uses a constant-time comparison for equal-length derived keys.
- [x] Security risk is recorded in `track/RISKS.md`.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/src/lib/security/api-token.ts`
- `track/RISKS.md`
- SEC-001 tracking, log, and evidence files.

### Out of Scope

- REST/MCP Bearer auth middleware.
- DB schema or migration changes.
- Token generation UI or seed data.
- Secret rotation, deployment, external integrations, or automatic merge.

## Expected Files

- `apps/server/src/lib/security/api-token.ts`: token hash/verify implementation.
- `track/RISKS.md`: security risk entry.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-04-SEC-001.md`: session log.
- `track/evidence/SEC-001/validation.txt`: validation evidence.

## Implementation Notes

- Use Node `crypto.scrypt` with random salt and `timingSafeEqual`.
- Encode algorithm, parameters, salt, and derived key in the stored payload.
- No package dependency is required.

## Dependencies / Decisions

- Builds on DB-002 token hash storage requirement.
- No dependency additions.

## Risk / Approval

- Risk Score: 35
- Approval Required: no
- Reason: Adds a standalone token hash utility only; does not apply auth/session/permission enforcement or change schema. Residual auth risk is recorded in `track/RISKS.md`.

## Changes Made

- Added `hashApiToken`, `verifyApiToken`, and `parseApiTokenHash` using Node `crypto.scrypt` and `timingSafeEqual`.
- Stored versioned hash payloads with scrypt parameters, random salt, and derived key only.
- Recorded residual auth risk in `track/RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Initial run failed on scrypt promisify typing and undefined guard; fixed and final server typecheck passed. |
| `pnpm --filter @dabeehive/server exec node -e "<api token hash helper smoke>"` | Passed | Verified hash payload shape, no plaintext leak, correct token accepted, wrong/malformed tokens rejected. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `rg "hashApiToken|verifyApiToken|scrypt|timingSafeEqual|SEC-001" apps/server/src/lib/security track/tasks/SEC-001-api-token-hash.md track/RISKS.md` | Passed | Helper implementation, task record, and risk entry found. |

## Evidence

- `track/evidence/SEC-001/validation.txt`

## Follow-up Tasks

- SEC-002
