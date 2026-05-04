# EXT-008 — Approvals Tree

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:22:12 KST
- Started At: 2026-05-04 18:22:12 KST
- Completed At: 2026-05-04 18:24:14 KST

## Objective

Implement the VS Code Approvals tree using the Orchestrator REST client.

## Acceptance Criteria

- [x] Orchestrator REST client can list pending approvals.
- [x] Existing Approvals view displays pending approval items.
- [x] Typecheck/compile/lint, mocked Approvals tree provider smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- EXT-008 tracking, log, and evidence files

### Out of Scope

- approval response command
- approval panel webview
- run console webview
- create issue command
- start run command
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/src/extension.ts`: Approvals tree provider
- `apps/vscode-extension/src/orchestratorClient.ts`: pending approval list method and type
- `track/MASTER.md`: EXT-008 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-008.md`: session log
- `track/evidence/EXT-008/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use existing REST API routes only.
- Keep tree nodes read-only; response commands and panels are later tasks.
- Do not persist approval data locally.

## Dependencies / Decisions

- Depends on EXT-004, EXT-002, and API-011.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: no
- Reason: Adds read-only extension tree data loading through the REST client; no secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `OrchestratorApproval` and `listPendingApprovals()` to the extension REST client.
- Registered an Approvals tree provider for `dabeehive.views.approvals`.
- Displayed pending approvals as read-only leaf nodes with action, type, risk, run, and issue metadata.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension typecheck completed with no output. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile completed. |
| mocked Approvals tree provider smoke | Passed | Mocked VS Code API and fetch verified provider registration, Bearer token header, pending query, and approval item rendering. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for approval client and tree labels | Passed | Found expected approval type, client method, provider, context value, and empty/error labels. |

## Evidence

- `track/evidence/EXT-008/validation.txt`

## Follow-up Tasks

- EXT-009
