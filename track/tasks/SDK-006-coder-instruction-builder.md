# SDK-006 — Coder Instruction Builder

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:49:45 KST
- Started At: 2026-05-04 18:49:45 KST
- Completed At: 2026-05-04 18:51:10 KST

## Objective

Add a coder instruction builder that creates a code-change prompt from an approved plan.

## Acceptance Criteria

- [x] `buildCoderInstruction` exists and is exported.
- [x] Builder includes issue and approved plan data in a provider-neutral prompt.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/coder-instruction.ts`
- `packages/shared/src/index.ts`
- SDK-006 tracking, log, and evidence files

### Out of Scope

- reviewer instruction builder
- SDK invocation
- event normalization
- runner process
- shell execution
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/coder-instruction.ts`: coder instruction builder
- `packages/shared/src/index.ts`: builder export
- `track/MASTER.md`: SDK-006 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-006.md`: session log
- `track/evidence/SDK-006/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep output deterministic and provider-neutral.
- Do not call any SDK or shell command from the builder.

## Dependencies / Decisions

- Depends on SDK-002 and SDK-005.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript prompt builder only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `buildCoderInstruction()` with deterministic project, workspace, issue, approved plan, constraints, validation command, and output requirement sections.
- Added `CoderInstructionInput` type.
- Exported the builder from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| coder instruction builder smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Used TypeScript compiler API from existing server dependency to transpile and execute the builder. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `buildCoderInstruction` | Passed | Found builder, input type, approved plan/validation sections, and shared export. |

## Evidence

- `track/evidence/SDK-006/validation.txt`

## Follow-up Tasks

- SDK-007
