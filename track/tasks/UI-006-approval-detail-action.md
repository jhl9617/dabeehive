# UI-006 — Approval Detail Action

## Status

- Status: verified
- Priority: P1
- Area: UI
- Created At: 2026-05-06 15:19:19 KST
- Started At: 2026-05-06 15:19:19 KST
- Completed At: 2026-05-06 15:21:59 KST

## Objective

Add a minimal approval detail page that allows a pending approval to be approved or rejected from the web UI.

## Acceptance Criteria

- [x] `/approvals/[id]` renders approval detail and review evidence.
- [x] Pending approvals can be approved.
- [x] Pending approvals can be rejected.
- [x] Missing/unavailable approval states and validation/tracking updates are recorded.

## Scope

### In Scope

- `apps/server/app/approvals/[id]/page.js`
- Small CSS additions in `apps/server/app/globals.css` for the action form.
- Tracking files and validation evidence for `UI-006`

### Out of Scope

- Authentication/session changes or responder identity selection.
- Request-changes workflow beyond existing API capability.
- Jira, Slack, or full external integrations.
- Custom AI code editing engine or SDK runner behavior.

## Expected Files

- `apps/server/app/approvals/[id]/page.js`: approval detail and approve/reject actions.
- `apps/server/app/globals.css`: action form styling.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/evidence/UI-006/validation.txt`: validation evidence.

## Implementation Notes

- Use a server action with the existing Prisma client wrapper.
- Map approve/reject actions to existing approval status values.
- Keep `respondedById` null because auth/responder identity is outside this task.

## Dependencies / Decisions

- Depends on `API-011`, `API-012`, `UI-005`, and the Approval Prisma model.
- No package dependency additions.

## Risk / Approval

- Risk Score: 15
- Approval Required: no
- Reason: Bounded approval status write using existing data model; no schema, auth, package, or integration changes.

## Changes Made

- Added a dynamic `/approvals/[id]` approval detail page with evidence, changed files, status, risk, and context fields.
- Added a server action that maps approve/reject form submissions to existing `approved` and `rejected` approval statuses.
- Revalidated `/approvals` and `/approvals/[id]` after a successful response.
- Added pending-only approve/reject form styling and action status banners.
- Kept `respondedById` null because auth/responder identity remains out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server run build` | Passed | Next production build completed and `/approvals/[id]` is listed as dynamic. |
| `pnpm lint` | Passed | Repository basic lint passed. |
| `rg -n "Approval detail\|respondApproval\|status = action === \"approve\"\|approved\|rejected\|action-form\|action-row\|Approval action failed\|Approval updated\|/api/approvals\|revalidatePath" 'apps/server/app/approvals/[id]/page.js' apps/server/app/globals.css` | Passed | Source check confirmed detail route, server action, status mapping, action states, links, and CSS hooks. |
| `rg -n "Approve\|Reject\|name=\"action\"\|value=\"approve\"\|value=\"reject\"\|respondedAt\|respondedById" 'apps/server/app/approvals/[id]/page.js'` | Passed | Source check confirmed approve/reject form controls and response fields. |

## Evidence

- `track/evidence/UI-006/validation.txt`

## Follow-up Tasks

- UI-007
