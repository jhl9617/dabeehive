# SDK-013 — SDK Runner dry-run mode

## Status

- Status: verified
- Priority: P1
- Area: SDK
- Created At: 2026-05-06 14:14 KST
- Started At: 2026-05-06 14:14 KST
- Completed At: 2026-05-06 14:16 KST

## Objective

Add explicit Agent SDK dry-run mode support so runner prompts/plans can be validated without invoking a real coding SDK, modifying files, or running commands.

## Acceptance Criteria

- [x] Shared SDK types can represent normal and dry-run starts.
- [x] A deterministic dry-run report helper validates run prompt/context basics.
- [x] `ClaudeAgentSdkAdapter` can return a dry-run handle/report without real SDK execution.
- [x] Coder instructions make dry-run no-edit/no-command behavior explicit.
- [x] The implementation does not execute commands, add a shell loop, add external integrations, build a custom AI editing engine, perform automatic merge/deploy, or add package dependencies.

## Scope

### In Scope

- Shared SDK dry-run types/helper.
- Claude adapter skeleton dry-run option/start handling.
- Coder instruction dry-run wording.
- Shared package export wiring.
- SDK-013 tracking, log, and evidence files.

### Out of Scope

- Real Claude SDK invocation.
- File modification or shell command execution.
- Fake adapter smoke test, which belongs to SDK-014.
- Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `packages/shared/src/agent-sdk.ts`: dry-run mode/handle/report types
- `packages/shared/src/dry-run.ts`: dry-run report helper
- `packages/shared/src/claude-agent-sdk-adapter.ts`: dry-run option/start behavior
- `packages/shared/src/coder-instruction.ts`: dry-run wording
- `packages/shared/src/index.ts`: export new shared helper
- `track/MASTER.md`: SDK-013 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-SDK-013.md`: session log
- `track/evidence/SDK-013/validation.txt`: validation evidence

## Implementation Notes

- Keep dry-run deterministic and dependency-free.
- Do not execute commands or inspect files from this helper.
- Use report warnings instead of throwing for incomplete prompt/context basics.

## Dependencies / Decisions

- Depends on SDK-010 through SDK-012.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Shared SDK dry-run typing/reporting only; no real command execution, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added shared normal/dry-run mode, dry-run warning, and dry-run report types.
- Added deterministic `buildCodingAgentDryRunReport` helper.
- Added `dryRun` input/adapter option handling to `ClaudeAgentSdkAdapter`.
- Added dry-run no-edit/no-command wording to coder instructions.
- Exported the dry-run helper from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "dryRun\|dry_run\|CodingAgentDryRunReport\|buildCodingAgentDryRunReport\|Dry Run\|Do not modify files or run commands\|mode: \"normal\"\|dry-run" packages/shared/src/agent-sdk.ts packages/shared/src/dry-run.ts packages/shared/src/claude-agent-sdk-adapter.ts packages/shared/src/coder-instruction.ts packages/shared/src/index.ts` | Passed | Source check confirmed dry-run types, helper, adapter path, instruction wording, and export. |

## Evidence

- `track/evidence/SDK-013/validation.txt`

## Follow-up Tasks

- SDK-014
