# TST-007 — End-to-End Demo Scenario

## Status

- Status: blocked
- Priority: P0
- Area: Test
- Created At: 2026-05-06 10:38:00 KST
- Started At: 2026-05-06 10:38:00 KST
- Completed At: 2026-05-06 10:38:36 KST

## Objective

Validate whether the PoC end-to-end demo scenario can be reproduced from the developer control surface through issue selection, planning approval, coding flow, review artifacts, and final approval state.

## Acceptance Criteria

- [x] The VS Code issue -> plan -> approval -> coding -> review scenario is executed or a concrete blocker is recorded.
- [x] Validation evidence identifies which prerequisite surfaces passed and which dependency prevents the full demo.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- TST-007 validation-only readiness checks.
- Existing P0 evidence review for DB, REST, MCP, Extension activation, and SDK fake run prerequisites.
- Local executable validation commands that do not invoke real external AI SDKs or full external integrations.
- Tracking and evidence files for this task.

### Out of Scope

- Jira, Slack, deployment, automatic merge, or production integrations.
- Custom AI code editing engine implementation.
- Full VS Code GUI automation if the local Extension Host and DB-backed server are unavailable.
- New product feature implementation beyond evidence needed for the TST-007 decision.

## Expected Files

- `track/MASTER.md`: mark TST-007 in progress and later close with final status.
- `track/CURRENT.md`: active task state.
- `track/tasks/TST-007-e2e-demo-scenario.md`: task scope, results, and evidence.
- `track/logs/2026-05-06-TST-007.md`: session log.
- `track/evidence/TST-007/validation.txt`: validation evidence and blocker details.
- `track/CHANGELOG.md`: completion history.
- `track/RISKS.md`: blocker record if full E2E cannot run.

## Implementation Notes

- This is a validation/demo task. It should not implement Jira, Slack, external production integrations, a custom AI editing engine, or real SDK execution.
- The demo scenario depends on DB-backed REST/MCP flows and extension/SDK readiness from TST-002 through TST-006.
- Previous TST-002/TST-003/TST-004 evidence indicates local PostgreSQL/Docker availability is the likely blocker for a full E2E run.

## Dependencies / Decisions

- Depends on DB migrate/seed validation, REST happy path validation, MCP smoke validation, extension activation validation, and SDK fake run validation.
- No package dependency additions planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: validation-only tracking/evidence task; no source, schema, auth, dependency, deployment, or destructive changes are planned.

## Changes Made

- Added validation evidence for the TST-007 end-to-end demo scenario.
- Recorded that the full VS Code issue -> plan -> approval -> coding -> review scenario is blocked by missing local PostgreSQL/Docker availability.
- Confirmed independent prerequisites still pass: root lint, server/shared/extension TypeScript checks, extension compile, REST/MCP smoke script syntax, and SDK fake run smoke.
- No product source files were changed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm lint` | Passed | `basic lint passed`. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit` | Passed | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Passed | Extension compile completed. |
| `pnpm --filter @dabeehive/server exec node ../../scripts/sdk-fake-run-smoke.mjs` | Passed | Fake adapter emitted message/tool/file/command/test/done events and cancellation summary. |
| `node -c scripts/rest-happy-path-smoke.mjs` | Passed | REST smoke script syntax is valid. |
| `node -c scripts/mcp-smoke.mjs` | Passed | MCP smoke script syntax is valid. |
| `pg_isready -h localhost -p 55432` | Failed / Blocked | `localhost:55432 - no response`; full DB-backed E2E cannot run. |
| `docker ps --format '{{.Names}}'` | Failed / Blocked | Docker daemon socket unavailable; no containerized PostgreSQL fallback is available. |

## Evidence

- `track/evidence/TST-007/validation.txt`

## Follow-up Tasks

- TST-008
