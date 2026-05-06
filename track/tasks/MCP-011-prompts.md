# MCP-011 — MCP prompts

## Status

- Status: verified
- Priority: P1
- Area: MCP
- Created At: 2026-05-06 12:20:20 KST
- Started At: 2026-05-06 12:20:20 KST
- Completed At: 2026-05-06 12:22:28 KST

## Objective

Add PoC MCP prompts for implementation planning and diff review so MCP clients can request consistent orchestrator-oriented prompt templates.

## Acceptance Criteria

- [x] MCP `implementation-plan` prompt exists with bounded arguments.
- [x] MCP `review-diff` prompt exists with bounded arguments.
- [x] Prompts stay provider-neutral and do not implement a custom AI code editing engine or external integrations.

## Scope

### In Scope

- Existing MCP route prompt registration.
- Static prompt template builders for implementation planning and diff review.
- MCP-011 tracking, log, and evidence files.

### Out of Scope

- Agent SDK execution or code editing.
- Planner/Coder/Reviewer runtime orchestration.
- Jira, Slack, GitHub, deployment, automatic merge, or external integrations.
- UI, VS Code Extension, REST API changes.
- DB schema or migration changes.

## Expected Files

- `apps/server/app/api/[transport]/route.ts`: MCP prompt registrations
- `track/MASTER.md`: MCP-011 status updates
- `track/CURRENT.md`: active task state
- `track/logs/2026-05-06-MCP-011.md`: session log
- `track/evidence/MCP-011/validation.txt`: validation evidence

## Implementation Notes

- Use MCP SDK `registerPrompt`.
- Keep prompts as deterministic text templates.
- Include PoC constraints: no Jira/Slack/full external integrations, no custom AI editing engine, use Agent SDK adapter approach.

## Dependencies / Decisions

- Depends on MCP-001 route handler setup.
- No package dependency additions are planned.

## Risk / Approval

- Risk Score: 20
- Approval Required: no
- Reason: Adds static authenticated MCP prompt templates only; no schema, auth, dependency, deployment, destructive command, or external integration changes.

## Changes Made

- Registered MCP `implementation-plan` prompt with bounded objective/context/constraint arguments.
- Registered MCP `review-diff` prompt with bounded diff/test/review arguments.
- Added deterministic prompt builders that include PoC constraints, Agent SDK adapter boundaries, and no custom AI editing engine guidance.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @dabeehive/server exec tsc --noEmit` | Passed | Completed with no output. |
| `pnpm --filter @dabeehive/server run build` | Passed | Next build succeeded for `/api/[transport]`. Existing TypeScript project references warning remains. |
| `pnpm lint` | Passed | Basic lint passed. |
| `rg -n "registerPromptTemplates\|implementation-plan\|review-diff\|buildImplementationPlanPrompt\|buildReviewDiffPrompt\|textPromptResult\|Agent SDK adapter\|custom AI code editing" 'apps/server/app/api/[transport]/route.ts'` | Passed | Confirmed prompt registration, prompt names, prompt builders, and required PoC constraints. |
| `pg_isready -h localhost -p 55432` | Failed | Local PostgreSQL was not running; authenticated MCP runtime prompt smoke was not executable in this environment. |

## Evidence

- `track/evidence/MCP-011/validation.txt`

## Follow-up Tasks

- MCP-012
