# FND-007 — README PoC Local Run Guide

## Status

- Status: verified
- Priority: P1
- Area: Foundation
- Created At: 2026-05-06 10:51:22 KST
- Started At: 2026-05-06 10:51:22 KST
- Completed At: 2026-05-06 10:53:23 KST

## Objective

Add a root README that documents local setup, environment placeholders, server startup, validation commands, smoke tests, and known local blockers for the PoC.

## Acceptance Criteria

- [x] Root `README.md` exists.
- [x] Local setup and run order are documented.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Root README with local PoC run instructions.
- References to pnpm, `.env.example`, Prisma migration/seed, Next.js server, REST/MCP smoke scripts, VS Code extension compile, and SDK fake run smoke.
- Known blocker note for missing local PostgreSQL/Docker.
- Tracking, log, and evidence updates.

### Out of Scope

- Implementing Docker Compose, deployment, Jira, Slack, or full external integrations.
- Changing package scripts or runtime code.
- Adding real secrets or production configuration.

## Expected Files

- `README.md`: local setup and run guide.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/FND-007-readme-local-run.md`: task details and validation results.
- `track/logs/2026-05-06-FND-007.md`: session log.
- `track/evidence/FND-007/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- Keep README aligned with the current PoC state: DB-backed smoke tests are implemented but blocked unless PostgreSQL is available.
- Do not document Slack/Jira setup as supported PoC behavior.

## Dependencies / Decisions

- No new package dependency.
- Depends on FND-006 `.env.example`.

## Risk / Approval

- Risk Score: 5
- Approval Required: no
- Reason: documentation-only change with no runtime behavior, dependencies, schema, or secret changes.

## Changes Made

- Added root `README.md` with PoC scope, workspace structure, prerequisites, setup, database, server, validation, REST/MCP smoke, VS Code extension, known blocker, and tracking sections.
- Documented that DB-backed smoke and E2E validation require reachable PostgreSQL.
- Kept Jira/Slack setup and full external integration instructions out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `test -f README.md` | Passed | Root README exists. |
| `rg "pnpm install" README.md` | Passed | Setup command is documented. |
| `rg "prisma migrate deploy" README.md` | Passed | DB migration command and blocker note are documented. |
| `rg "MCP" README.md` | Passed | MCP scope and smoke flow are documented. |
| `node -e "const fs=require('fs'); const s=fs.readFileSync('README.md','utf8'); for (const x of ['SLACK_','JIRA_']) if (s.includes(x)) process.exit(1);"` | Passed | No Slack/Jira env setup variables are documented. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `node scripts/track-status.mjs --task FND-007 --status verified` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |

## Evidence

- `track/evidence/FND-007/validation.txt`

## Follow-up Tasks

- SRV-006
