# SDK-012 — Test command detection

## Status

- Status: verified
- Priority: P1
- Area: SDK
- Created At: 2026-05-06 14:09 KST
- Started At: 2026-05-06 14:09 KST
- Completed At: 2026-05-06 14:12 KST

## Objective

Add shared, package-manager-aware validation command inference so the Agent SDK runner can suggest lint/typecheck/test/build commands from lockfile and package script metadata.

## Acceptance Criteria

- [x] Shared SDK code can detect package manager from lockfile names.
- [x] Shared SDK code can infer lint, typecheck, test, and build commands from package scripts.
- [x] Commands are formatted for pnpm, npm, yarn, and bun, including optional pnpm workspace filter support.
- [x] The implementation does not execute commands, add a shell loop, add external integrations, build a custom AI editing engine, perform automatic merge/deploy, or add package dependencies.

## Scope

### In Scope

- Shared validation command inference helper.
- Shared package export wiring.
- SDK-012 tracking, log, and evidence files.

### Out of Scope

- Actual command execution.
- Reading files from disk inside the helper.
- Dangerous command blocking, which belongs to SDK-011.
- Dry-run mode, which belongs to SDK-013.
- Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `packages/shared/src/test-command-detection.ts`: package manager and validation command inference helper
- `packages/shared/src/index.ts`: export new shared SDK helper
- `track/MASTER.md`: SDK-012 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-SDK-012.md`: session log
- `track/evidence/SDK-012/validation.txt`: validation evidence

## Implementation Notes

- Keep the helper pure: callers pass lockfile names and package scripts.
- Prefer repository package manager based on lockfile priority.
- Include only scripts present in input by default to avoid inventing commands that may fail.

## Dependencies / Decisions

- Depends on SDK-010 and SDK-011.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Adds pure shared inference code only; no real command execution, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added pure shared package manager detection from lockfile names.
- Added validation command inference for lint, typecheck, test, and build scripts.
- Added command formatting for pnpm, npm, yarn, and bun with optional pnpm workspace filter support.
- Exported the helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "detectPackageManagerFromLockfiles\|inferValidationCommands\|formatPackageScriptCommand\|pnpm-lock.yaml\|yarn.lock\|bun.lock\|package-lock.json\|lint\|typecheck\|test\|build\|packageFilter" packages/shared/src/test-command-detection.ts packages/shared/src/index.ts` | Passed | Source check confirmed package manager detection, validation command inference, pnpm workspace filter formatting, and export. |

## Evidence

- `track/evidence/SDK-012/validation.txt`

## Follow-up Tasks

- SDK-013
