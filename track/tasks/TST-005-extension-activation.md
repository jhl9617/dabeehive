# TST-005 — Extension Activation Validation

## Status

- Status: verified
- Priority: P0
- Area: Test
- Created At: 2026-05-06 10:26:24 KST
- Started At: 2026-05-06 10:26:24 KST
- Completed At: 2026-05-06 10:28:05 KST

## Objective

Validate VS Code extension activation readiness for the PoC control surface.

## Acceptance Criteria

- [x] Extension TypeScript no-emit check passes.
- [x] Extension compile command passes.
- [x] Activation entrypoint can be smoke-tested or an explicit Extension Host blocker is recorded.
- [x] Validation evidence and tracking updates are recorded.

## Scope

### In Scope

- VS Code extension manifest and activation entrypoint inspection.
- Extension typecheck, compile, and activation smoke/source validation.
- TST-005 tracking, log, and evidence files.

### Out of Scope

- Run Console Webview.
- Approval Panel Webview.
- Artifact/Diff view command.
- REST/MCP smoke validation.
- Full external integrations.

## Expected Files

- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/logs/2026-05-06-TST-005.md`: session log.
- `track/evidence/TST-005/validation.txt`: validation evidence.
- Optional activation smoke script if needed.

## Implementation Notes

- Do not stage generated `apps/vscode-extension/dist` unless intentionally required.
- No package dependency additions are planned.

## Dependencies / Decisions

- Depends on EXT-001 through EXT-010.
- No dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Validation-only unless a small smoke helper is required; no schema, auth, dependency, deployment, or destructive change planned.

## Changes Made

- Validated manifest activation events, command contributions, and view contributions.
- Ran extension no-emit typecheck through the workspace TypeScript executable.
- Ran extension compile command, emitting ignored `dist` output.
- Ran compiled activation entrypoint with a mocked `vscode` module and verified command/view/status bar registration.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/vscode-extension exec tsc --noEmit` | Failed | Extension package has no direct `tsc` executable; used workspace TypeScript executable instead. |
| `pnpm --filter @dabeehive/server exec tsc -p ../vscode-extension/tsconfig.json --noEmit` | Pass | Exited 0 with no compiler output. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Pass | Compiled extension to ignored `dist` output. |
| mock activation smoke via `node -e ...` | Pass | Verified 9 subscriptions, 5 commands, 3 views, and disconnected status bar text. |
| `pnpm lint` | Pass | `basic lint passed`. |

## Evidence

- `track/evidence/TST-005/validation.txt`

## Follow-up Tasks

- TST-006
