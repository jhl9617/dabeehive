# SEC-006 — Env Validation

## Status

- Status: verified
- Priority: P1
- Area: Security
- Created At: 2026-05-06 15:45:53 KST
- Started At: 2026-05-06 15:45:53 KST
- Completed At: 2026-05-06 15:50:11 KST

## Objective

Add dependency-free server startup validation for required PoC server environment variables so missing or placeholder `DATABASE_URL` configuration fails with a clear, non-secret-revealing error before DB-backed server flows run.

## Acceptance Criteria

- [x] Server startup invokes env validation.
- [x] `DATABASE_URL` is required, must not be a placeholder, and must use a PostgreSQL URL scheme.
- [x] Validation errors include env names and guidance but do not echo secret values.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Server env validation helper.
- Next.js server startup hook.
- Local smoke script for valid and invalid env cases.
- SEC-006 tracking, log, and evidence files.

### Out of Scope

- DB schema/migration changes or migration execution.
- Auth/session/permission behavior.
- External integrations, production secret provisioning, deployment behavior, or secret rotation.
- Package dependency additions.

## Expected Files

- `apps/server/src/lib/security/env-validation.ts`: env schema and formatter.
- `apps/server/instrumentation.ts`: server startup validation hook.
- `apps/server/tsconfig.json`: include startup hook in server typecheck.
- `scripts/server-env-validation-smoke.mjs`: local validation smoke.
- `package.json`: root smoke command.
- `track/MASTER.md`: SEC-006 status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/SEC-006/validation.txt`: validation evidence.

## Implementation Notes

- Reuse existing server `zod` dependency.
- Avoid logging or returning env values in errors.
- Keep `.env.example` placeholder-only; do not create `.env` or real secrets.

## Dependencies / Decisions

- Depends on existing server `zod` dependency.
- No package dependencies.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds startup validation and a smoke script only; no secret values, schema changes, auth behavior, deployment, or dependency changes.

## Changes Made

- Added `validateServerEnv` with a Zod schema for required `DATABASE_URL`.
- Added a Next.js `instrumentation.ts` startup hook that runs validation for non-edge server runtime.
- Included the startup hook in server TypeScript checks.
- Added root `pnpm test:server-env` smoke coverage for valid, missing, placeholder, and non-PostgreSQL URL cases.
- Recorded startup validation behavior in `RISKS.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server TypeScript no-emit check passed. |
| `pnpm test:server-env` | Passed | Smoke checked valid and invalid env cases with redacted errors. |
| `pnpm lint` | Passed | Basic lint passed. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build passed without requiring `DATABASE_URL` at build time. |
| `rg -n "validateServerEnv\|REQUIRED_SERVER_ENV_KEYS\|DATABASE_URL\|instrumentation\|test:server-env\|server-env-validation" apps/server/instrumentation.ts apps/server/src/lib/security/env-validation.ts apps/server/tsconfig.json package.json scripts/server-env-validation-smoke.mjs` | Passed | Source check confirmed startup hook, schema, command, and smoke coverage. |
| `pnpm track:status -- --task SEC-006 --status verified --dry-run` | Passed | MASTER summary shows verified=119, in_progress=0, not_started=4. |

## Evidence

- `track/evidence/SEC-006/validation.txt`

## Follow-up Tasks

- SEC-007
