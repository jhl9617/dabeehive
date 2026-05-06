# FND-006 — Environment Example

## Status

- Status: verified
- Priority: P1
- Area: Foundation
- Created At: 2026-05-06 10:47:33 KST
- Started At: 2026-05-06 10:47:33 KST
- Completed At: 2026-05-06 10:49:28 KST

## Objective

Add a root `.env.example` containing safe placeholder values for local PoC configuration and smoke-script inputs.

## Acceptance Criteria

- [x] `.env.example` exists in the repository root.
- [x] Required environment placeholders are documented without real secrets.
- [x] Validation and tracking updates are recorded.

## Scope

### In Scope

- Root `.env.example` placeholder file.
- References to current Prisma, smoke script, and VS Code extension configuration variables.
- Placeholder-only optional future integration variables from the PRD where useful.
- Tracking, log, and evidence updates.

### Out of Scope

- Creating `.env`, `.env.local`, API keys, tokens, private keys, or production secrets.
- Implementing Jira, Slack, GitHub, OpenAI, Anthropic, Redis, auth providers, Docker Compose, or deployment behavior.
- Changing runtime env validation.

## Expected Files

- `.env.example`: placeholder environment variables.
- `track/MASTER.md`: task status update.
- `track/CURRENT.md`: active task state.
- `track/tasks/FND-006-env-example.md`: task details and validation results.
- `track/logs/2026-05-06-FND-006.md`: session log.
- `track/evidence/FND-006/validation.txt`: validation evidence.
- `track/CHANGELOG.md`: completion history.

## Implementation Notes

- The existing `.gitignore` allows `.env.example` while ignoring real `.env` files.
- The current code requires `DATABASE_URL` for Prisma and optional `DABEEHIVE_*` variables for smoke scripts.
- Extension API tokens are stored through VS Code SecretStorage, not through `.env.example`.

## Dependencies / Decisions

- No new package dependency.
- No real secrets or local-only credentials will be committed.

## Risk / Approval

- Risk Score: 10
- Approval Required: no
- Reason: documentation-only placeholder file with no real secrets, dependency changes, schema changes, or runtime behavior changes.

## Changes Made

- Added root `.env.example` with placeholder-only values for Prisma `DATABASE_URL`, REST smoke variables, MCP smoke variables, and the future approved Agent SDK adapter key placeholder.
- Documented that VS Code extension API tokens must stay in SecretStorage, not env files.
- Kept Jira/Slack/full external integration variables out of scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `test -f .env.example` | Passed | Root env example exists. |
| `rg "DATABASE_URL" .env.example` | Passed | Prisma placeholder is present. |
| `rg "DABEEHIVE_MCP_TOKEN" .env.example` | Passed | MCP smoke token placeholder is present. |
| `rg "ANTHROPIC_API_KEY" .env.example` | Passed | Agent SDK adapter placeholder is present. |
| `node -e "const fs=require('fs'); const s=fs.readFileSync('.env.example','utf8'); for (const x of ['SLACK','JIRA','demo-local-mcp-token']) if (s.includes(x)) process.exit(1);"` | Passed | Excluded integration names and the demo token literal are absent. |
| `pnpm lint` | Passed | `basic lint passed`. |
| `node scripts/track-status.mjs --task FND-006 --status verified` | Passed | Real `track/MASTER.md` was updated and summary counts recalculated. |

## Evidence

- `track/evidence/FND-006/validation.txt`

## Follow-up Tasks

- FND-007
