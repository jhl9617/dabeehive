# SRV-005 — Prisma Client Singleton 작성

## Status

- Status: verified
- Priority: P0
- Area: Server
- Created At: 2026-05-04 15:10:21 KST
- Started At: 2026-05-04 15:10:21 KST
- Completed At: 2026-05-04 15:13:08 KST

## Objective

Orchestrator Server에서 DB 접근 시 사용할 Prisma client import 경로와 development hot-reload 안전 singleton wrapper를 추가한다.

## Acceptance Criteria

- [x] `apps/server/src/lib/db/prisma.ts`에서 Prisma client singleton을 export한다.
- [x] Development 환경에서 `globalThis` cache를 사용해 client 재생성을 줄인다.
- [x] Helper가 build/typecheck/lint로 검증된다.

## Scope

### In Scope

- Add `@prisma/client` 6.x to the server package.
- `apps/server/src/lib/db/prisma.ts`
- `apps/server/package.json`
- `pnpm-lock.yaml`
- SRV-005 tracking, log, and evidence files

### Out of Scope

- Prisma CLI 설치
- `prisma/schema.prisma` 생성
- migration 실행
- DB model 정의
- 실제 repository CRUD 구현
- 인증, MCP, Jira/Slack, 자동 배포, 자동 merge, 외부 full integration
- Custom AI code editing engine

## Expected Files

- `apps/server/src/lib/db/prisma.ts`: Prisma client singleton
- `apps/server/package.json`: add `@prisma/client` dependency
- `pnpm-lock.yaml`: lock Prisma client dependency
- `track/MASTER.md`: SRV-005 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/SRV-005/validation.txt`: validation evidence

## Implementation Notes

- Use Prisma 6.x as required by the PRD.
- Keep schema initialization for DB-001; this task only establishes the DB client import path.
- Avoid route changes so no DB connection is attempted during this task.

## Dependencies / Decisions

- Add `@prisma/client` to `@dabeehive/server` because AGENTS requires DB access through a Prisma client wrapper and SRV-005 acceptance requires the client import path.

## Risk / Approval

- Risk Score: 40
- Approval Required: yes
- Reason: Package dependency addition.
- Changed files: `apps/server/package.json`, `pnpm-lock.yaml`, `apps/server/src/lib/db/prisma.ts`
- Diff summary: Add Prisma client runtime dependency and a singleton wrapper path for future DB access.
- Required reviewer action: Confirm adding `@prisma/client` 6.x before DB-001 schema initialization is acceptable for PoC sequencing.

## Changes Made

- Added `@prisma/client` 6.x to the server package dependencies.
- Added `apps/server/src/lib/db/prisma.ts` with a lazy `getPrismaClient` singleton factory.
- Cached the Prisma client on `globalThis` outside production to reduce development hot-reload client recreation.
- Kept schema initialization, Prisma CLI, and migrations deferred to DB-001.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server add @prisma/client@6` | Passed | Installed `@prisma/client@^6.19.3`. |
| `pnpm --filter @dabeehive/server build` | Failed then Passed | Initial eager `PrismaClient` import failed before schema/generate; lazy factory passed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Failed then Passed | Same generated-client type export issue; lazy factory passed. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/SRV-005/validation.txt`

## Follow-up Tasks

- SRV-006
