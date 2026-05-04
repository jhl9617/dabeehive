# SRV-001 — Next.js App Router Init

## Status

- Status: verified
- Priority: P0
- Area: Server
- Created At: 2026-05-04 14:47:54 KST
- Started At: 2026-05-04 14:47:54 KST
- Completed At: 2026-05-04 14:51:55 KST

## Objective

Initialize a minimal Next.js 15 App Router server workspace that can run in development mode.

## Acceptance Criteria

- [x] `apps/server` has Next.js App Router files.
- [x] `apps/server` has executable `dev`, `build`, and `start` scripts.
- [x] Required Next.js runtime dependencies are installed for the server workspace.
- [x] Server app runs in dev mode and returns an HTTP response.
- [x] Tracking files record the start and completion of this task.

## Scope

### In Scope

- Add Next.js runtime dependencies to `apps/server`.
- Add minimal App Router `app/layout.js` and `app/page.js`.
- Add `apps/server/next.config.mjs`.
- Add root `.gitignore` for generated outputs needed by Next dev.
- Validate with `pnpm --filter @dabeehive/server dev`.

### Out of Scope

- REST API routes beyond default page.
- Database, auth, MCP, Jira, Slack, deployment, or external integrations.
- Complex web dashboard or UI implementation.
- Custom AI code editing engine.

## Expected Files

- `.gitignore`: generated output exclusions.
- `apps/server/package.json`: Next scripts and runtime dependencies.
- `apps/server/next.config.mjs`: minimal Next config.
- `apps/server/app/layout.js`: App Router root layout.
- `apps/server/app/page.js`: minimal running page.
- `pnpm-lock.yaml`: dependency lockfile update.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/SRV-001-next-app-init.md`: task details and validation result.
- `track/logs/2026-05-04-SRV-001.md`: session log.
- `track/evidence/SRV-001/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion entry.

## Implementation Notes

- Keep app minimal; `SRV-002` owns fuller layout/page composition.
- Use JavaScript App Router files in this task to avoid generating `next-env.d.ts` before TypeScript dependency strategy is finalized.
- `docs/codex-implementation-rules.md` is deleted in the working tree at task start but is unrelated to `SRV-001` and will not be touched.

## Dependencies / Decisions

- Depends on foundation tasks `FND-001` through `FND-005`.
- Decision: install `next@15`, `react@19`, and `react-dom@19` in `apps/server`.
- Decision: keep the TypeScript dev dependencies auto-installed by Next dev because the repository already has tsconfig files.
- No Jira, Slack, deployment, auth, DB, MCP, or external integration dependencies are added.

## Risk / Approval

- Risk Score: 35
- Approval Required: yes
- Reason: Package dependency addition is required to initialize and run a Next.js server app.
- Changed files: `apps/server/package.json`, `pnpm-lock.yaml`, app bootstrap files, generated-output ignore rules, tracking files.
- Diff summary: Adds Next runtime dependencies, Next-required TypeScript dev dependencies, and a minimal App Router page.
- Required reviewer action: Approve dependency installation and lockfile update for `next`, `react`, `react-dom`, `typescript`, `@types/react`, and `@types/node`.

## Changes Made

- Added `.gitignore` entries for generated outputs and local env files.
- Added Next.js scripts and dependencies to `apps/server/package.json`.
- Kept Next auto-installed TypeScript dev dependencies required by the existing tsconfig setup.
- Added minimal App Router files under `apps/server/app`.
- Added `apps/server/next.config.mjs`.
- Adjusted `apps/server/tsconfig.json` by removing deprecated `baseUrl` after build validation failed under TypeScript 6.
- Updated `pnpm-lock.yaml`.
- Created this task detail file and session log.
- Recorded validation evidence in `track/evidence/SRV-001/validation.txt`.
- Updated `track/MASTER.md`, `track/CURRENT.md`, and `track/CHANGELOG.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server add next@15 react@19 react-dom@19` | Passed | Runtime dependencies installed after approval; Next dev later auto-installed TypeScript support packages. |
| `pnpm --filter @dabeehive/server dev --hostname 127.0.0.1 --port 13001` | Passed | First sandbox run failed with `EPERM`; escalated rerun started Next dev server. |
| `curl -I http://127.0.0.1:13001` | Passed | Returned HTTP 200. |
| `pnpm --filter @dabeehive/server build` | Passed | First run failed on TS 6 `baseUrl` deprecation; second run passed after config fix. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg "SRV-001 \| in_progress\|Task ID: SRV-001\|Status: in_progress" track/MASTER.md track/CURRENT.md track/tasks/SRV-001-next-app-init.md` | Passed | Pre-implementation tracking state was present before validation. |

## Evidence

- `track/evidence/SRV-001/validation.txt`

## Follow-up Tasks

- `SRV-002`: 기본 layout/page 구성.
