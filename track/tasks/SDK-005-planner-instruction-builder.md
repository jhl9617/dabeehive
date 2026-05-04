# SDK-005 — Planner Instruction Builder

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:46:06 KST
- Started At: 2026-05-04 18:46:06 KST
- Completed At: 2026-05-04 18:48:14 KST

## Objective

Add a planner instruction builder that creates an implementation-plan prompt from issue and context data.

## Acceptance Criteria

- [x] `buildPlannerInstruction` exists and is exported.
- [x] Builder includes issue and context document data in a provider-neutral prompt.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/planner-instruction.ts`
- `packages/shared/src/index.ts`
- SDK-005 tracking, log, and evidence files

### Out of Scope

- coder/reviewer instruction builders
- approval creation flow
- SDK invocation
- event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/planner-instruction.ts`: planner instruction builder
- `packages/shared/src/index.ts`: builder export
- `track/MASTER.md`: SDK-005 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-005.md`: session log
- `track/evidence/SDK-005/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep output deterministic and provider-neutral.
- Do not call any SDK or shell command from the builder.

## Dependencies / Decisions

- Depends on shared domain and SDK input types.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript prompt builder only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `buildPlannerInstruction()` with deterministic project, issue, context document, constraint, and output requirement sections.
- Added planner instruction input/project/context document types.
- Exported the builder from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| planner instruction builder smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Used TypeScript compiler API from existing server dependency to transpile and execute the builder without adding `tsx`. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `buildPlannerInstruction` | Passed | Found builder, input type, context/output sections, and shared export. |

## Evidence

- `track/evidence/SDK-005/validation.txt`

## Follow-up Tasks

- SDK-006
