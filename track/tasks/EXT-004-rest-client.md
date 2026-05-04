# EXT-004 — Orchestrator REST client

## Status

- Status: verified
- Priority: P0
- Area: Extension
- Created At: 2026-05-04 18:03:16 KST
- Started At: 2026-05-04 18:03:16 KST
- Completed At: 2026-05-04 18:05:51 KST

## Objective

Add a minimal Orchestrator REST client for the VS Code extension using non-sensitive `serverUrl` configuration and the API token stored in SecretStorage.

## Acceptance Criteria

- [x] Extension has a REST client that can call an Orchestrator endpoint using serverUrl and optional Bearer token.
- [x] `serverUrl` is contributed as non-sensitive configuration and API token is read from SecretStorage only.
- [x] Typecheck/compile/lint, mocked REST smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- `apps/vscode-extension/src/orchestratorClient.ts`
- `apps/vscode-extension/src/vscode.d.ts`
- `track/RISKS.md`
- EXT-004 tracking, log, and evidence files

### Out of Scope

- connection status UI
- real tree data loading
- create issue/start run commands
- webviews
- SDK adapter calls
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/vscode-extension/package.json`: non-sensitive server URL configuration
- `apps/vscode-extension/src/extension.ts`: refresh command health-check wiring
- `apps/vscode-extension/src/orchestratorClient.ts`: fetch-based REST client
- `apps/vscode-extension/src/vscode.d.ts`: local VS Code API shim expansion
- `track/RISKS.md`: token/header handling risk note
- `track/MASTER.md`: EXT-004 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-EXT-004.md`: session log
- `track/evidence/EXT-004/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Use global `fetch`.
- Read API token through EXT-003 `getApiToken`.
- Store only `dabeehive.serverUrl` in VS Code configuration.
- Do not log token or Authorization header values.

## Dependencies / Decisions

- Depends on EXT-003.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 75
- Approval Required: yes
- Reason: Security-sensitive API token is attached to outbound REST requests.
- Changed files:
  - `apps/vscode-extension/package.json`
  - `apps/vscode-extension/src/extension.ts`
  - `apps/vscode-extension/src/orchestratorClient.ts`
  - `apps/vscode-extension/src/vscode.d.ts`
- Diff summary: Add a fetch-based REST client that reads serverUrl from non-sensitive configuration and token from SecretStorage, then sends Bearer auth only in memory.
- Required reviewer action: Confirm token values are never logged or persisted outside SecretStorage and only serverUrl is contributed as configuration.

## Changes Made

- Added non-sensitive `dabeehive.serverUrl` configuration contribution.
- Added fetch-based `OrchestratorClient` with `/api/health` request support and optional in-memory Bearer header.
- Wired the existing refresh command to create a client from serverUrl configuration and SecretStorage token.
- Expanded the local VS Code API shim for workspace configuration.
- Added DOM lib to extension tsconfig for `fetch` and `URL` types.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Passed | Initial run failed on missing `fetch`/`URL` types; passed after adding DOM lib. |
| `pnpm --filter @dabeehive/vscode-extension compile` | Passed | Extension package compile script emitted ignored `dist/` output. |
| mocked REST client/refresh smoke | Passed | Refresh called `/api/health` with configured serverUrl and SecretStorage Bearer token. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for serverUrl configuration and Authorization header | Passed | Found serverUrl configuration and Authorization header path; no logging/settings writes found. |

## Evidence

- `track/evidence/EXT-004/validation.txt`

## Follow-up Tasks

- EXT-005
