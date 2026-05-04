# EXT-002 — contributes commands/views setup

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 17:55:05 KST
- Started At: 2026-05-04 17:55:05 KST
- Completed At: 2026-05-04 17:56:49 KST

## Objective

Add VS Code extension contributed command and Activity Bar views so the PoC control surface is visible in the extension host.

## Acceptance Criteria

- [x] Extension manifest contributes an Activity Bar container, views, and a basic command.
- [x] Activation registers the basic command and empty tree providers without implementing AI code editing or shell loops.
- [x] Typecheck/compile/lint and manifest/source smoke results are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/resources/dabeehive.svg`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- EXT-002 tracking, log, and evidence files

### Out of Scope

- SecretStorage
- Orchestrator REST client
- real project/issue/run/approval data loading
- status bar
- webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: contributes metadata
- `apps/vscode-extension/resources/dabeehive.svg`: Activity Bar icon
- `apps/vscode-extension/src/extension.ts`: command and empty view provider registration
- `apps/vscode-extension/src/vscode.d.ts`: local VS Code API shim expansion
- `track/MASTER.md`: EXT-002 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-002.md`: session log
- `track/evidence/EXT-002/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep providers empty; actual data trees are later EXT tasks.
- Use only VS Code contribution points and passive registration.

## Dependencies / Decisions

- Depends on EXT-001.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 25
- Approval Required: no
- Reason: Adds passive VS Code contribution metadata and empty providers only; no secrets, auth, external calls, package dependency, deployment, or destructive changes.

## Changes Made

- Added Activity Bar container metadata, Issues/Runs/Approvals view contributions, and `Dabeehive: Refresh` command contribution.
- Added a simple Activity Bar SVG icon.
- Registered the refresh command and empty tree data providers for the contributed views during activation.
- Expanded the local VS Code API type shim for command and tree provider registration.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Typecheck completed with exit code 0. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile script emitted ignored `dist/` output. |
| mocked activation smoke | Passed | Registered one command and three tree providers with mocked VS Code API. |
| `pnpm lint` | Passed | `basic lint passed`. |
| manifest/source `rg` smoke checks | Passed | Contribution ids, command id, and icon file were found. |

## Evidence

- `track/evidence/EXT-002/validation.txt`

## Follow-up Tasks

- EXT-003
