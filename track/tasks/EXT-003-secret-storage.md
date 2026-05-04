# EXT-003 — SecretStorage token storage

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 17:58:52 KST
- Started At: 2026-05-04 17:58:52 KST
- Completed At: 2026-05-04 18:00:59 KST

## Objective

Implement VS Code SecretStorage-based API token storage commands without writing API tokens to settings.json.

## Acceptance Criteria

- [x] Extension uses `context.secrets` for API token store/delete behavior.
- [x] Manifest contributes set/clear token commands and activation registers them.
- [x] Typecheck/compile/lint, mocked SecretStorage smoke, and no-settings-token-write checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- `track/RISKS.md`
- EXT-003 tracking, log, and evidence files

### Out of Scope

- Orchestrator REST client
- server URL settings
- connection status
- real tree data loading
- webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: set/clear token command metadata
- `apps/vscode-extension/src/extension.ts`: SecretStorage command handlers
- `apps/vscode-extension/src/vscode.d.ts`: local VS Code API shim expansion
- `track/RISKS.md`: token handling risk note
- `track/MASTER.md`: EXT-003 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-003.md`: session log
- `track/evidence/EXT-003/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Store the token only under VS Code SecretStorage.
- Do not write the token to settings, files, logs, or output channels.
- Use commands only; REST client consumption is deferred.

## Dependencies / Decisions

- Depends on EXT-001 and EXT-002.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 80
- Approval Required: yes
- Reason: Security-sensitive token storage behavior is added to the extension.
- Changed files:
  - `apps/vscode-extension/package.json`
  - `apps/vscode-extension/src/extension.ts`
  - `apps/vscode-extension/src/vscode.d.ts`
- Diff summary: Add set/clear token commands that use VS Code SecretStorage and avoid settings writes.
- Required reviewer action: Confirm API tokens are stored only through SecretStorage and are not logged or persisted in settings/files.

## Changes Made

- Added `Dabeehive: Set API Token` and `Dabeehive: Clear API Token` command contributions and activation events.
- Registered set/clear token command handlers during activation.
- Stored non-empty trimmed tokens with `context.secrets.store` and cleared tokens with `context.secrets.delete`.
- Added `getApiToken` helper for later REST client work.
- Expanded the local VS Code API type shim for SecretStorage, input boxes, and notification messages.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Typecheck completed with exit code 0. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile script emitted ignored `dist/` output. |
| mocked SecretStorage activation/command smoke | Passed | Set command stored trimmed token in mocked SecretStorage; clear command removed it. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks proving no settings token write | Passed | Found SecretStorage usage and no settings/config/globalState writes. |

## Evidence

- `track/evidence/EXT-003/validation.txt`

## Follow-up Tasks

- EXT-004
