# UI-003 — Issue List Page

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 15:06:20 KST
- Started At: 2026-05-06 15:06:20 KST
- Completed At: 2026-05-06 15:08:28 KST

## Objective

Add a minimal web UI page that renders orchestrator issues and provides a clear create-issue entry point without implementing a full form.

## Acceptance Criteria

- [x] `/issues` renders an issue list surface in the Next.js App Router UI.
- [x] The page includes a visible create issue button or action entry point.
- [x] The page handles empty and unavailable database states without introducing new integrations.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/issues/page.js`
- Reuse or minimally extend existing resource list CSS in `apps/server/app/globals.css`
- Tracking files and validation evidence for `UI-003`

### Out of Scope

- Full issue create/edit form.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.
- Authentication/session changes.

## Expected Files

- `apps/server/app/issues/page.js`: issue list page.
- `apps/server/app/globals.css`: only if needed for small issue-list styling hooks.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-003/validation.txt`: validation evidence.

## Implementation Notes

- Use the existing Prisma client wrapper.
- Keep the create action as an entry point to the existing API, not a full create workflow.
- Reuse the resource page styling added for `UI-002` where possible.

## Dependencies / Decisions

- Depends on `API-004`, `DB-004`, and `UI-002`.
- No package dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Read-only UI page with a create action link and no schema/auth/integration changes.

## Changes Made

- Added a dynamic read-only `/issues` App Router page that loads issues through the existing Prisma client wrapper.
- Rendered issue status, project, type/priority, assignee, labels, project status, updated time, and related run/approval/artifact counts.
- Added a visible `Create Issue` action entry point to the existing Issue API surface.
- Added explicit empty and database-unavailable states.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/issues` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Issue list\|Create Issue\|loadIssues\|getPrismaClient\|Issue data unavailable\|resource-list\|_count\|summarizeBody\|/api/issues" apps/server/app/issues/page.js` | Passed | Source check confirmed page, create action, data loader, empty/error state text, counts, body summary, and API link. |

## Evidence

- `track/evidence/UI-003/validation.txt`

## Follow-up Tasks

- UI-004
