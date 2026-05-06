# TST-010 Demo Script

Date: 2026-05-06
Task: TST-010
Source of truth: `AGENTS.md`, `README.md`, `track/evidence/TST-008/final-acceptance-checklist.md`, and `track/evidence/TST-009/known-issues.md`.

## Demo script overview

This script presents the AI Agent Orchestrator PoC as a local, reviewable control surface for projects, issues, context, agent runs, approvals, artifacts, MCP access, VS Code Extension views, Agent SDK adapter flow, and audit evidence.

The current default demo mode is a non-DB validation and walkthrough because PostgreSQL is not reachable at `localhost:55432` in this environment. If a reachable local PostgreSQL database is provided, use the DB-backed optional steps to complete REST, MCP, and E2E runtime validation.

## Prerequisites

| Item | Required for | Expected value |
|---|---|---|
| Node.js | All local commands | Node 22 or newer. |
| pnpm | All workspace commands | `pnpm@10.23.0` from `package.json`. |
| Repository branch | Demo consistency | Use the latest task branch or a reviewed integration branch. |
| PostgreSQL | DB-backed REST/MCP/E2E sections only | Reachable `DATABASE_URL` using PostgreSQL 16 or newer. |
| VS Code | Extension UI walkthrough | Local VS Code with this workspace open. |
| Local MCP token | Authenticated MCP smoke only | Token matching the seeded local demo API token hash. |

Presenter setup:

```sh
pnpm install
pnpm lint
```

Expected result:

- Dependencies are installed.
- `pnpm lint` prints `basic lint passed`.
- No Jira, Slack, deployment, automatic merge, production secret, or custom AI editing behavior is part of the demo.

## Baseline validation

Run these commands first to prove the reviewable baseline without requiring a database:

```sh
pnpm lint
pnpm --filter @dabeehive/server exec tsc --noEmit
pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit
pnpm --filter @dabeehive/vscode-extension run compile
pnpm --filter @dabeehive/server exec node ../../scripts/sdk-fake-run-smoke.mjs
node -c scripts/rest-happy-path-smoke.mjs
node -c scripts/mcp-smoke.mjs
```

Expected results:

| Command group | Expected result |
|---|---|
| Lint | Basic lint passes. |
| Server/shared TypeScript | No compiler errors. |
| Extension compile | Extension compiles through the workspace TypeScript setup. |
| SDK fake run | Normalized message, tool, file, command, test, and done events are emitted without invoking a real external SDK. |
| REST/MCP script syntax | Smoke scripts parse successfully. |

## Server walkthrough

1. Open `README.md` and show the workspace layout.
2. Open `apps/server/app/api/health/route.ts` to show the minimal health endpoint.
3. Open `apps/server/app` and `apps/server/src/lib` areas as needed to point out REST, MCP, Prisma, security, and workflow helpers.
4. Start the server only if local env is configured:

```sh
pnpm --filter @dabeehive/server run dev
```

Expected results:

- The presenter can explain that Next.js App Router hosts FE, REST API, and MCP route surfaces in one server app.
- If the server is started without a real `DATABASE_URL`, SEC-006 env validation may fail intentionally. That is expected behavior, not a demo failure.

## REST walkthrough

Current non-DB walkthrough:

1. Show the REST smoke script:

```sh
sed -n '1,220p' scripts/rest-happy-path-smoke.mjs
```

2. Explain that it covers project -> issue -> run -> approval request -> approval response.
3. Show API evidence in `track/evidence/TST-003/validation.txt` and `track/evidence/API-016/validation.txt`.

DB-backed optional path:

```sh
pnpm --filter @dabeehive/server exec prisma migrate deploy --schema prisma/schema.prisma
pnpm --filter @dabeehive/server exec prisma db seed --schema prisma/schema.prisma
DABEEHIVE_REST_BASE_URL=http://127.0.0.1:18081 pnpm test:api
```

Expected results:

- Without PostgreSQL, the full REST happy path remains blocked.
- With PostgreSQL and seed data, `pnpm test:api` should complete the project -> issue -> run -> approval flow and should be used to promote TST-003/API-016 evidence.

## MCP walkthrough

Current non-DB walkthrough:

1. Show the MCP smoke script:

```sh
sed -n '1,240p' scripts/mcp-smoke.mjs
```

2. Point out required tools: `project.list`, `project.get`, `issue.list`, `issue.get`, `issue.create`, `run.start`, `run.status`, `run.append_event`, `approval.list`, `approval.request`, `approval.respond`, `artifact.create`, `artifact.get`, and `context.search`.
3. Show MCP evidence in `track/evidence/TST-004/validation.txt` and `track/evidence/MCP-012/validation.txt`.

DB-backed optional path:

```sh
DABEEHIVE_MCP_BASE_URL=http://127.0.0.1:18082/api/mcp DABEEHIVE_MCP_TOKEN=demo-local-mcp-token pnpm test:mcp
```

Expected results:

- Without PostgreSQL, authenticated MCP tool calls remain blocked because DB-backed token verification cannot read seeded token hashes.
- With PostgreSQL and seed data, `pnpm test:mcp` should complete initialize, tools, prompts, resources, and representative tool call checks.

## VS Code walkthrough

1. Compile the extension:

```sh
pnpm --filter @dabeehive/vscode-extension run compile
```

2. Open the workspace in VS Code.
3. Show the Dabeehive Activity Bar views:
   - Projects / Issues tree.
   - Runs tree.
   - Approvals tree.
4. Show the commands:
   - `Dabeehive: Set API Token`.
   - `Dabeehive: Refresh`.
   - `Dabeehive: Create Issue`.
   - `Dabeehive: Start Run`.
5. Show read-only webviews:
   - Run Console.
   - Approval Panel.
   - Artifact Viewer.

Expected results:

- Extension activation and compile are verified.
- API token storage uses VS Code SecretStorage, not settings.
- The extension is a control surface and does not implement a custom AI patch engine or shell tool loop.
- Full live issue -> plan -> approval -> coding -> review in VS Code remains blocked until DB-backed server/REST/MCP flows are available.

## SDK walkthrough

1. Show shared adapter types:

```sh
sed -n '1,220p' packages/shared/src/agent-sdk.ts
```

2. Show the adapter skeleton:

```sh
sed -n '1,220p' packages/shared/src/claude-agent-sdk-adapter.ts
```

3. Run the fake SDK smoke:

```sh
pnpm --filter @dabeehive/server exec node ../../scripts/sdk-fake-run-smoke.mjs
```

Expected results:

- The SDK path uses `LocalCodingAgentAdapter` and `ClaudeAgentSdkAdapter`.
- Events are normalized into the Orchestrator event shape.
- The demo does not invoke a real external provider SDK and does not build a custom AI code editing engine.

## UI walkthrough

1. Show the dashboard and pages in source:
   - `apps/server/app/page.js`
   - `apps/server/app/projects/page.js`
   - `apps/server/app/issues/page.js`
   - `apps/server/app/runs/[id]/page.js`
   - `apps/server/app/approvals/page.js`
   - `apps/server/app/approvals/[id]/page.js`
   - `apps/server/app/artifacts/[id]/page.js`
2. If a DB-backed server is running, open the local app in a browser and show the same pages with seeded data.

Expected results:

- The web UI covers dashboard, projects, issues, run detail, approvals, approval actions, artifact viewer, loading state, and error/not-found states.
- DB-backed page rendering may show unavailable or empty states if PostgreSQL is missing.

## Expected results

| Demo area | Current environment result | DB-backed result when PostgreSQL is available |
|---|---|---|
| Baseline lint/typecheck/compile | Passes. | Passes. |
| SDK fake flow | Passes without external SDK. | Passes without external SDK. |
| REST happy path | Blocked by missing PostgreSQL. | Expected to pass after migrate/seed and running server. |
| MCP authenticated smoke | Blocked by missing PostgreSQL/token seed. | Expected to pass after migrate/seed and running server. |
| VS Code full E2E | Blocked by DB-backed REST/MCP prerequisites. | Expected to be demoable after REST/MCP prerequisites pass. |
| Automatic merge | Not available. | Still out of scope. |

## Blocked steps

Do not present these as passing in the current environment:

- `prisma migrate deploy` against `localhost:55432`.
- `prisma db seed` against `localhost:55432`.
- Full `pnpm test:api`.
- Authenticated `pnpm test:mcp`.
- Live VS Code issue -> plan -> approval -> coding -> review E2E.
- Real provider SDK code editing.

Use `track/evidence/TST-009/known-issues.md` as the reviewer-facing explanation for these blockers.

## Out of scope

The demo must not include:

- Jira integration.
- Slack integration or Slack notifications.
- Full external integrations.
- Automatic deployment.
- Automatic merge.
- Production secret access.
- Billing, tenant management, or production operations.
- VS Code custom AI patch engine or shell tool loop.
- Custom AI code editing engine.

## Closing checklist

At the end of the demo, show:

1. `track/evidence/TST-008/final-acceptance-checklist.md`.
2. `track/evidence/TST-009/known-issues.md`.
3. `track/MASTER.md` final task status summary.
4. Latest commits for TST-009 and TST-010.

Final message:

- The PoC is reviewable and validated for static/non-DB scope.
- DB-backed acceptance is blocked until PostgreSQL or a working DB environment is provided.
- Merge is not automatic; it should be performed only after the user specifies the target branch and strategy.
