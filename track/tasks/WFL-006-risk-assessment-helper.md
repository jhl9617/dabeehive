# WFL-006 — Risk assessment helper

## Status

- Status: verified
- Priority: P1
- Area: Workflow
- Created At: 2026-05-06 14:23 KST
- Started At: 2026-05-06 14:23 KST
- Completed At: 2026-05-06 14:25 KST

## Objective

Add a workflow risk assessment helper that calculates a bounded risk score from changed files and uses it for final diff approval defaults.

## Acceptance Criteria

- [x] Changed files can be assessed into risk score, risk level, approval need, and reason codes.
- [x] Sensitive categories such as DB, auth/security, env/secrets, dependencies, and deploy/infra raise risk.
- [x] Final diff approval defaults to the calculated risk score when no explicit score is provided.
- [x] The implementation does not add external integrations, execute commands, alter DB schema, add dependencies, deploy, auto-merge, or build a custom AI editing engine.

## Scope

### In Scope

- Server workflow risk assessment helper.
- Final diff approval default risk score wiring.
- WFL-006 tracking, log, and evidence files.

### Out of Scope

- Sensitive file detector task WFL-007.
- Approval UI rendering task WFL-008.
- DB schema/API route changes.
- Jira, Slack, deployment, Draft PR, or automatic merge behavior.

## Expected Files

- `apps/server/src/lib/workflow/risk-assessment.ts`: risk assessment helper
- `apps/server/src/lib/workflow/final-diff-approval.ts`: default risk score integration
- `track/MASTER.md`: WFL-006 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-WFL-006.md`: session log
- `track/evidence/WFL-006/validation.txt`: validation evidence

## Implementation Notes

- Keep helper deterministic and dependency-free.
- Do not perform file reads; caller provides changed file paths/statuses.
- Return reason details for audit/approval evidence.

## Dependencies / Decisions

- Depends on WFL-004 final diff approval flow.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds workflow helper and default risk-score calculation only; no schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Added deterministic `assessChangeRisk` workflow helper.
- Added risk reason codes and scoring for DB/schema, auth/security, env/secrets, dependencies, deploy/infra, source changes, file count, and deletions.
- Added risk level and approval-required derivation.
- Wired final diff approval default risk score to `assessChangeRisk` when no explicit score is provided.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Failed, then passed | Initial no-changed-files branch returned normalized objects instead of `string[]`; fixed and final server no-emit check passed. |
| `pnpm lint` | Passed | Basic repository lint passed. |
| `rg -n "assessChangeRisk\|ChangeRiskAssessment\|riskScore\|requiresApproval\|db_schema_or_migration\|auth_or_security\|env_or_secret\|dependency_manifest\|deploy_or_infra\|file_deletion\|normalizeRiskScore" apps/server/src/lib/workflow/risk-assessment.ts apps/server/src/lib/workflow/final-diff-approval.ts` | Passed | Source check confirmed risk helper and final diff approval integration. |

## Evidence

- `track/evidence/WFL-006/validation.txt`

## Follow-up Tasks

- WFL-007
