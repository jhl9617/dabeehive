# SDK-014 — SDK adapter smoke test

## Status

- Status: verified
- Priority: P1
- Area: SDK
- Created At: 2026-05-06 14:18 KST
- Started At: 2026-05-06 14:18 KST
- Completed At: 2026-05-06 14:20 KST

## Objective

Add a deterministic SDK adapter smoke test that verifies the shared adapter skeleton, dry-run mode, and event normalization without invoking a real external SDK.

## Acceptance Criteria

- [x] A reusable smoke command exists for SDK adapter validation.
- [x] The smoke test verifies `ClaudeAgentSdkAdapter` dry-run handle/report behavior.
- [x] The smoke test verifies normalized event stream shape using mock raw events.
- [x] The implementation does not invoke external SDKs, execute generated commands, add a shell loop, add external integrations, build a custom AI editing engine, perform automatic merge/deploy, or add package dependencies.

## Scope

### In Scope

- Root package script for SDK smoke validation.
- Deterministic local smoke script using existing TypeScript transpile helper pattern.
- SDK-014 tracking, log, and evidence files.

### Out of Scope

- Real Claude SDK invocation.
- File modification or shell command execution by the adapter.
- Network, DB, Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `package.json`: SDK smoke script entry
- `scripts/sdk-adapter-smoke.mjs`: deterministic SDK adapter smoke test
- `track/MASTER.md`: SDK-014 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-SDK-014.md`: session log
- `track/evidence/SDK-014/validation.txt`: validation evidence

## Implementation Notes

- Reuse the existing local TypeScript transpile pattern from `scripts/sdk-fake-run-smoke.mjs`.
- Keep the smoke test dependency-free and local.
- Do not call a real external coding SDK.

## Dependencies / Decisions

- Depends on SDK-010 through SDK-013.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Adds local smoke script/package script only; no real command execution through the adapter, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added root `pnpm test:sdk` command.
- Added deterministic `scripts/sdk-adapter-smoke.mjs` using local TypeScript transpile loading.
- Verified `ClaudeAgentSdkAdapter` dry-run handle/report behavior without invoking an external SDK.
- Verified mock raw event normalization, validation command inference, and command policy decisions.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared TypeScript no-emit check passed. |
| `pnpm test:sdk` | Passed | SDK adapter smoke passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "test:sdk\|sdk-adapter-smoke\|ClaudeAgentSdkAdapter\|dry_run\|normalizeCodingAgentEvent\|inferValidationCommands\|assessCommandPolicy\|message,tool_call,tool_result,done" package.json scripts/sdk-adapter-smoke.mjs` | Passed | Source check confirmed smoke command and coverage points. |

## Evidence

- `track/evidence/SDK-014/validation.txt`

## Follow-up Tasks

- WFL-006
