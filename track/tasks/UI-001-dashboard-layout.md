# UI-001 — Dashboard Layout

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 14:50:16 KST
- Started At: 2026-05-06 14:50:16 KST
- Completed At: 2026-05-06 14:57:46 KST

## Objective

Replace the basic home page with a minimal operational dashboard layout that links to the PoC project, issue, run, approval, artifact, and API surfaces.

## Acceptance Criteria

- [x] The home page presents a dashboard layout rather than a landing-style hero.
- [x] The layout includes clear navigation/access links for projects, issues, runs, approvals, artifacts, REST health, and MCP endpoint.
- [x] The dashboard remains responsive without adding external dependencies or broad UI framework changes.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Server App Router home page markup.
- Global CSS needed for the dashboard layout.
- Build/lint/source validation.

### Out of Scope

- New data-fetching pages, DB-backed lists, auth/session UI, Jira, Slack, full external integrations, custom AI editing engine, package dependencies, deployment, automatic merge.

## Expected Files

- `apps/server/app/page.js`: dashboard home layout.
- `apps/server/app/globals.css`: dashboard styling.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/UI-001-dashboard-layout.md`: task details and validation results.
- `track/logs/2026-05-06-UI-001.md`: session log.
- `track/evidence/UI-001/validation.txt`: validation evidence.

## Implementation Notes

- Keep the dashboard static for this task; later UI tasks add list/detail pages.
- Use existing App Router JavaScript files and CSS conventions.
- Avoid decorative landing-page treatment; this should feel like an operational control surface.

## Dependencies / Decisions

- Depends on existing API routes and artifact/approval/run concepts.
- No package dependency additions.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Static UI markup/style changes only; no API, schema, auth, dependency, deployment, or destructive changes.

## Changes Made

- Replaced the static home page hero with a sidebar/dashboard layout.
- Added navigation links for projects, issues, runs, approvals, artifacts, REST health, MCP, runs API, and approvals API.
- Added responsive dashboard CSS while preserving existing error/not-found state page styles.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | First run passed with CSS warning; fixed `align-items` and second run passed cleanly. |
| `pnpm lint` | Passed | Root basic lint passed. |
| `rg -n "dashboard-shell\|dashboard-sidebar\|dashboard-nav\|dashboard-main\|status-strip\|link-grid\|workflow-panel\|/projects\|/issues\|/runs\|/approvals\|/api/artifacts\|/api/health\|/api/mcp" apps/server/app/page.js apps/server/app/globals.css` | Passed | Source check confirmed dashboard layout and access links. |

## Evidence

- `track/evidence/UI-001/validation.txt`

## Follow-up Tasks

- UI-002
