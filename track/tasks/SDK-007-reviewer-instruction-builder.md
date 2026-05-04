# SDK-007 — Reviewer Instruction Builder

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:52:44 KST
- Started At: 2026-05-04 18:52:44 KST
- Completed At: 2026-05-04 18:55:46 KST

## Objective

Add a reviewer instruction builder that creates a review prompt from diff and test results.

## Acceptance Criteria

- [x] `buildReviewerInstruction` exists and is exported.
- [x] Builder includes diff summary and test results in a provider-neutral prompt.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/reviewer-instruction.ts`
- `packages/shared/src/index.ts`
- SDK-007 tracking, log, and evidence files

### Out of Scope

- diff collection
- test execution
- SDK invocation
- event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/reviewer-instruction.ts`: reviewer instruction builder
- `packages/shared/src/index.ts`: builder export
- `track/MASTER.md`: SDK-007 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-007.md`: session log
- `track/evidence/SDK-007/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep output deterministic and provider-neutral.
- Do not collect diffs or run tests from the builder.

## Dependencies / Decisions

- Depends on SDK-002.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript prompt builder only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `packages/shared/src/reviewer-instruction.ts` with deterministic `buildReviewerInstruction`.
- Added reviewer prompt inputs for diff summary, changed files, test results, and review focus.
- Exported the reviewer builder from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| reviewer instruction builder smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `reviewer-instruction.ts`, then verified generated prompt sections and sample values. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `buildReviewerInstruction` | Passed | Found builder, input type, diff/test sections, task references, and shared export. |

## Evidence

- `track/evidence/SDK-007/validation.txt`

## Follow-up Tasks

- SDK-008
