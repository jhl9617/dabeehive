# TST-009 Known Issues

Date: 2026-05-06
Task: TST-009
Source of truth: `AGENTS.md`, `docs/prd.md`, `track/context/prd.md`, `track/MASTER.md`, `track/RISKS.md`, and `track/evidence/TST-008/final-acceptance-checklist.md`.

## Known issues summary

The PoC is ready for static review and local non-DB validation, but full DB-backed acceptance is still blocked. The remaining known issues are grouped below so reviewers can distinguish verified PoC behavior from unverified runtime behavior, residual security/workflow risk, and explicitly excluded product scope.

## Blocked validation

| Issue | Current state | Impact | Required action | Evidence |
|---|---|---|---|---|
| Local PostgreSQL is unavailable at `localhost:55432`. | Open blocker. | DB migration execution, seed execution, REST happy path, authenticated MCP smoke, and full VS Code E2E cannot be verified. | Start a local PostgreSQL instance or equivalent Docker Compose setup, set `DATABASE_URL`, run migration and seed, then rerun TST-003, TST-004, and TST-007. | `track/RISKS.md`, `track/evidence/TST-007/validation.txt`, `track/evidence/TST-008/final-acceptance-checklist.md`. |
| Docker daemon is unavailable. | Open blocker. | There is no container fallback for the missing PostgreSQL server in this environment. | Start Docker or provide a direct local PostgreSQL server. | `track/evidence/TST-002/validation.txt`, `track/evidence/TST-007/validation.txt`. |
| Full VS Code E2E demo cannot run. | TST-007 is blocked. | The issue -> plan -> approval -> coding -> review flow cannot be proven live against the DB-backed server. | Resolve PostgreSQL/Docker blocker, then rerun the E2E scenario. | `track/tasks/TST-007-e2e-demo-scenario.md`, `track/evidence/TST-007/validation.txt`. |

## Implemented but not runtime verified

| Area | Task status | What exists | Missing verification | Evidence |
|---|---|---|---|---|
| Demo seed data | DB-010 and TST-002 are implemented. | Prisma seed support creates demo user, API token hash, project, issue, document, run, event, approval, and artifact data. | `prisma db seed` has not succeeded against a reachable PostgreSQL database. | `track/tasks/DB-010-seed-script.md`, `track/evidence/TST-002/validation.txt`. |
| Local migration execution | DB-011 is blocked. | Initial migration SQL exists and schema validation passes. | `prisma migrate deploy` has not succeeded against a reachable PostgreSQL database. | `track/tasks/DB-011-migration-validation.md`, `track/evidence/TST-002/validation.txt`. |
| REST happy path | API-016 and TST-003 are implemented. | A reusable smoke script covers project, issue, run, approval request, and approval response flow. | `pnpm test:api` cannot complete until PostgreSQL is reachable. | `track/tasks/API-016-common-api-tests.md`, `track/evidence/TST-003/validation.txt`. |
| Authenticated MCP smoke | MCP-012 and TST-004 are implemented. | A reusable JSON-RPC smoke script checks MCP initialize, required tools, resources, prompts, and `project.list`. | Authenticated MCP tool calls cannot complete until seeded DB token verification works. | `track/tasks/MCP-012-smoke-test.md`, `track/evidence/TST-004/validation.txt`. |

## Residual risks

| Risk | Current mitigation | Follow-up needed | Evidence |
|---|---|---|---|
| REST API token auth is not route-wide and has no token scopes or role checks yet. | Existing token verifier stores only hashes, returns sanitized metadata, and provides a minimal authenticated endpoint. | Add route-wide enforcement, token scopes, role checks, and indexed token lookup before production use. | `track/RISKS.md` entries SEC-001, SEC-002, API-015. |
| MCP and REST write/read surfaces exist before full scope and role filtering. | Bearer auth, Zod validation, bounded payloads, read-only resources where possible, and controlled errors are in place. | Add per-project authorization, scope checks, role checks, and ownership filtering. | `track/RISKS.md` entries MCP-003 through MCP-012 and API-002 through API-013. |
| Secret redaction helper is not wired through every log, event, and artifact boundary. | Reusable redaction helper exists and common patterns are covered. | Apply redaction consistently at SDK event, command result, artifact, run event, and UI/API response boundaries. | `track/RISKS.md` entry SEC-003; `track/evidence/SEC-003/validation.txt`. |
| Basic abuse guard is process-local. | API token calls have a simple in-memory guard and return REST 429 for local abuse cases. | Replace or augment with Redis or another distributed store before production or multi-instance use. | `track/RISKS.md` entry SEC-007; `track/evidence/SEC-007/validation.txt`. |
| Run execution is queued/stored but not backed by a real worker. | Run state, approvals, artifacts, and SDK adapter abstractions exist. | Add a separately scoped worker/queue execution path if the PoC moves beyond adapter/dry-run validation. | `track/MASTER.md`, `track/evidence/TST-008/final-acceptance-checklist.md`. |
| Real external Agent SDK execution is not claimed. | The PoC uses `LocalCodingAgentAdapter`, `ClaudeAgentSdkAdapter` skeleton, fake run, dry-run mode, and command policy. | Add real provider execution only under a new task with approval and command/event safety review. | SDK-001 through SDK-014, TST-006. |

## Out of scope

The following items are intentionally excluded by the repository rules and must not be treated as defects in this PoC:

- Jira integration.
- Slack integration or Slack notifications.
- Full external integrations.
- Automatic deployment.
- Automatic merge.
- Production secret access.
- Billing, tenant management, or production operations.
- VS Code Extension custom AI patch engine or shell tool loop.
- Custom AI code editing engine.

## Production readiness gaps

Production readiness is not claimed. Before production use, the project still needs at least:

- Route-wide auth, authorization, token scopes, role checks, and project ownership enforcement.
- Distributed abuse/rate protection.
- Redaction wired at every log, command, event, artifact, and response boundary.
- Real database migration/seed verification in a controlled environment.
- Real worker or runner process design if live agent execution is required.
- Operational monitoring, backup, secret management, and deployment controls.
- A reviewed external SDK execution integration if real coding runs are enabled.

## Not claimed

| Claim | Status |
|---|---|
| Full PRD/MVP product acceptance | Not claimed. |
| DB-backed demo readiness | Blocked. |
| Production readiness | Not claimed. |
| Real provider SDK coding run | Not claimed. |
| Automatic merge | Out of scope. |

## Revalidation path

1. Provide reachable local PostgreSQL.
2. Set `DATABASE_URL` to that database.
3. Run Prisma migrate deploy.
4. Run Prisma seed.
5. Run `pnpm test:api` against the running server.
6. Run authenticated `pnpm test:mcp` against the running server.
7. Re-run TST-007 E2E demo scenario.
8. Update TST-002, TST-003, TST-004, TST-007, TST-008, and this known issues document if those blocked validations pass.

## Next task

TST-010 should turn this known issue inventory and the TST-008 acceptance checklist into a demo script with ordered steps, expected results, and explicit skip/blocker callouts.
