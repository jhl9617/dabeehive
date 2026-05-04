# FND-003 — TypeScript Base Config

## Status

- Status: verified
- Priority: P0
- Area: Foundation
- Created At: 2026-05-04 14:37:26 KST
- Started At: 2026-05-04 14:37:26 KST
- Completed At: 2026-05-04 14:38:47 KST

## Objective

Add shared TypeScript configuration for the monorepo and workspace-level configs for the server, VS Code extension, and shared package.

## Acceptance Criteria

- [x] Root shared TypeScript config exists.
- [x] Root project reference TypeScript config exists.
- [x] Server workspace TypeScript config exists.
- [x] VS Code extension workspace TypeScript config exists.
- [x] Shared package TypeScript config exists.
- [x] Tracking files record the start and completion of this task.

## Scope

### In Scope

- Add root `tsconfig.base.json`.
- Add root `tsconfig.json` with workspace references.
- Add `tsconfig.json` files for `apps/server`, `apps/vscode-extension`, and `packages/shared`.
- Validate config files are present and parseable JSON.

### Out of Scope

- Installing TypeScript or other dependencies.
- Adding source files or shared domain types.
- Lint/format setup, which belongs to `FND-004`.
- Next.js or extension scaffold implementation.

## Expected Files

- `tsconfig.base.json`: shared compiler options.
- `tsconfig.json`: root project references.
- `apps/server/tsconfig.json`: server workspace config.
- `apps/vscode-extension/tsconfig.json`: extension workspace config.
- `packages/shared/tsconfig.json`: shared workspace config.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/FND-003-typescript-config.md`: task details and validation result.
- `track/logs/2026-05-04-FND-003.md`: session log.
- `track/evidence/FND-003/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion entry.

## Implementation Notes

- Keep this task dependency-free to avoid package approval.
- Typecheck execution is deferred until TypeScript is added by a later foundation task.
- `docs/codex-implementation-rules.md` is deleted in the working tree at task start but is unrelated to `FND-003` and will not be touched.

## Dependencies / Decisions

- Depends on `FND-002` being verified.
- Decision: use strict TypeScript defaults and workspace project references.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Configuration files only; no dependencies, schema, auth, deployment, or destructive operation changes.

## Changes Made

- Added `tsconfig.base.json` with shared strict TypeScript compiler options.
- Added root `tsconfig.json` with project references to server, extension, and shared workspaces.
- Added workspace `tsconfig.json` files for `apps/server`, `apps/vscode-extension`, and `packages/shared`.
- Created this task detail file and session log.
- Recorded validation evidence in `track/evidence/FND-003/validation.txt`.
- Updated `track/MASTER.md`, `track/CURRENT.md`, and `track/CHANGELOG.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `test -f tsconfig.base.json && test -f tsconfig.json && test -f apps/server/tsconfig.json && test -f apps/vscode-extension/tsconfig.json && test -f packages/shared/tsconfig.json` | Passed | Root and workspace TypeScript config files exist. |
| `node -e "for (const f of ['tsconfig.base.json','tsconfig.json','apps/server/tsconfig.json','apps/vscode-extension/tsconfig.json','packages/shared/tsconfig.json']) JSON.parse(require('fs').readFileSync(f, 'utf8'))"` | Passed | All config files parse as JSON. |
| `rg '"references"\|"extends"\|"compilerOptions"\|"strict"' tsconfig.base.json tsconfig.json apps/server/tsconfig.json apps/vscode-extension/tsconfig.json packages/shared/tsconfig.json` | Passed | References, extends, compiler options, and strict mode are present. |
| `rg "FND-003 \| in_progress\|Task ID: FND-003\|Status: in_progress" track/MASTER.md track/CURRENT.md track/tasks/FND-003-typescript-config.md` | Passed | Pre-implementation tracking state was present before validation. |

## Evidence

- `track/evidence/FND-003/validation.txt`

## Follow-up Tasks

- `FND-004`: lint/format 기본 설정.
