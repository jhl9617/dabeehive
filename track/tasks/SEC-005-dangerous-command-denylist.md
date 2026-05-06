# SEC-005 — Dangerous Command Denylist

## Status

- Status: verified
- Priority: P1
- Area: Security
- Created At: 2026-05-06 15:39:55 KST
- Started At: 2026-05-06 15:39:55 KST
- Completed At: 2026-05-06 15:42:28 KST

## Objective

Make the Agent SDK runner command policy expose a clear dangerous command denylist and validate that deploy, delete, secret access, automatic merge, Git history rewrite, and pipe/control-operator shell commands are blocked before any runner execution layer can use them.

## Acceptance Criteria

- [x] A named denylist exists for blocked dangerous command classes.
- [x] Deploy/infra mutation, destructive delete, automatic merge, Git history rewrite, secret access, and shell control operator commands are covered by blocked rules.
- [x] Dependency and database mutation commands still require approval instead of being silently allowed.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Shared SDK command policy metadata and rule grouping.
- SDK smoke coverage for blocked and approval-required command classes.
- Existing SEC-005 risk record mitigation.
- SEC-005 tracking, log, and evidence files.

### Out of Scope

- Actual shell command execution or runner tool loop implementation.
- Approval persistence/API integration.
- Jira, Slack, deployment, Draft PR creation, or automatic merge behavior.
- Custom AI code editing engine.
- Package dependency additions.

## Expected Files

- `packages/shared/src/blocked-command-detector.ts`: explicit denylist and approval rule grouping.
- `scripts/sdk-adapter-smoke.mjs`: command policy smoke coverage.
- `track/RISKS.md`: SEC-005 risk mitigation status.
- `track/MASTER.md`: SEC-005 status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/SEC-005/validation.txt`: validation evidence.

## Implementation Notes

- Existing SDK-011 added the underlying command policy helper; SEC-005 should avoid creating a separate shell executor or duplicate engine.
- Shell control operators are treated as blocked in this task because the SEC-005 acceptance criterion explicitly calls out pipe shell commands in the denylist scope.

## Dependencies / Decisions

- Depends on SDK-011 command policy detector and SDK-014 smoke script.
- No package dependencies.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Tightens shared protective policy and validation only; no command execution, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Exported `DEFAULT_DANGEROUS_COMMAND_DENYLIST` with blocked rules for delete, Git history rewrite, automatic merge, deploy/infra mutation, secret access, and shell control operators.
- Split approval-required command rules into `APPROVAL_REQUIRED_COMMAND_RULES` for dependency changes and database migration/direct SQL mutation.
- Extended `pnpm test:sdk` smoke coverage for deploy/delete/pipe/history rewrite/auto-merge/secret commands and approval-required dependency/database commands.
- Marked the SEC-005 workspace dangerous-command risk as mitigated at the shared policy layer.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package no-emit typecheck passed. |
| `pnpm test:sdk` | Passed | SDK smoke printed dangerous denylist codes and command policy checks passed. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "DEFAULT_DANGEROUS_COMMAND_DENYLIST\|APPROVAL_REQUIRED_COMMAND_RULES\|shell_control_operator\|vercel deploy\|kubectl delete\|pnpm lint \\| tee\|requires_approval" packages/shared/src/blocked-command-detector.ts scripts/sdk-adapter-smoke.mjs` | Passed | Source check confirmed denylist and smoke coverage. |
| `pnpm track:status -- --task SEC-005 --status verified --dry-run` | Passed | MASTER summary shows verified=118, in_progress=0, not_started=5. |

## Evidence

- `track/evidence/SEC-005/validation.txt`

## Follow-up Tasks

- SEC-006
