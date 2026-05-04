# EXT-006 — Projects/Issues Tree

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:11:48 KST
- Started At: 2026-05-04 18:11:48 KST
- Completed At: 2026-05-04 18:16:09 KST

## Objective

Implement the VS Code Projects/Issues tree using the Orchestrator REST client.

## Acceptance Criteria

- [x] Orchestrator REST client can list projects and issues.
- [x] Existing Issues view displays projects as root nodes and issues under each project.
- [x] Typecheck/compile/lint, mocked tree provider smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- `track/RISKS.md`
- EXT-006 tracking, log, and evidence files

### Out of Scope

- Runs tree
- Approvals tree
- create issue command
- start run command
- webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: Issues view label update if needed
- `apps/vscode-extension/src/extension.ts`: Projects/Issues tree provider
- `apps/vscode-extension/src/orchestratorClient.ts`: project/issue list methods
- `apps/vscode-extension/src/vscode.d.ts`: local VS Code API shim expansion
- `track/RISKS.md`: metadata read risk note
- `track/MASTER.md`: EXT-006 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-006.md`: session log
- `track/evidence/EXT-006/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use existing REST API routes only.
- Keep tree nodes read-only; create/update commands are later tasks.
- Do not persist project or issue data locally.

## Dependencies / Decisions

- Depends on EXT-004, API-002, and API-004.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: no
- Reason: Adds read-only extension tree data loading through the REST client; no secrets, schema, package dependency, deployment, or destructive changes.

## Changes Made

- Added project and issue list response types plus `listProjects()` and `listIssues(projectId)` to the extension REST client.
- Registered a Projects/Issues tree provider for `dabeehive.views.issues` that renders projects as collapsed roots and issues as leaf nodes.
- Updated the extension manifest view title and local VS Code type shim for `TreeItem`/collapsible states.
- Recorded a read-only metadata loading risk note for extension tree views.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Extension typecheck completed with no output. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile completed. |
| mocked Projects/Issues tree provider smoke | Passed | Mocked VS Code API and fetch verified provider registration, project root, and issue child rendering. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for project/issue client and tree labels | Passed | Found expected client methods, view label, context values, and error label. |

## Evidence

- `track/evidence/EXT-006/validation.txt`

## Follow-up Tasks

- EXT-007
