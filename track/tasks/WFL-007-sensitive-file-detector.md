# WFL-007 — Sensitive File Detector

## Status

- Status: verified
- Priority: P1
- Area: Workflow
- Created At: 2026-05-06 14:29:33 KST
- Started At: 2026-05-06 14:29:33 KST
- Completed At: 2026-05-06 14:36:00 KST

## Objective

Add a workflow helper that detects sensitive changed files, focused on auth/security, database schema or migration, and deployment or infrastructure paths.

## Acceptance Criteria

- [x] Changed files are classified when they touch auth/security, DB schema or migration, or deploy/infra paths.
- [x] The detector returns matched files, category metadata, and approval requirement data for workflow use.
- [x] Existing risk assessment uses the detector instead of duplicating auth/db/deploy path rules.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Server workflow helper for sensitive changed-file classification.
- Risk assessment wiring for auth/db/deploy categories.
- TypeScript/lint validation and source checks.

### Out of Scope

- Jira, Slack, deployment, Draft PR, automatic merge, or full external integrations.
- Custom AI code editing engine or VS Code patch/shell loop.
- DB schema, migration, package dependency, auth behavior, or deployment config changes.

## Expected Files

- `apps/server/src/lib/workflow/sensitive-file-detector.ts`: sensitive file detector helper.
- `apps/server/src/lib/workflow/risk-assessment.ts`: reuse detector categories.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/WFL-007-sensitive-file-detector.md`: task details and validation results.
- `track/logs/2026-05-06-WFL-007.md`: session log.
- `track/evidence/WFL-007/validation.txt`: validation evidence.

## Implementation Notes

- Keep detection path-based and deterministic for PoC scope.
- Do not add dependencies.
- Treat auth/security, DB schema/migration, and deploy/infra matches as approval-requiring sensitive categories.

## Dependencies / Decisions

- Depends on WFL-006 risk assessment helper.
- No package dependency additions.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds workflow detection helper only; no schema, auth behavior, dependency, deployment, or destructive changes.

## Changes Made

- Added `detectSensitiveFiles`, `isSensitiveFilePath`, category types, match metadata, and approval requirement output for auth/security, DB schema/migration, and deploy/infra paths.
- Refactored risk assessment to build auth/db/deploy risk reasons from the sensitive file detector.
- Preserved env/secret, dependency, source, volume, and deletion risk handling outside the detector.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server TypeScript no-emit check completed successfully. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "detectSensitiveFiles\|SensitiveFileCategory\|SENSITIVE_FILE_RULES\|isSensitiveFilePath\|buildSensitiveFileReasons\|SENSITIVE_RISK_IMPACTS\|auth_or_security\|db_schema_or_migration\|deploy_or_infra" apps/server/src/lib/workflow/sensitive-file-detector.ts apps/server/src/lib/workflow/risk-assessment.ts` | Passed | Source check confirmed detector exports and risk assessment integration. |

## Evidence

- `track/evidence/WFL-007/validation.txt`

## Follow-up Tasks

- WFL-008
