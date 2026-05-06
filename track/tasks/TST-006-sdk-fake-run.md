# TST-006 — SDK Fake Run Validation

## Status

- Status: verified
- Priority: P0
- Area: Test
- Created At: 2026-05-06 10:30:13 KST
- Started At: 2026-05-06 10:30:13 KST
- Completed At: 2026-05-06 10:32:47 KST

## Objective

Validate SDK fake run event flow without calling a real external coding SDK.

## Acceptance Criteria

- [x] Fake adapter emits normalized message/tool/file/command/test/done events.
- [x] Cancellation helper dispatches a cancel command to the adapter.
- [x] No real external SDK or custom code editing engine is invoked.
- [x] Validation evidence and tracking updates are recorded.

## Scope

### In Scope

- Shared SDK adapter/event type inspection.
- Minimal fake-run smoke script if needed.
- Typecheck, fake event flow smoke, cancellation smoke, and lint validation.

### Out of Scope

- Real Claude/Codex/OpenAI SDK execution.
- Custom AI code editing engine.
- DB-backed run persistence.
- REST/MCP/Extension smoke validation.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-06-TST-006.md`: session log.
- `track/evidence/TST-006/validation.txt`: validation evidence.
- Optional smoke script if a reusable SDK fake run check is needed.

## Implementation Notes

- Use existing `LocalCodingAgentAdapter` and event normalization helpers.
- Keep fake run deterministic and dependency-free.
- No package dependency additions are planned.

## Dependencies / Decisions

- Depends on SDK-001 through SDK-009.
- No dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Test/smoke support only; no schema, auth, dependency, deployment, or destructive change planned.

## Changes Made

- Added a deterministic SDK fake run smoke script using the existing shared adapter/event helpers.
- The smoke script invokes no real external SDK and does not edit files or run shell commands as an agent.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Pass | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/server exec node ../../scripts/sdk-fake-run-smoke.mjs` | Pass | Emitted normalized message/tool_call/tool_result/file_change/command/test_result/done events and cancellation payload. |
| `node -c scripts/sdk-fake-run-smoke.mjs` | Pass | Smoke script syntax is valid. |
| `pnpm lint` | Pass | `basic lint passed`. |

## Evidence

- `track/evidence/TST-006/validation.txt`

## Follow-up Tasks

- TST-007
