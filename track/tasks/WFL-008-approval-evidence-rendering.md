# WFL-008 — Approval Evidence Rendering

## Status

- Status: verified
- Priority: P1
- Area: Workflow
- Created At: 2026-05-06 14:35:08 KST
- Started At: 2026-05-06 14:35:08 KST
- Completed At: 2026-05-06 14:39:18 KST

## Objective

Render approval evidence in the VS Code Approval Panel so reviewers can see why an approval is being requested from the existing approval details.

## Acceptance Criteria

- [x] Approval details include a distinct evidence section.
- [x] Evidence summarizes risk level, changed file scope, required action/reason, and diff summary availability from existing approval fields.
- [x] The implementation avoids external integrations, API schema changes, custom AI editing logic, and deployment behavior.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- VS Code Approval Panel HTML rendering helper.
- Evidence derived from existing `OrchestratorApproval` fields.
- Extension typecheck/compile, root lint, and source checks.

### Out of Scope

- Jira, Slack, GitHub PR creation, deployment, automatic merge, or full external integrations.
- API route/schema changes, DB schema/migration changes, package dependencies, or custom AI code editing engine.

## Expected Files

- `apps/vscode-extension/src/extension.ts`: approval evidence rendering.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/WFL-008-approval-evidence-rendering.md`: task details and validation results.
- `track/logs/2026-05-06-WFL-008.md`: session log.
- `track/evidence/WFL-008/validation.txt`: validation evidence.

## Implementation Notes

- Keep evidence rendering deterministic and local to the existing Approval Panel.
- Do not alter API responses or persistence schema for this task.
- Hide the evidence section only if no evidence can be derived.

## Dependencies / Decisions

- Depends on existing EXT-012 Approval Panel Webview and approval fields from REST client.
- No package dependency additions.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: UI rendering only; no public API, DB schema, auth, dependency, deployment, or destructive change.

## Changes Made

- Added an Evidence section to the VS Code Approval Panel.
- Added deterministic evidence helpers for risk level, changed file scope, diff summary availability, required action, and reason.
- Kept the implementation local to existing approval rendering without API, DB, dependency, or external integration changes.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/vscode-extension exec tsc --noEmit` | Failed | Existing package setup does not expose a local `tsc` binary. |
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Workspace TypeScript executable completed extension no-emit check. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Passed | Extension compile script completed successfully. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "renderApprovalEvidence\|buildApprovalEvidence\|formatRiskEvidence\|getRiskLevelLabel\|Evidence\|Diff summary is available below\|No changed files were reported" apps/vscode-extension/src/extension.ts` | Passed | Source check confirmed Approval Panel evidence rendering. |

## Evidence

- `track/evidence/WFL-008/validation.txt`

## Follow-up Tasks

- GIT-006
