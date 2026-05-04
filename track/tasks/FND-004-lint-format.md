# FND-004 — Basic Lint And Format Setup

## Status

- Status: verified
- Priority: P0
- Area: Foundation
- Created At: 2026-05-04 14:40:28 KST
- Started At: 2026-05-04 14:40:28 KST
- Completed At: 2026-05-04 14:42:03 KST

## Objective

Add a dependency-free baseline lint command and formatting policy so the repository has an executable validation command before app-specific lint tooling is installed.

## Acceptance Criteria

- [x] Root `package.json` exposes an executable `lint` command.
- [x] A basic formatting policy exists.
- [x] The lint command runs successfully.
- [x] Tracking files record the start and completion of this task.

## Scope

### In Scope

- Add `.editorconfig`.
- Add a Node-based basic lint script using only built-in modules.
- Add root `lint` and `format:check` scripts.
- Run `pnpm lint`.

### Out of Scope

- Installing ESLint, Prettier, TypeScript, or other dependencies.
- Framework-specific lint rules.
- Source code scaffolding.

## Expected Files

- `.editorconfig`: basic formatting policy.
- `scripts/lint-basic.mjs`: dependency-free lint/format check.
- `package.json`: lint scripts.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/FND-004-lint-format.md`: task details and validation result.
- `track/logs/2026-05-04-FND-004.md`: session log.
- `track/evidence/FND-004/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion entry.

## Implementation Notes

- Avoid dependency additions in this task to avoid approval gating.
- Basic lint checks JSON parseability, trailing whitespace, tabs, and final newline for tracked source/config docs.
- `docs/codex-implementation-rules.md` is deleted in the working tree at task start but is unrelated to `FND-004` and will not be touched.

## Dependencies / Decisions

- Depends on `FND-001` package manager setup.
- Decision: use built-in Node.js modules for the initial lint command.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: No package dependency is added; changes are limited to local validation script, formatting policy, package scripts, and tracking files.

## Changes Made

- Added `.editorconfig` with basic formatting policy.
- Added `scripts/lint-basic.mjs` using only Node.js built-in modules.
- Added root `lint` and `format:check` package scripts.
- Created this task detail file and session log.
- Recorded validation evidence in `track/evidence/FND-004/validation.txt`.
- Updated `track/MASTER.md`, `track/CURRENT.md`, and `track/CHANGELOG.md`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm lint` | Passed | First run failed on new placeholder trailing whitespace; second run passed after fixing it. |
| `pnpm run format:check` | Passed | First run failed on same placeholder issue; second run passed after fixing it. |
| `rg '"lint"\|"format:check"' package.json` | Passed | Root package scripts are present. |
| `rg "root = true\|indent_style\|insert_final_newline" .editorconfig` | Passed | Basic formatting policy is present. |
| `rg "FND-004 \| in_progress\|Task ID: FND-004\|Status: in_progress" track/MASTER.md track/CURRENT.md track/tasks/FND-004-lint-format.md` | Passed | Pre-implementation tracking state was present before validation. |

## Evidence

- `track/evidence/FND-004/validation.txt`

## Follow-up Tasks

- `FND-005`: 공통 타입 package 생성.
