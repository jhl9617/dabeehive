# DB-008 — Approval 모델 정의

## Status

- Status: verified
- Priority: P0
- Area: DB
- Created At: 2026-05-04 15:40:17 KST
- Started At: 2026-05-04 15:40:17 KST
- Completed At: 2026-05-04 15:41:43 KST

## Objective

Prisma schema에 Approval 모델을 추가해 spec/final/risk approval 기록과 reviewer 응답 이력을 저장할 수 있게 한다.

## Acceptance Criteria

- [x] `Approval` 모델이 type/status/reason/diffSummary/riskScore/requiredAction 필드를 가진다.
- [x] `Approval` 모델이 Issue/AgentRun/User와 선택 관계를 가진다.
- [x] Prisma validate/generate 및 build/typecheck/lint 결과가 기록된다.

## Scope

### In Scope

- `apps/server/prisma/schema.prisma`
- `track/RISKS.md`
- DB-008 tracking, log, and evidence files

### Out of Scope

- Artifact model
- approval API routes or UI
- notification integrations
- migrations or migration apply
- real database connection or production secret access
- Jira, Slack, automatic deploy, automatic merge, external full integration

## Expected Files

- `apps/server/prisma/schema.prisma`: add `Approval` model and relations
- `track/RISKS.md`: record DB schema model risk
- `track/MASTER.md`: DB-008 status updates
- `track/CURRENT.md`: active task state
- `track/evidence/DB-008/validation.txt`: validation evidence

## Implementation Notes

- Keep approval type/status string-based for PoC flexibility.
- Include risk score and diff summary because approval/risk rules require those records.
- Do not create or apply migrations in this task.

## Dependencies / Decisions

- Depends on DB-002 User, DB-004 Issue, and DB-006 AgentRun models.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 50
- Approval Required: yes
- Reason: DB schema file change.
- Changed files: `apps/server/prisma/schema.prisma`, `track/RISKS.md`
- Diff summary: Add `Approval` model with optional issue/run/requester/responder relations and risk metadata.
- Required reviewer action: Confirm approval schema basics are acceptable before migration tasks are introduced.

## Changes Made

- Added `Approval` model with type, status, reason, changedFiles, diffSummary, riskScore, requiredAction, response timestamp, and audit timestamps.
- Added optional Issue, AgentRun, requester User, and responder User relations.
- Added relation lists on User, Issue, and AgentRun.
- Added indexes for approval lookup by issue, run, status, type, requester, and responder.

## Validation

| Command | Result | Notes |
|---|---|---|
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma validate --schema prisma/schema.prisma` | Passed | Schema is valid. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/dabeehive pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma` | Passed | Generated Prisma Client v6.19.3 under ignored `node_modules`. |
| `pnpm --filter @dabeehive/server build` | Passed | Next.js build completed. |
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Direct TypeScript check completed with no output. |
| `pnpm lint` | Passed | `scripts/lint-basic.mjs` completed successfully. |

## Evidence

- `track/evidence/DB-008/validation.txt`

## Follow-up Tasks

- DB-009
