# SRV-002 — 기본 Layout/Page 구성

## Status

- Status: verified
- Priority: P0
- Area: Server
- Created At: 2026-05-04 14:55:22 KST
- Started At: 2026-05-04 14:55:22 KST
- Completed At: 2026-05-04 14:59:38 KST

## Objective

Next.js App Router 서버 앱에 기본 전역 스타일과 홈 페이지 구성을 추가해 브라우저에서 PoC 서버 상태 페이지가 렌더링되도록 한다.

## Acceptance Criteria

- [x] `apps/server/app/layout.js`가 전역 스타일을 적용하고 기본 문서 메타데이터를 제공한다.
- [x] `apps/server/app/page.js`가 PoC 서버 상태를 확인할 수 있는 홈 페이지를 렌더링한다.
- [x] 렌더링/빌드 가능한 상태가 검증되고 추적 파일에 결과가 기록된다.

## Scope

### In Scope

- `apps/server/app/layout.js`
- `apps/server/app/page.js`
- `apps/server/app/globals.css`
- SRV-002 tracking, log, and evidence files

### Out of Scope

- REST API route 구현
- DB, Prisma, 인증, MCP 구현
- Jira, Slack, 자동 배포, 자동 merge, 외부 full integration
- Custom AI code editing engine

## Expected Files

- `apps/server/app/layout.js`: global stylesheet import and app metadata
- `apps/server/app/page.js`: basic rendered home/status page
- `apps/server/app/globals.css`: minimal responsive global styling
- `track/MASTER.md`: SRV-002 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/SRV-002/validation.txt`: validation evidence

## Implementation Notes

- Keep the UI small and utilitarian for PoC scope.
- Do not add new dependencies.
- Reuse the App Router structure created in SRV-001.

## Dependencies / Decisions

- Depends on SRV-001 Next.js App Router app initialization.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: Static layout/page styling only, no public API, DB, auth, or dependency changes.

## Changes Made

- Imported `apps/server/app/globals.css` from the root App Router layout.
- Added minimal responsive global styling for the server PoC home/status surface.
- Replaced the placeholder home page with a rendered server status page and PoC module cards.
- Verified production build, root lint, and a local HTTP 200 smoke check.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build compiled and prerendered `/`. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |
| `pnpm --filter @dabeehive/server dev --hostname 127.0.0.1 --port 13002` | Passed | Dev server started for smoke test and was stopped after HTTP check. |
| `curl -sS -I http://127.0.0.1:13002` | Passed | Returned `HTTP/1.1 200 OK`. |

## Evidence

- `track/evidence/SRV-002/validation.txt`

## Follow-up Tasks

- SRV-003
