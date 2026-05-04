# SRV-003 — API Response Helper 작성

## Status

- Status: verified
- Priority: P0
- Area: Server
- Created At: 2026-05-04 15:02:22 KST
- Started At: 2026-05-04 15:02:22 KST
- Completed At: 2026-05-04 15:04:33 KST

## Objective

Next.js Route Handler에서 재사용할 수 있는 공통 JSON success/error response helper를 추가해 PoC API 응답 형태를 일관되게 만든다.

## Acceptance Criteria

- [x] Success helper가 `{ data, meta? }` 형태의 JSON 응답을 만든다.
- [x] Error helper가 `{ error: { code, message, details? } }` 형태의 JSON 응답을 만든다.
- [x] Helper는 status/header 옵션을 지원하고 빌드 또는 타입 검증으로 확인된다.

## Scope

### In Scope

- `apps/server/src/lib/api-response.ts`
- SRV-003 tracking, log, and evidence files

### Out of Scope

- 실제 REST API route 구현
- Zod validation helper
- DB, Prisma, 인증, MCP 구현
- Jira, Slack, 자동 배포, 자동 merge, 외부 full integration
- Custom AI code editing engine

## Expected Files

- `apps/server/src/lib/api-response.ts`: API response helper
- `track/MASTER.md`: SRV-003 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/SRV-003/validation.txt`: validation evidence

## Implementation Notes

- Use Next.js `NextResponse.json` because server routes are App Router handlers.
- Match the shared API response contract structurally without cross-project runtime or type imports.
- Keep the helper small and route-agnostic.

## Dependencies / Decisions

- Depends on FND-005 shared API response types and SRV-001 Next.js server app.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: Adds an internal helper only; no route, auth, DB, schema, or dependency changes.

## Changes Made

- Added `apiSuccess` helper returning `{ data, meta? }` through `NextResponse.json`.
- Added `apiError` helper returning `{ error: { code, message, details? } }` through `NextResponse.json`.
- Added helper option types for status, headers, meta, and error details.
- Kept the helper structurally aligned with the shared API contract without adding dependencies.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed after helper implementation. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Failed then Passed | Initial type-only shared import crossed project include boundaries; local structural body types fixed it. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/SRV-003/validation.txt`

## Follow-up Tasks

- SRV-004
