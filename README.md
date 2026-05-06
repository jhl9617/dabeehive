# Dabeehive Orchestrator PoC

AI Agent Orchestrator PoC for coordinating projects, issues, context documents, agent runs, approvals, artifacts, MCP access, a VS Code control surface, and an Agent SDK adapter flow.

This repository is intentionally scoped to the PoC. It does not implement Jira, Slack, deployment automation, automatic merge, billing, tenant management, or a custom AI code editing engine.

## Workspace

- `apps/server`: Next.js App Router server, REST API, MCP route, Prisma schema, and seed script.
- `apps/vscode-extension`: VS Code extension control surface.
- `packages/shared`: Shared domain, API, Git, workflow, and Agent SDK adapter types/helpers.
- `scripts`: Local lint and smoke validation helpers.
- `track`: Task tracking, evidence, logs, risks, and changelog.

## Prerequisites

- Node.js 22 or newer.
- pnpm 10.x.
- PostgreSQL 16 or newer for DB-backed API/MCP smoke tests.
- VS Code for extension host testing.

Docker Compose is not implemented in this PoC yet. If PostgreSQL or Docker is not available locally, use the temporary PGlite smoke below for isolated migrate/seed validation. REST happy path, MCP authenticated smoke, and full E2E demo validation still require a reachable database while the server is running.

## Setup

Install dependencies:

```sh
pnpm install
```

Create a local env file from the placeholder template and fill in local-only values:

```sh
cp .env.example .env
```

At minimum, set `DATABASE_URL` to a reachable local PostgreSQL database before running Prisma, REST, or MCP database flows.

## Database

Generate the Prisma client:

```sh
pnpm --filter @dabeehive/server exec prisma generate --schema prisma/schema.prisma
```

Apply existing migrations to a reachable local database:

```sh
pnpm --filter @dabeehive/server exec prisma migrate deploy --schema prisma/schema.prisma
```

Seed demo data:

```sh
pnpm --filter @dabeehive/server exec prisma db seed --schema prisma/schema.prisma
```

Run isolated migrate/seed validation without PostgreSQL or Docker:

```sh
pnpm test:temp-db
```

This starts a temporary local PGlite PostgreSQL socket, runs `prisma migrate deploy`, runs `prisma db seed`, verifies the seeded core tables, and deletes the temporary data directory on exit. The script binds a localhost port for Prisma CLI compatibility.

## Run Server

Start a self-contained temporary dev stack with one command:

```sh
pnpm dev:temp
```

This starts a temporary PGlite PostgreSQL socket, runs Prisma generate/migrate/seed, starts the Next.js server at `http://127.0.0.1:18081`, and deletes the temporary database when the command stops. Use `pnpm dev:temp -- --port 18090` to choose another server port.

Start the Next.js server:

```sh
pnpm --filter @dabeehive/server run dev
```

For smoke scripts, use explicit local ports:

```sh
pnpm --filter @dabeehive/server exec next dev --hostname 127.0.0.1 --port 18081
```

Health check:

```sh
curl http://127.0.0.1:18081/api/health
```

## Validation

Run the basic repository lint:

```sh
pnpm lint
```

Run a one-command temporary stack startup smoke:

```sh
pnpm dev:temp -- --smoke
```

Run server TypeScript validation:

```sh
pnpm --filter @dabeehive/server exec tsc --noEmit
```

Run shared package TypeScript validation:

```sh
pnpm --filter @dabeehive/server exec tsc -p ../../packages/shared/tsconfig.json --noEmit
```

Compile the VS Code extension:

```sh
pnpm --filter @dabeehive/vscode-extension run compile
```

Run the Agent SDK fake flow smoke without invoking a real external SDK:

```sh
pnpm --filter @dabeehive/server exec node ../../scripts/sdk-fake-run-smoke.mjs
```

## REST Smoke

Start the server on the REST smoke port with a reachable `DATABASE_URL`, then run:

```sh
DABEEHIVE_REST_BASE_URL=http://127.0.0.1:18081 node scripts/rest-happy-path-smoke.mjs
```

The script covers project -> issue -> run -> approval request -> approval response. It requires the migration and seed data to be applied first.

## MCP Smoke

Start the server on the MCP smoke port with a reachable `DATABASE_URL`, then run:

```sh
DABEEHIVE_MCP_BASE_URL=http://127.0.0.1:18082/api/mcp DABEEHIVE_MCP_TOKEN=<local-mcp-api-token> node scripts/mcp-smoke.mjs
```

The token must match a local demo API token hash in the seeded database. The MCP smoke covers initialize, tools/list, and `project.list`.

## VS Code Extension

Compile the extension first:

```sh
pnpm --filter @dabeehive/vscode-extension run compile
```

In VS Code:

- Set `dabeehive.serverUrl` to the local server URL.
- Use `Dabeehive: Set API Token` to store the token in SecretStorage.
- Use the Dabeehive activity view for Projects / Issues, Runs, and Approvals.
- Use `Dabeehive: Create Issue` and `Dabeehive: Start Run` for the current PoC workflow.

The extension does not implement its own AI patch engine or shell tool loop. Code generation is delegated to the Agent SDK adapter layer.

## Known Local Blockers

- Full REST/MCP/E2E validation requires a reachable database for the running server. Without it, REST happy path, authenticated MCP smoke, and the full VS Code E2E scenario cannot be verified.
- Isolated migrate/seed validation can run without PostgreSQL or Docker through `pnpm test:temp-db`.
- Local server startup with a temporary DB can run without PostgreSQL or Docker through `pnpm dev:temp`.
- The current PoC has a fake SDK smoke flow and adapter skeleton; real external SDK execution is intentionally not part of the verified default flow.
- Draft PR creation, SSE UI, and richer web dashboard features are tracked as follow-up tasks.

## Tracking

Work is tracked under `track/MASTER.md`. Use one task at a time, update `track/CURRENT.md` before implementation, record evidence under `track/evidence/<TASK-ID>/`, and close the task in `track/CHANGELOG.md`.

The helper below updates only `track/MASTER.md`; task files, current state, evidence, and changelog still need explicit updates:

```sh
pnpm track:status -- --task FND-007 --status verified --dry-run
```
