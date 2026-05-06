# SEC-004 — Extension SecretStorage Audit

## Status

- Status: verified
- Priority: P1
- Area: Security
- Created At: 2026-05-06 15:33:44 KST
- Started At: 2026-05-06 15:33:44 KST
- Completed At: 2026-05-06 15:36:00 KST

## Objective

Verify and guard the VS Code Extension secret handling so API tokens and provider-style sensitive values remain in `SecretStorage` and are not persisted in user/workspace settings or extension state.

## Acceptance Criteria

- [x] Extension token commands store, read, and clear the API token only through VS Code `SecretStorage`.
- [x] Extension contributed settings expose only non-sensitive configuration values.
- [x] A repeatable audit command fails if token/key settings or extension state persistence are introduced.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/vscode-extension/package.json`
- `apps/vscode-extension/src/extension.ts`
- Root validation script/package script if needed for a repeatable audit.
- SEC-004 tracking, log, and evidence files.

### Out of Scope

- Jira, Slack, or full external integrations.
- Custom AI code editing or shell loop implementation in the Extension.
- Runtime auth/session changes, DB schema changes, or production secret handling.
- New package dependencies.

## Expected Files

- `scripts/extension-secretstorage-audit.mjs`: repeatable audit for Extension secret persistence rules.
- `package.json`: audit command entry if needed.
- `track/MASTER.md`: SEC-004 status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/SEC-004/validation.txt`: validation evidence.

## Implementation Notes

- Existing Extension code uses `context.secrets.get/store/delete` for `dabeehive.apiToken`.
- Existing contributed configuration exposes `dabeehive.serverUrl`, which is non-sensitive PoC configuration.
- The audit should be dependency-free and conservative, checking for common settings/state persistence patterns that contain sensitive key names.

## Dependencies / Decisions

- No new package dependencies.
- A small Node.js audit script is sufficient for PoC regression coverage.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Adds a local validation script and tracking only; no runtime secret storage behavior, auth, or DB schema change.

## Changes Made

- Added dependency-free Extension SecretStorage audit script.
- Added root `pnpm test:extension-secrets` command.
- Confirmed existing Extension API token handling uses `context.secrets.get/store/delete`.
- Confirmed contributed Extension configuration remains limited to non-sensitive `dabeehive.serverUrl`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm test:extension-secrets` | Passed | Audit checked 1 contributed setting and 3 TypeScript source files. |
| `pnpm --filter @dabeehive/vscode-extension run compile` | Passed | Extension TypeScript compile completed. |
| `pnpm lint` | Passed | Basic lint passed. |
| `pnpm track:status -- --task SEC-004 --status verified --dry-run` | Passed | MASTER summary shows verified=117, in_progress=0, not_started=6. |

## Evidence

- `track/evidence/SEC-004/validation.txt`

## Follow-up Tasks

- SEC-005
