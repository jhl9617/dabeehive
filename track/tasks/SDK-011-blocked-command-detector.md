# SDK-011 — Blocked command detector

## Status

- Status: verified
- Priority: P1
- Area: SDK
- Created At: 2026-05-06 14:04 KST
- Started At: 2026-05-06 14:04 KST
- Completed At: 2026-05-06 14:07 KST

## Objective

Add a provider-neutral command policy detector for the Agent SDK runner path so risky bash commands can be blocked or marked as requiring approval before execution.

## Acceptance Criteria

- [x] Shared SDK code can assess a command string or argv list as `allowed`, `requires_approval`, or `blocked`.
- [x] Detector covers destructive file operations, deploy/infra commands, secret access, dependency install/add commands, DB migration apply/reset, shell control operators, and automatic merge commands.
- [x] Coder instructions mention the command policy before bash execution.
- [x] The implementation does not execute commands, add a shell loop, add external integrations, build a custom AI editing engine, perform automatic merge/deploy, or add package dependencies.

## Scope

### In Scope

- Shared SDK command policy types/constants/helper.
- Shared coder instruction wording.
- Shared package export wiring.
- SDK-011 tracking, log, and evidence files.

### Out of Scope

- Actual command execution.
- Approval persistence/API integration.
- Full shell parser.
- Test command detection, which belongs to SDK-012.
- Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `packages/shared/src/blocked-command-detector.ts`: command policy detector
- `packages/shared/src/coder-instruction.ts`: command policy instruction text
- `packages/shared/src/index.ts`: export new shared SDK helper
- `track/MASTER.md`: SDK-011 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-SDK-011.md`: session log
- `track/evidence/SDK-011/validation.txt`: validation evidence

## Implementation Notes

- Keep matching deterministic and conservative.
- Return structured reason codes/messages instead of throwing.
- Keep this as policy assessment only; no command execution.

## Dependencies / Decisions

- Depends on SDK-010 allowed bash tool settings.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds protective shared policy code only; no real command execution, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added `assessCommandPolicy` and `isCommandBlocked` helpers with structured decisions and reason codes.
- Added default command policy rules for destructive file operations, Git history rewrite, automatic merge, deploy/infra mutation, secret access, dependency changes, DB migration/direct SQL mutation, and shell control operators.
- Added bash-tool-allowed and empty-command checks.
- Updated coder instructions to stop before bash commands that are blocked or require approval by policy.
- Exported the detector from the shared package index.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Failed, then passed | Initial readonly array narrowing error fixed; final shared TypeScript no-emit check passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "assessCommandPolicy\|isCommandBlocked\|destructive_file_operation\|deploy_or_infra\|secret_access\|dependency_change\|database_migration\|shell_control_operator\|auto_merge\|requires_approval\|blocked\|CommandPolicyDecision" packages/shared/src/blocked-command-detector.ts packages/shared/src/coder-instruction.ts packages/shared/src/index.ts` | Passed | Source check confirmed policy decisions, risky command reason codes, exports, and coder instruction wording. |

## Evidence

- `track/evidence/SDK-011/validation.txt`

## Follow-up Tasks

- SDK-012
