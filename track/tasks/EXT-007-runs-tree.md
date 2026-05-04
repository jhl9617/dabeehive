# EXT-007 — Runs Tree

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:18:12 KST
- Started At: 2026-05-04 18:18:12 KST
- Completed At: 2026-05-04 18:20:36 KST

## Objective

Implement the VS Code Runs tree using the Orchestrator REST client.

## Acceptance Criteria

- [x] Orchestrator REST client can list runs.
- [x] Existing Runs view displays run items with status metadata.
- [x] Typecheck/compile/lint, mocked Runs tree provider smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- EXT-007 tracking, log, and evidence files

### Out of Scope

- Approvals tree
- create issue command
- start run command
- run console webview
- approval panel webview
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/src/extension.ts`: Runs tree provider
- `apps/vscode-extension/src/orchestratorClient.ts`: run list method and type
- `track/MASTER.md`: EXT-007 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-007.md`: session log
- `track/evidence/EXT-007/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use existing REST API routes only.
- Keep tree nodes read-only; run start/open console commands are later tasks.
- Do not persist run data locally.

## Dependencies / Decisions

- Depends on EXT-004, EXT-002, and API-008.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 40
- Approval Required: no
- Reason: Adds read-only extension tree data loading through the REST client; no secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added `OrchestratorRun` and `listRuns()` to the extension REST client.
- Registered a Runs tree provider for `dabeehive.views.runs`.
- Grouped runs by status at the tree root and displayed individual runs with role, issue, and model metadata.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension typecheck completed with no output. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile completed. |
| mocked Runs tree provider smoke | Passed | Mocked VS Code API and fetch verified provider registration, Bearer token header, status grouping, and run child rendering. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for run client and tree labels | Passed | Found expected run type, client method, provider, context values, and error label. |

## Evidence

- `track/evidence/EXT-007/validation.txt`

## Follow-up Tasks

- EXT-008
