# UI-002 — Project List Page

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 15:00:59 KST
- Started At: 2026-05-06 15:00:59 KST
- Completed At: 2026-05-06 15:03:55 KST

## Objective

Add a minimal web UI page that renders the orchestrator project list from the existing Prisma-backed project model.

## Acceptance Criteria

- [x] `/projects` renders a project list surface in the Next.js App Router UI.
- [x] The page handles empty and unavailable database states without introducing new integrations.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/projects/page.js`
- `apps/server/app/globals.css`
- Tracking files and validation evidence for `UI-002`

### Out of Scope

- Project create/edit forms.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.
- Authentication/session changes.

## Expected Files

- `apps/server/app/projects/page.js`: project list page.
- `apps/server/app/globals.css`: minimal reusable resource list styling.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-002/validation.txt`: validation evidence.

## Implementation Notes

- Use the existing Prisma client wrapper.
- Keep the page read-only and dynamic so it reflects local database state.
- Provide explicit empty and database-unavailable states for PoC demo resilience.

## Dependencies / Decisions

- Depends on `API-002` and `DB-003` being available.
- No package dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Read-only UI page and CSS additions only.

## Changes Made

- Added a dynamic read-only `/projects` App Router page that loads projects through the existing Prisma client wrapper.
- Rendered status, repository/workspace metadata, updated time, and related issue/run/document counts.
- Added explicit empty and database-unavailable states.
- Added responsive resource list CSS aligned with the existing dashboard styling.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/projects` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "resource-shell\|resource-list\|Project list\|loadProjects\|getPrismaClient\|Project data unavailable\|/api/projects\|_count" apps/server/app/projects/page.js apps/server/app/globals.css` | Passed | Source check confirmed page, data loader, empty/error state text, API link, counts, and CSS hooks. |

## Evidence

- `track/evidence/UI-002/validation.txt`

## Follow-up Tasks

- UI-003
