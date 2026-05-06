# UI-007 — Artifact Viewer

## Status

- Status: verified
- Priority: P2
- Area: UI
- Created At: 2026-05-06 15:23:36 KST
- Started At: 2026-05-06 15:23:36 KST
- Completed At: 2026-05-06 15:25:58 KST

## Objective

Add a minimal artifact viewer that can display stored markdown-like, test, diff, review, and log artifact content from existing Orchestrator data.

## Acceptance Criteria

- [x] `/artifacts/[id]` renders artifact metadata and content when available.
- [x] Markdown/test/diff/log style artifact content is readable in a fixed-width viewer.
- [x] Run detail artifact entries link to the artifact viewer.
- [x] Missing/unavailable artifact states and validation/tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/artifacts/[id]/page.js`
- `apps/server/app/runs/[id]/page.js`
- Small CSS additions in `apps/server/app/globals.css` for artifact content viewing.
- Tracking files and validation evidence for `UI-007`

### Out of Scope

- Artifact create/edit/delete flows.
- Full Markdown parsing dependency.
- External artifact fetch/render integrations.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.

## Expected Files

- `apps/server/app/artifacts/[id]/page.js`: artifact detail viewer.
- `apps/server/app/runs/[id]/page.js`: link run artifact entries to the viewer.
- `apps/server/app/globals.css`: viewer styling.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-007/validation.txt`: validation evidence.

## Implementation Notes

- Use the existing Prisma client wrapper.
- Render content as escaped text in `pre` blocks rather than adding a Markdown parser.
- Show artifact URI when inline content is absent.

## Dependencies / Decisions

- Depends on `API-013`, `DB-009`, and `UI-004`.
- No package dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Read-only UI viewer and link updates only.

## Changes Made

- Added a dynamic `/artifacts/[id]` viewer that loads artifact metadata, run/issue context, inline content, URI fallback, and metadata through the existing Prisma client wrapper.
- Added fixed-width artifact content styling for markdown/test/diff/review/log text.
- Linked run detail artifact entries to the new artifact viewer route.
- Added missing and database-unavailable states.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/artifacts/[id]` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Artifact viewer\|loadArtifact\|getPrismaClient\|Artifact data unavailable\|Artifact not found\|artifact-content\|metadata-preview\|/api/artifacts\|Open artifact viewer\|/artifacts/" 'apps/server/app/artifacts/[id]/page.js' 'apps/server/app/runs/[id]/page.js' apps/server/app/globals.css` | Passed | Source check confirmed viewer route, loader, unavailable/missing states, content/metadata CSS, API link, and run detail viewer links. |

## Evidence

- `track/evidence/UI-007/validation.txt`

## Follow-up Tasks

- UI-008
