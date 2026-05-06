# TST-008 Final Acceptance Checklist

Date: 2026-05-06
Task: TST-008
Source of truth: `AGENTS.md`, `docs/prd.md`, `track/context/prd.md`, `track/MASTER.md`, and existing `track/evidence/*` records.

## Overall status

PoC acceptance is partially satisfied.

- Core repository structure, server foundation, REST route implementation, MCP tool/resource/prompt code, VS Code Extension control surface, Agent SDK adapter abstractions, workflow helpers, Git helpers, UI pages, and security helpers are implemented and mostly verified through typecheck, build, lint, smoke, and source checks.
- Full DB-backed acceptance is blocked because local PostgreSQL at `localhost:55432` is unreachable and Docker is unavailable in this environment.
- Production readiness is not claimed. This remains a PoC with known exclusions and residual risks.

## Scope alignment

AGENTS.md is the controlling PoC scope for this repository. The broader PRD mentions Slack, full GitHub/Slack integrations, login/session UX, BullMQ workers, and deployment-related behavior, but this implementation track explicitly excludes:

- Jira integration.
- Slack integration.
- Full external integrations.
- Automatic deployment.
- Automatic merge.
- Production secret access.
- Billing, tenants, and production operations.
- VS Code Extension custom AI patch engine or shell tool loop.

The acceptance checklist below marks those broader PRD items as `Out of scope` instead of missing implementation defects.

## Status legend

| Status | Meaning |
|---|---|
| Verified | Implemented and executable local validation passed. |
| Implemented | Code/support exists, but full runtime validation is blocked or incomplete. |
| Blocked | Cannot be fully validated in this environment due a concrete external prerequisite. |
| Out of scope | Explicitly excluded by AGENTS.md PoC constraints. |

## Acceptance checklist

| Area | Acceptance item | Status | Evidence / Notes |
|---|---|---|---|
| Tracking | Root rules and `/track` workflow exist and have been used task-by-task. | Verified | `track/MASTER.md`, `track/CHANGELOG.md`, `track/tasks/*`, `track/evidence/*`. |
| Foundation | pnpm workspace, TypeScript config, shared package, lint, env example, README exist. | Verified | FND-001 through FND-007 are verified in `track/MASTER.md`. |
| Server base | Next.js App Router server, response helpers, validation helper, Prisma client wrapper, logger, error/not-found pages exist. | Verified | SRV-001 through SRV-007 are verified. |
| Database models | User/API token, Project, Issue, Document, AgentRun, RunEvent, Approval, Artifact models exist. | Verified | DB-001 through DB-009 and DB-012 are verified. |
| Database seed | Demo seed script exists. | Implemented | DB-010 is implemented; runtime seed execution is blocked by missing local PostgreSQL. |
| Database migration | Local migration execution succeeds. | Blocked | DB-011 and TST-007 evidence record PostgreSQL/Docker unavailability. |
| REST API shape | Core REST routes use Zod validation and standard API response helpers. | Verified | API-001 through API-015 are verified. |
| REST happy path | Project -> issue -> run -> approval flow is executable end to end. | Implemented | API-016 and TST-003 support the smoke, but full DB-backed execution is blocked by PostgreSQL unavailability. |
| REST unauthenticated behavior | Protected API token endpoint returns 401 with `WWW-Authenticate: Bearer`. | Verified | API-015 evidence. |
| REST abuse guard | API token calls have a basic rate/abuse guard. | Verified | SEC-007 evidence. |
| MCP route | MCP endpoint initializes and has auth guard. | Verified | MCP-001 and MCP-002 evidence. |
| MCP tools | Required project, issue, run, approval, artifact, and context tools exist. | Verified | MCP-003 through MCP-009 are verified. |
| MCP resources/prompts | MCP resource templates and implementation/review prompts exist. | Verified | MCP-010 and MCP-011 are verified. |
| MCP authenticated smoke | Authenticated tool call smoke passes against seeded DB. | Blocked | MCP-012 is implemented; TST-004/TST-007 evidence records missing PostgreSQL. |
| Workflow | Run state machine, approval flows, artifact storage, risk assessment, sensitive file detection, approval evidence rendering exist. | Verified | WFL-001 through WFL-008 are verified. |
| Agent SDK adapter | LocalCodingAgentAdapter interface, Claude adapter skeleton, instructions, event normalization, cancellation, allowed tools, command policy, dry-run, and smoke exist. | Verified | SDK-001 through SDK-014 and TST-006 are verified. |
| Real external SDK execution | Real provider SDK execution changes files. | Out of scope | AGENTS requires adapter approach and forbids custom AI editing engine; PoC uses fake/dry-run validation. |
| VS Code Extension | Extension scaffold, commands/views, SecretStorage, REST client, status bar, issue/run/approval trees, run console, approval panel, artifact viewer, notifications, refresh/reconnect, CSP exist. | Verified | EXT-001 through EXT-016 and TST-005 are verified. |
| VS Code full E2E | VS Code issue -> plan -> approval -> coding -> review flow runs live. | Blocked | TST-007 records DB-backed server/MCP/REST blocker. |
| Git helpers | Status, branch creation, changed files, diff summary, test artifact, Draft PR config/command, PR body template exist. | Verified | GIT-001 through GIT-008 are verified. |
| Draft PR creation | Draft PR can be created only after final approval/config. | Verified for helper only | GIT-007 verified the guarded helper without calling GitHub. |
| Automatic merge | Automatic merge is available. | Out of scope | AGENTS explicitly forbids automatic merge. |
| Web UI | Dashboard, project list, issue list, run detail, approval list/detail, artifact viewer, loading/error states exist. | Verified | UI-001 through UI-008 are verified. |
| Login/session UI | Login after authentication is required. | Out of scope for current PoC track | PRD mentions it, but MASTER has no auth UI task and AGENTS constrains PoC scope. |
| Slack notifications | Run completion sends Slack notification. | Out of scope | AGENTS explicitly says do not implement Slack/full external integrations. |
| Jira integration | Jira issue integration exists. | Out of scope | AGENTS explicitly says do not implement Jira. |
| Deployment automation | Deployment is automated. | Out of scope | AGENTS explicitly excludes deployment automation. |
| Security | API token hash/verify, Bearer middleware, redaction, SecretStorage audit, command denylist, env validation, and abuse guard exist. | Verified | SEC-001 through SEC-007 are verified. |
| Validation baseline | Lint/typecheck/build/smoke commands are available. | Verified | TST-001, TST-005, TST-006, SEC-004 through SEC-007 evidence. |
| Full final acceptance | All PRD acceptance criteria pass live. | Blocked / partial | DB-backed REST/MCP/E2E validation cannot run without PostgreSQL or Docker. |

## Blocked items

| Blocker | Impact | Required action |
|---|---|---|
| PostgreSQL unavailable at `localhost:55432`. | DB migrate/seed, REST happy path, authenticated MCP smoke, and full VS Code E2E cannot be verified. | Start a local PostgreSQL instance or Docker Compose equivalent, set `DATABASE_URL`, run migrate/seed, then rerun TST-003, TST-004, and TST-007. |
| Docker daemon unavailable. | No container fallback for local PostgreSQL. | Start Docker or provide a direct PostgreSQL server. |
| Real external Agent SDK execution intentionally not used. | Full live coding run is not claimed. | Keep adapter interface; add a separately scoped task if real provider execution is approved later. |

## Out of scope summary

- Jira.
- Slack.
- Full GitHub/Slack external integrations.
- Automatic deployment.
- Automatic merge.
- Production secret access.
- Billing or multi-tenant production behavior.
- Custom AI code editing engine inside the VS Code Extension.

## Final acceptance decision

| Decision | Result |
|---|---|
| PoC codebase readiness for static review and local non-DB validation | Accepted |
| PoC DB-backed demo readiness | Blocked |
| Full PRD/MVP product acceptance | Not claimed |
| Production readiness | Not claimed |

## Re-run checklist for full DB-backed acceptance

1. Provide reachable local PostgreSQL.
2. Set `DATABASE_URL` to that database.
3. Run Prisma migrate deploy.
4. Run Prisma seed.
5. Run `pnpm test:api` against the running server.
6. Run authenticated `pnpm test:mcp` against the running server.
7. Re-run TST-007 E2E demo scenario.
8. Update TST-002, TST-003, TST-004, TST-007, and this checklist if those blocked validations pass.
