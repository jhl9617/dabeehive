# SRV-004 — Zod Validation Helper 작성

## Status

- Status: verified
- Priority: P0
- Area: Server
- Created At: 2026-05-04 15:06:19 KST
- Started At: 2026-05-04 15:06:19 KST
- Completed At: 2026-05-04 15:08:25 KST

## Objective

Next.js Route Handler에서 request body, query, route params 검증에 재사용할 수 있는 Zod validation helper를 추가한다.

## Acceptance Criteria

- [x] Zod schema `safeParse` 기반의 재사용 가능한 validation helper가 있다.
- [x] 검증 실패 결과가 API error response에 넣을 수 있는 사람이 읽을 수 있는 issue 목록을 제공한다.
- [x] Helper가 build/typecheck/lint로 검증된다.

## Scope

### In Scope

- Add Zod dependency to the server package.
- `apps/server/src/lib/validation.ts`
- `apps/server/package.json`
- `pnpm-lock.yaml`
- SRV-004 tracking, log, and evidence files

### Out of Scope

- 실제 REST API route 구현
- 인증, DB, Prisma, MCP 구현
- Jira, Slack, 자동 배포, 자동 merge, 외부 full integration
- Custom AI code editing engine

## Expected Files

- `apps/server/src/lib/validation.ts`: reusable validation helper
- `apps/server/package.json`: add Zod dependency
- `pnpm-lock.yaml`: lock Zod dependency
- `track/MASTER.md`: SRV-004 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/SRV-004/validation.txt`: validation evidence

## Implementation Notes

- Use Zod 3.x as required by the PRD.
- Keep the helper independent from specific routes and DB models.
- Return structured validation results instead of throwing by default.

## Dependencies / Decisions

- Add `zod` to `@dabeehive/server` because AGENTS and PRD require Zod schema validation for server inputs.

## Risk / Approval

- Risk Score: 35
- Approval Required: yes
- Reason: Package dependency addition.
- Changed files: `apps/server/package.json`, `pnpm-lock.yaml`, `apps/server/src/lib/validation.ts`
- Diff summary: Add Zod runtime dependency and a reusable validation helper for future route handlers.
- Required reviewer action: Confirm adding Zod 3.x to the server package is acceptable for PoC validation requirements.

## Changes Made

- Added `zod` 3.x to the server package dependencies.
- Added `validateInput` helper that wraps Zod `safeParse` and returns typed success or normalized validation error results.
- Added `formatZodIssues` to produce stable issue entries with `path`, `code`, and `message`.
- Kept the helper route-agnostic so future API handlers can validate body, query, or params inputs.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server add zod@3` | Passed | Installed `zod@^3.25.76`; registry retry warning resolved. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/SRV-004/validation.txt`

## Follow-up Tasks

- SRV-005
