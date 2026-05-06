# UI-005 — Approval List Page

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 15:14:43 KST
- Started At: 2026-05-06 15:14:43 KST
- Completed At: 2026-05-06 15:17:30 KST

## Objective

Add a minimal approval list web UI page that shows pending approval records for the PoC control surface.

## Acceptance Criteria

- [x] `/approvals` renders an approval list surface in the Next.js App Router UI.
- [x] Pending approvals are visible with type, risk, issue/run context, and required action where available.
- [x] The page handles empty and unavailable database states without new integrations.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/approvals/page.js`
- Reuse existing resource list/detail CSS where possible.
- Tracking files and validation evidence for `UI-005`

### Out of Scope

- Approve/reject/request changes actions.
- Approval detail action page or form.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.

## Expected Files

- `apps/server/app/approvals/page.js`: pending approval list page.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-005/validation.txt`: validation evidence.

## Implementation Notes

- Use the existing Prisma client wrapper.
- Filter to `status: "pending"` to satisfy the pending approval list acceptance criterion.
- Keep the page read-only; UI-006 handles actions.

## Dependencies / Decisions

- Depends on `API-011`, `WFL-002`, `WFL-004`, and `UI-002`.
- No package dependency additions.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Read-only UI page and tracking changes only.

## Changes Made

- Added a dynamic read-only `/approvals` App Router page that loads pending approvals through the existing Prisma client wrapper.
- Rendered approval type, risk, changed file count, issue/run context, required action, diff summary, created time, and detail API link.
- Added explicit empty and database-unavailable states.
- Kept approval response actions out of scope for `UI-006`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/approvals` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Pending approvals\|loadPendingApprovals\|getPrismaClient\|status: \"pending\"\|Approval data unavailable\|No pending approvals\|riskScore\|changedFiles\|/api/approvals\|API record" apps/server/app/approvals/page.js` | Passed | Source check confirmed page, pending filter, data loader, empty/error state text, risk/file context, and API links. |

## Evidence

- `track/evidence/UI-005/validation.txt`

## Follow-up Tasks

- UI-006
