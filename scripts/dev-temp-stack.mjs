import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const config = parseArgs(process.argv.slice(2));

if (config.help) {
  printHelp();
  process.exit(0);
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), "dabeehive-dev-pglite-"));
const dataDir = path.join(tempRoot, "pgdata");

let db;
let dbServer;
let appServer;
let isShuttingDown = false;

process.on("SIGINT", () => {
  void shutdown(130);
});
process.on("SIGTERM", () => {
  void shutdown(143);
});

main().catch(async (error) => {
  console.error(`[dev:temp] ${error instanceof Error ? error.message : String(error)}`);
  await cleanup();
  process.exit(1);
});

async function main() {
  db = await PGlite.create(dataDir);
  dbServer = new PGLiteSocketServer({
    db,
    host: config.dbHost,
    maxConnections: 10,
    port: config.dbPort
  });

  await dbServer.start();

  const databaseUrl = buildDatabaseUrl(dbServer.getServerConn());
  const commandEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    PGSSLMODE: "disable"
  };

  console.log(`[dev:temp] PGlite listening on ${dbServer.getServerConn()}`);
  await runCommand("pnpm", prismaArgs("generate"), commandEnv);
  await runCommand("pnpm", prismaArgs("migrate", "deploy"), commandEnv);
  await runCommand("pnpm", prismaArgs("db", "seed"), commandEnv);

  const baseUrl = `http://${config.serverHost}:${config.serverPort}`;
  appServer = startServer(commandEnv);

  if (config.smoke) {
    const health = await waitForHealth(`${baseUrl}/api/health`, config.timeoutMs);
    const projectCount = await waitForProjectList(`${baseUrl}/api/projects`, config.timeoutMs);

    console.log(
      JSON.stringify(
        {
          mode: "smoke",
          server: baseUrl,
          database: "pglite",
          dbConn: dbServer.getServerConn(),
          health,
          seededProjects: projectCount,
          tempRoot
        },
        null,
        2
      )
    );

    await cleanup();
    return;
  }

  console.log(`[dev:temp] Server ready target: ${baseUrl}`);
  console.log("[dev:temp] Press Ctrl-C to stop the server and delete the temporary DB.");

  const exitCode = await waitForChildExit(appServer);
  await cleanup();
  process.exit(exitCode ?? 0);
}

function prismaArgs(...args) {
  return [
    "--filter",
    "@dabeehive/server",
    "exec",
    "prisma",
    ...args,
    "--schema",
    "prisma/schema.prisma"
  ];
}

function startServer(env) {
  const child = spawn(
    "pnpm",
    [
      "--filter",
      "@dabeehive/server",
      "exec",
      "next",
      "dev",
      "--hostname",
      config.serverHost,
      "--port",
      String(config.serverPort)
    ],
    {
      cwd: repoRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  prefixStream(child.stdout, "server");
  prefixStream(child.stderr, "server");

  child.on("error", (error) => {
    console.error(`[dev:temp] server process error: ${error.message}`);
  });

  return child;
}

async function runCommand(command, args, env) {
  const startedAt = Date.now();
  const result = await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolve({
        durationMs: Date.now() - startedAt,
        exitCode: 1,
        stderr: error.message,
        stdout
      });
    });
    child.on("close", (exitCode) => {
      resolve({
        durationMs: Date.now() - startedAt,
        exitCode,
        stderr,
        stdout
      });
    });
  });

  const label = `${command} ${args.join(" ")}`;

  if (result.exitCode !== 0) {
    const details = [result.stdout.trim(), result.stderr.trim()]
      .filter(Boolean)
      .join("\n");

    throw new Error(`${label} failed with exit code ${result.exitCode}\n${details}`);
  }

  console.log(`[dev:temp] ${label} completed in ${result.durationMs}ms`);
  return result;
}

async function waitForHealth(url, timeoutMs) {
  const payload = await waitForJson(url, timeoutMs);
  const data = payload?.data;

  if (!data || data.status !== "ok") {
    throw new Error(`Health endpoint returned unexpected payload: ${JSON.stringify(payload)}`);
  }

  return data.status;
}

async function waitForProjectList(url, timeoutMs) {
  const payload = await waitForJson(url, timeoutMs);
  const data = payload?.data;

  if (!Array.isArray(data)) {
    throw new Error(`Project list returned unexpected payload: ${JSON.stringify(payload)}`);
  }

  return data.length;
}

async function waitForJson(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json"
        }
      });
      const payload = await response.json().catch(() => null);

      if (response.ok && payload) {
        return payload;
      }

      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  throw new Error(
    `Timed out waiting for ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

function waitForChildExit(child) {
  return new Promise((resolve) => {
    child.on("close", (exitCode) => {
      resolve(exitCode);
    });
  });
}

async function shutdown(exitCode) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  await cleanup();
  process.exit(exitCode);
}

async function cleanup() {
  if (appServer && appServer.exitCode === null && !appServer.killed) {
    const appServerExit = waitForChildExit(appServer);
    appServer.kill("SIGTERM");
    await Promise.race([appServerExit, delay(5000)]);
  }

  if (dbServer) {
    await dbServer.stop().catch(() => undefined);
    dbServer = undefined;
  }

  if (db) {
    await db.close().catch(() => undefined);
    db = undefined;
  }

  await rm(tempRoot, {
    force: true,
    recursive: true
  }).catch(() => undefined);
}

function prefixStream(stream, label) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/u);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`[${label}] ${line}`);
      }
    }
  });
  stream.on("end", () => {
    if (buffer.trim().length > 0) {
      console.log(`[${label}] ${buffer}`);
    }
  });
}

function buildDatabaseUrl(serverConn) {
  return `postgresql://postgres:postgres@${serverConn}/postgres?sslmode=disable&connection_limit=1&pgbouncer=true`;
}

function parseArgs(args) {
  const parsed = {
    dbHost: process.env.DABEEHIVE_TEMP_DB_HOST ?? "127.0.0.1",
    dbPort: parsePort(process.env.DABEEHIVE_TEMP_DB_PORT ?? "0", 0),
    help: false,
    serverHost: process.env.DABEEHIVE_DEV_TEMP_HOST ?? "127.0.0.1",
    serverPort: parsePort(process.env.DABEEHIVE_DEV_TEMP_PORT ?? "18081", 18081),
    smoke: false,
    timeoutMs: parsePositiveInt(process.env.DABEEHIVE_DEV_TEMP_TIMEOUT_MS ?? "60000", 60000)
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--smoke") {
      parsed.smoke = true;
    } else if (arg === "--host") {
      parsed.serverHost = requireValue(args, (index += 1), arg);
    } else if (arg.startsWith("--host=")) {
      parsed.serverHost = arg.slice("--host=".length);
    } else if (arg === "--port") {
      parsed.serverPort = parsePort(requireValue(args, (index += 1), arg), 18081);
    } else if (arg.startsWith("--port=")) {
      parsed.serverPort = parsePort(arg.slice("--port=".length), 18081);
    } else if (arg === "--db-host") {
      parsed.dbHost = requireValue(args, (index += 1), arg);
    } else if (arg.startsWith("--db-host=")) {
      parsed.dbHost = arg.slice("--db-host=".length);
    } else if (arg === "--db-port") {
      parsed.dbPort = parsePort(requireValue(args, (index += 1), arg), 0);
    } else if (arg.startsWith("--db-port=")) {
      parsed.dbPort = parsePort(arg.slice("--db-port=".length), 0);
    } else if (arg === "--timeout-ms") {
      parsed.timeoutMs = parsePositiveInt(requireValue(args, (index += 1), arg), 60000);
    } else if (arg.startsWith("--timeout-ms=")) {
      parsed.timeoutMs = parsePositiveInt(arg.slice("--timeout-ms=".length), 60000);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function requireValue(args, index, flag) {
  const value = args[index];

  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

function parsePort(value, fallback) {
  const port = Number(value);

  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : fallback;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function printHelp() {
  console.log(`Usage: pnpm dev:temp [-- --smoke] [-- --port 18081]

Starts a temporary PGlite DB, runs Prisma generate/migrate/seed, and starts the Next.js server.

Options:
  --smoke             Start, verify /api/health and /api/projects, then stop.
  --host <host>       Server host. Defaults to 127.0.0.1.
  --port <port>       Server port. Defaults to 18081.
  --db-host <host>    Temporary DB socket host. Defaults to 127.0.0.1.
  --db-port <port>    Temporary DB socket port. Defaults to 0.
  --timeout-ms <ms>   Smoke startup timeout. Defaults to 60000.
`);
}
