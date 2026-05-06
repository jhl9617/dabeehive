# UI-004 — Run Detail Page

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 15:10:07 KST
- Started At: 2026-05-06 15:10:07 KST
- Completed At: 2026-05-06 15:13:09 KST

## Objective

Add a minimal run detail web UI page that shows run status, recent events, and artifacts from existing Orchestrator data.

## Acceptance Criteria

- [x] `/runs/[id]` renders a run detail surface in the Next.js App Router UI.
- [x] The page shows run status, event records, and artifact records when available.
- [x] The page handles missing runs and unavailable database states without new integrations.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/runs/[id]/page.js`
- Minimal shared CSS additions in `apps/server/app/globals.css` if needed for detail sections.
- Tracking files and validation evidence for `UI-004`

### Out of Scope

- Run list page.
- Run start/cancel controls.
- Live SSE client behavior.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.

## Expected Files

- `apps/server/app/runs/[id]/page.js`: run detail page.
- `apps/server/app/globals.css`: small detail-list styling if required.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-004/validation.txt`: validation evidence.

## Implementation Notes

- Use the existing Prisma client wrapper.
- Keep the page read-only and dynamic.
- Limit event/artifact rendering to bounded recent records.

## Dependencies / Decisions

- Depends on `API-009`, `API-010`, `API-013`, and `UI-002`.
- No package dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Read-only dynamic UI page and small CSS additions only.

## Changes Made

- Added a dynamic read-only `/runs/[id]` App Router page that loads one run through the existing Prisma client wrapper.
- Rendered run status, project/issue/model metadata, timing fields, and event/artifact/approval counts.
- Rendered bounded recent event and artifact lists, with metadata/content previews.
- Added explicit run-not-found and database-unavailable states.
- Added small reusable detail-list CSS for run evidence sections.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/runs/[id]` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Run detail\|loadRun\|getPrismaClient\|Run data unavailable\|Run not found\|Recent events\|Artifacts\|detail-grid\|metadata-preview\|_count\|/api/runs" 'apps/server/app/runs/[id]/page.js' apps/server/app/globals.css` | Passed | Source check confirmed page, data loader, status/error states, event/artifact sections, counts, and CSS hooks. |

## Evidence

- `track/evidence/UI-004/validation.txt`

## Follow-up Tasks

- UI-005
