# FND-005 — Shared API And Domain Types

## Status

- Status: verified
- Priority: P0
- Area: Foundation
- Created At: 2026-05-04 14:44:03 KST
- Started At: 2026-05-04 14:44:03 KST
- Completed At: 2026-05-04 14:45:31 KST

## Objective

Create the initial shared package type surface for API responses and core PoC domain entities so later server, MCP, extension, and SDK tasks can share contracts.

## Acceptance Criteria

- [x] Shared package exports API response types.
- [x] Shared package exports core domain types.
- [x] Shared package has a root export entry point.
- [x] Lint command passes with the new type files.
- [x] Tracking files record the start and completion of this task.

## Scope

### In Scope

- Add `packages/shared/src/api.ts`.
- Add `packages/shared/src/domain.ts`.
- Add `packages/shared/src/index.ts`.
- Update `packages/shared/package.json` export metadata.

### Out of Scope

- Runtime validation schemas.
- DB/Prisma models.
- REST API implementation.
- MCP tool implementation.
- Agent SDK runner implementation.

## Expected Files

- `packages/shared/package.json`: shared package export metadata.
- `packages/shared/src/api.ts`: API response types.
- `packages/shared/src/domain.ts`: core domain types.
- `packages/shared/src/index.ts`: public type exports.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/FND-005-shared-types.md`: task details and validation result.
- `track/logs/2026-05-04-FND-005.md`: session log.
- `track/evidence/FND-005/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion entry.

## Implementation Notes

- Keep this package type-only and dependency-free.
- Use conservative string union types matching current MASTER/PRD scope.
- `docs/codex-implementation-rules.md` is deleted in the working tree at task start but is unrelated to `FND-005` and will not be touched.

## Dependencies / Decisions

- Depends on `FND-002`, `FND-003`, and `FND-004` being verified.
- Decision: expose type entry points for `.`, `./api`, and `./domain`.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Type-only shared package surface; no dependencies, schema, auth, deployment, or destructive operation changes.

## Changes Made

- Added `packages/shared/src/api.ts` with common API response types.
- Added `packages/shared/src/domain.ts` with core PoC domain types.
- Added `packages/shared/src/index.ts` public type exports.
- Updated `packages/shared/package.json` export metadata.
- Created this task detail file and session log.
- Recorded validation evidence in `track/evidence/FND-005/validation.txt`.
- Updated `track/MASTER.md`, `track/CURRENT.md`, and `track/CHANGELOG.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `test -f packages/shared/src/api.ts && test -f packages/shared/src/domain.ts && test -f packages/shared/src/index.ts` | Passed | Shared type files exist. |
| `rg "ApiSuccess\|ApiError\|ApiResponse" packages/shared/src/api.ts packages/shared/src/index.ts` | Passed | API response types are present. |
| `rg "Project\|Issue\|AgentRun\|Approval\|Artifact\|RunEvent" packages/shared/src/domain.ts packages/shared/src/index.ts` | Passed | Core domain types are present. |
| `rg '"exports"\|"types"' packages/shared/package.json` | Passed | Export metadata is present. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg "FND-005 \| in_progress\|Task ID: FND-005\|Status: in_progress" track/MASTER.md track/CURRENT.md track/tasks/FND-005-shared-types.md` | Passed | Pre-implementation tracking state was present before validation. |

## Evidence

- `track/evidence/FND-005/validation.txt`

## Follow-up Tasks

- `SRV-001`: Next.js App Router 앱 초기화.
