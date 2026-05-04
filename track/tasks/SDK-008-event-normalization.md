# SDK-008 — SDK Event Normalization

## Status

- Status: verified
- Priority: P0
- Area: SDK
- Created At: 2026-05-04 18:57:41 KST
- Started At: 2026-05-04 18:57:41 KST
- Completed At: 2026-05-04 18:59:50 KST

## Objective

Add SDK event normalization so adapter events can be converted into Orchestrator `CodingAgentEvent` records.

## Acceptance Criteria

- [x] `normalizeCodingAgentEvent` exists and is exported.
- [x] Normalizer maps supported raw SDK event inputs to `CodingAgentEvent` with run id, event type, optional message/metadata, and ISO timestamp.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `packages/shared/src/event-normalization.ts`
- `packages/shared/src/index.ts`
- SDK-008 tracking, log, and evidence files

### Out of Scope

- SDK invocation
- runner process
- shell execution
- API upload or DB writes
- cancellation handling
- workflow state transitions
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `packages/shared/src/event-normalization.ts`: SDK event normalization helper
- `packages/shared/src/index.ts`: normalizer export
- `track/MASTER.md`: SDK-008 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-SDK-008.md`: session log
- `track/evidence/SDK-008/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep normalization deterministic and provider-neutral.
- Do not call any SDK, shell command, REST API, or database from the normalizer.

## Dependencies / Decisions

- Depends on SDK-003.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds deterministic TypeScript normalization helper only; no runtime integration, secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `RawCodingAgentEvent`, `NormalizeCodingAgentEventInput`, and `normalizeCodingAgentEvent`.
- Added event type alias normalization for provider-neutral raw SDK event names.
- Added message, metadata/data, and created-at timestamp normalization.
- Exported the normalizer from `packages/shared/src/index.ts`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Shared package typecheck completed with no output. |
| event normalization smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `event-normalization.ts`, then verified event alias, timestamp, message, metadata, and fallback type normalization. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `normalizeCodingAgentEvent` | Passed | Found normalizer, input/raw types, alias mapping, task references, and shared export. |

## Evidence

- `track/evidence/SDK-008/validation.txt`

## Follow-up Tasks

- SDK-009
