# DB-009 — Artifact 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:43:30 KST
- Started At: 2026-05-04 15:43:30 KST
- Completed At: 2026-05-04 15:46:24 KST

## Objective

Prisma schema에 Artifact 모델을 추가해 run 산출물인 plan, diff, test_report, pr_url을 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `Artifact` 모델이 type/title/content/uri/metadata 필드를 가진다.
- [x] `Artifact` 모델이 `AgentRun`과 관계를 가지고 필요 시 `Issue`와 연결된다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-009 tracking, log, and evidence files

### Out of Scope

- Artifact API routes or storage backend
- file upload/download implementation
- GitHub PR creation or external integration
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `Artifact` model and run/issue relations
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-009 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-009/validation.txt`: validation evidence

## Implementation Notes

- Store artifact body as optional text and structured metadata as JSON.
- Store external or file references in `uri`; do not implement storage or PR creation in this task.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-004 Issue and DB-006 AgentRun models.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 45
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `Artifact` model with AgentRun relation and optional Issue relation for plan/diff/test_report/pr_url storage.
- Required reviewer action: Confirm artifact schema basics are acceptable before migration tasks are introduced.

## Changes Made

- Added Prisma `Artifact` model with `type`, `title`, `content`, `uri`, and `metadata` fields.
- Added required `AgentRun` relation and optional `Issue` relation for artifact lookup.
- Added indexes for run, issue, type, and run/type queries.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Prisma Client v6.19.3 generated. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js production build succeeded. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | TypeScript noEmit completed. |
| `pnpm lint` | Passed | Basic lint passed. |

## Evidence

- `track/evidence/DB-009/validation.txt`

## Follow-up Tasks

- API-001
