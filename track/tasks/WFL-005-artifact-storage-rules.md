# WFL-005 — Artifact Storage Rules

## Status

- Status: verified
- Priority: P0
- Area: Workflow
- Created At: 2026-05-04 19:21:15 KST
- Started At: 2026-05-04 19:21:15 KST
- Completed At: 2026-05-04 19:23:07 KST

## Objective

Add artifact storage rules for plan, diff, test report, and review artifacts.

## Acceptance Criteria

- [x] `storeRunArtifact` exists.
- [x] Helper stores `plan`, `diff`, `test_report`, and `review` artifacts with normalized title/content/metadata.
- [x] Typecheck/lint, smoke, and source checks are recorded.

## Scope

### In Scope

- `apps/server/src/lib/workflow/artifact-storage.ts`
- WFL-005 tracking, log, and evidence files

### Out of Scope

- API route changes
- database schema changes
- approval flows
- SDK invocation
- VS Code UI
- AI patch engine, file edit loop, or shell tool loop
- Jira, Slack, GitHub full integrations, automatic deploy, automatic merge
- package dependency additions

## Expected Files

- `apps/server/src/lib/workflow/artifact-storage.ts`: run artifact storage helper
- `track/MASTER.md`: WFL-005 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-04-WFL-005.md`: session log
- `track/evidence/WFL-005/validation.txt`: validation evidence

## Implementation Notes

- Do not add npm package dependencies in this task.
- Keep the workflow helper deterministic and framework-neutral.
- Do not add a new API route or modify DB schema in this task.

## Dependencies / Decisions

- Depends on existing `Artifact` Prisma model and artifact type vocabulary.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 30
- Approval Required: no
- Reason: Adds a server helper that writes an existing Artifact model shape only; no schema, auth, public route, package dependency, deployment, or destructive changes.

## Changes Made

- Added `storeRunArtifact` and `buildRunArtifactData`.
- Restricted workflow artifact types to `plan`, `diff`, `test_report`, and `review`.
- Normalized default titles, optional content/uri, metadata, issue link, and required content-or-uri validation.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Server typecheck completed with no output. |
| artifact storage helper smoke via `pnpm --filter @dabeehive/server exec node` | Passed | Transpiled and executed `artifact-storage.ts`, then verified fake Prisma `artifact.create()` received normalized `test_report` data and content-or-uri validation. |
| `pnpm lint` | Passed | `basic lint passed`. |
| source `rg` checks for `storeRunArtifact` | Passed | Found helper, data builder, workflow artifact type, test report type, task references, and source path. |

## Evidence

- `track/evidence/WFL-005/validation.txt`

## Follow-up Tasks

- GIT-001
