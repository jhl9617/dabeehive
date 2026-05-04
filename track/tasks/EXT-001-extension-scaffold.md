# EXT-001 — VS Code Extension scaffold

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 17:49:21 KST
- Started At: 2026-05-04 17:49:21 KST
- Completed At: 2026-05-04 17:52:52 KST

## Objective

Create the minimal VS Code Extension scaffold so the extension package has a manifest, activation entrypoint, and local compile validation path.

## Acceptance Criteria

- [x] Extension package manifest declares VS Code extension entrypoint and activation metadata.
- [x] `activate` and `deactivate` entrypoints exist without implementing AI code editing or shell loops.
- [x] Typecheck/lint and scaffold smoke results are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- EXT-001 tracking, log, and evidence files

### Out of Scope

- contributed commands/views
- SecretStorage
- Orchestrator REST client
- status bar, trees, or webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: extension manifest metadata
- `apps/vscode-extension/src/extension.ts`: activation entrypoint
- `apps/vscode-extension/src/vscode.d.ts`: minimal local VS Code API shim
- `apps/vscode-extension/tsconfig.json`: emit setting for extension build output
- `track/MASTER.md`: EXT-001 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-001.md`: session log
- `track/evidence/EXT-001/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the extension activation passive; do not call external services.
- Use a local type shim only for compile validation until a later dependency task decides on `@types/vscode`.

## Dependencies / Decisions

- Depends on FND-002 and FND-003.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds passive extension scaffold only; no secrets, auth, external calls, package dependency, deployment, or destructive changes.

## Changes Made

- Added VS Code extension manifest metadata with `main`, `engines.vscode`, `activationEvents`, and a dependency-free compile script that reuses the workspace TypeScript install.
- Added minimal `activate` and `deactivate` exports without commands, views, external calls, AI patch loops, or shell loops.
- Added a local `vscode` type shim for compile validation without adding `@types/vscode`.
- Set the extension tsconfig to emit build output because the root base config has `noEmit: true`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Typecheck completed with exit code 0. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile script emitted ignored `dist/` output. |
| `node -e "..."` activation smoke | Passed | Required compiled entrypoint, called `activate`/`deactivate`, and observed one disposable subscription. |
| `pnpm lint` | Passed | `basic lint passed`. |
| manifest/source `rg` smoke checks | Passed | Manifest and source entrypoint fields found. |

## Evidence

- `track/evidence/EXT-001/validation.txt`

## Follow-up Tasks

- EXT-002
