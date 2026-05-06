# EXT-013 — Artifact/Diff view command

## Status

- Status: verified
- Priority: P1
- Area: Extension
- Created At: 2026-05-06 14:08 KST
- Started At: 2026-05-06 14:08 KST
- Completed At: 2026-05-06 14:19 KST

## Objective

Add a VS Code command that opens Orchestrator artifacts for a run, including diff and test result artifacts, in a read-only viewer.

## Acceptance Criteria

- [x] A VS Code command can open an artifact viewer for a run ID with an optional artifact type filter.
- [x] The viewer displays artifact metadata and renders diff/test/markdown-like content in a readable read-only webview.
- [x] The artifact is fetched through the existing Orchestrator REST client and SecretStorage token path.
- [x] The implementation does not add Jira, Slack, custom AI editing, shell loops, automatic merge, deployment, or Draft PR behavior.

## Scope

### In Scope

- Extension command contribution and activation event.
- REST client artifact list support if needed.
- Read-only artifact/diff/test report webview rendering.
- EXT-013 tracking, log, and evidence files.

### Out of Scope

- Artifact creation/upload.
- GitHub PR creation, merge, or external storage.
- Custom AI patch/edit engine or shell tool loop.
- Server artifact API/schema changes.

## Expected Files

- `apps/vscode-extension/package.json`: artifact command contribution
- `apps/vscode-extension/src/extension.ts`: command and viewer webview
- `apps/vscode-extension/src/orchestratorClient.ts`: artifact list client method if needed
- `track/MASTER.md`: EXT-013 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-EXT-013.md`: session log
- `track/evidence/EXT-013/validation.txt`: validation evidence

## Implementation Notes

- Reuse the existing webview rendering and escaping helpers.
- Keep the command prompt-based because there is no artifact tree yet.
- Use the existing `GET /api/artifacts?runId=...&type=...` API; do not add server routes for this Extension task.
- Render all artifact content read-only.

## Dependencies / Decisions

- Depends on API-013 and EXT-004.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds read-only Extension UI and client calls only; no server schema/auth/deployment/dependency changes.

## Changes Made

- Added `dabeehive.openArtifactViewer` command contribution, activation event, and Runs tree context menu action.
- Added `OrchestratorClient.listArtifacts()` and artifact type/response types for the existing `GET /api/artifacts` route.
- Added a prompt-based read-only artifact viewer that accepts a run ID plus optional artifact type filter.
- Rendered artifact metadata, URI, inline diff/test/log content, and JSON metadata with existing HTML escaping.
- Kept the implementation read-only with scripts disabled.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | PASS | No-emit typecheck passed. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | PASS | Extension compile passed. |
| `pnpm lint` | PASS | Basic repository lint passed. |
| `rg -n 'openArtifactViewer\|listArtifacts\|OrchestratorArtifact\|ArtifactType\|/api/artifacts\|enableScripts: false\|renderArtifactViewer\|dabeehive.openArtifactViewer' apps/vscode-extension/package.json apps/vscode-extension/src/extension.ts apps/vscode-extension/src/orchestratorClient.ts` | PASS | Confirmed command, client, type, API path, and read-only viewer markers. |

## Evidence

- `track/evidence/EXT-013/validation.txt`

## Follow-up Tasks

- EXT-014
