# UI-009 — Korean Page Copy

## Status

- Status: verified
- Priority: P2
- Area: UI
- Created At: 2026-05-06 16:57:53 KST
- Started At: 2026-05-06 16:57:53 KST
- Completed At: 2026-05-06 17:06:42 KST

## Objective

Localize the server App Router pages so visible page copy is Korean for the PoC dashboard and resource views.

## Acceptance Criteria

- [x] The root dashboard page uses Korean visible labels, summaries, status text, and workflow copy.
- [x] List/detail/state pages use Korean headings, empty/error text, actions, labels, fallback text, and locale date formatting.
- [x] HTML language/metadata reflect Korean page presentation.
- [x] Validation and tracking evidence are recorded.

## Scope

### In Scope

- `apps/server/app` page/state files with user-visible text.
- Korean locale date formatting for page display.
- Terse copy-only adjustments needed for Korean labels to fit existing UI.
- UI-009 tracking, session log, evidence, and changelog updates.

### Out of Scope

- API response message localization.
- Database seed content localization.
- VS Code extension UI localization.
- External integrations, deployment, automatic merge, production secrets, or custom AI code editing engine.
- Broad visual redesign or component refactor.

## Expected Files

- `apps/server/app/layout.js`
- `apps/server/app/page.js`
- `apps/server/app/error.js`
- `apps/server/app/loading.js`
- `apps/server/app/not-found.js`
- `apps/server/app/projects/page.js`
- `apps/server/app/issues/page.js`
- `apps/server/app/approvals/page.js`
- `apps/server/app/approvals/[id]/page.js`
- `apps/server/app/artifacts/[id]/page.js`
- `apps/server/app/runs/[id]/page.js`
- `track/evidence/UI-009/validation.txt`
- `track/MASTER.md`
- `track/CURRENT.md`
- `track/CHANGELOG.md`

## Implementation Notes

- Preserve route behavior, data fetching, API links, and DB access.
- Translate visible UI copy only; keep enum/status values raw when they are persisted domain values unless used as labels.
- Use `ko-KR`/`ko` for page display locale.

## Dependencies / Decisions

- No new dependency.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Copy-only UI localization with no schema, auth, dependency, deployment, or integration changes.
- Changed files:
  - `apps/server/app/*`
- Diff summary: Korean-localize visible server pages.
- Required reviewer action: Review page copy in browser.

## Changes Made

- Korean-localized visible copy on the root dashboard, global loading/error/not-found states, and Prisma-backed project/issue/run/approval/artifact pages.
- Added display-format helpers for persisted status/type/priority/role enum labels while preserving raw data values and route/API behavior.
- Updated HTML language metadata to Korean and used Korean date formatting for page display.
- Review pass fixed the issue list project-status formatter so project status values do not fall back to raw English enum strings.
- Recorded validation evidence for build, lint, tracking dry-run, whitespace check, and temporary stack smoke.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Pass | Next.js production build completed; existing TypeScript project reference warning did not fail the build. |
| `pnpm lint` | Pass | `basic lint passed`. |
| `pnpm track:status -- --task UI-009 --status verified --dry-run` | Pass | Dry-run reported `UI-009 in_progress -> verified`; summary would become `verified=127`. |
| `git diff --check` | Pass | No whitespace errors. |
| `pnpm dev:temp -- --smoke` | Pass | Temporary PGlite stack generated Prisma client, migrated, seeded, served health OK, and cleaned up. |

## Evidence

- `track/evidence/UI-009/validation.txt`

## Follow-up Tasks

- Optional browser screenshot review can be added separately if visual QA is requested.
