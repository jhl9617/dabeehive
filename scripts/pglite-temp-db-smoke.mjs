import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "dabeehive-pglite-"));
const dataDir = path.join(tempRoot, "pgdata");
const host = process.env.DABEEHIVE_TEMP_DB_HOST ?? "127.0.0.1";
const configuredPort = Number(process.env.DABEEHIVE_TEMP_DB_PORT ?? "0");
const port = Number.isInteger(configuredPort) && configuredPort >= 0 ? configuredPort : 0;

let db;
let server;

try {
  db = await PGlite.create(dataDir);
  server = new PGLiteSocketServer({
    db,
    host,
    maxConnections: 10,
    port
  });

  await server.start();

  const serverConn = server.getServerConn();
  const databaseUrl = `postgresql://postgres:postgres@${serverConn}/postgres?sslmode=disable`;
  const commandEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    PGSSLMODE: "disable"
  };

  const migrate = await runCommand(
    "pnpm",
    [
      "--filter",
      "@dabeehive/server",
      "exec",
      "prisma",
      "migrate",
      "deploy",
      "--schema",
      "prisma/schema.prisma"
    ],
    commandEnv
  );
  const seed = await runCommand(
    "pnpm",
    [
      "--filter",
      "@dabeehive/server",
      "exec",
      "prisma",
      "db",
      "seed",
      "--schema",
      "prisma/schema.prisma"
    ],
    commandEnv
  );

  const verification = await verifySeededData(db);

  console.log(
    JSON.stringify(
      {
        database: "pglite",
        mode: "temporary",
        commands: {
          migrate: summarizeCommandResult(migrate),
          seed: summarizeCommandResult(seed)
        },
        serverConn,
        tempRoot,
        verification
      },
      null,
      2
    )
  );
} finally {
  if (server) {
    await server.stop().catch(() => undefined);
  }

  if (db) {
    await db.close().catch(() => undefined);
  }

  await rm(tempRoot, {
    force: true,
    recursive: true
  }).catch(() => undefined);
}

async function verifySeededData(database) {
  const [
    userCount,
    apiTokenCount,
    projectCount,
    issueCount,
    documentCount,
    runCount,
    approvalCount,
    artifactCount
  ] = await Promise.all([
    countRows(database, "User"),
    countRows(database, "ApiToken"),
    countRows(database, "Project"),
    countRows(database, "Issue"),
    countRows(database, "Document"),
    countRows(database, "AgentRun"),
    countRows(database, "Approval"),
    countRows(database, "Artifact")
  ]);

  const counts = {
    agentRuns: runCount,
    apiTokens: apiTokenCount,
    approvals: approvalCount,
    artifacts: artifactCount,
    documents: documentCount,
    issues: issueCount,
    projects: projectCount,
    users: userCount
  };
  const missingTables = Object.entries(counts)
    .filter(([, count]) => count < 1)
    .map(([name]) => name);

  if (missingTables.length > 0) {
    throw new Error(`Seed verification failed; empty tables: ${missingTables.join(", ")}`);
  }

  return counts;
}

async function countRows(database, tableName) {
  const result = await database.query(`SELECT COUNT(*)::int AS count FROM "${tableName}"`);
  const count = result.rows[0]?.count;
  const normalizedCount = Number(count);

  if (!Number.isInteger(normalizedCount) || normalizedCount < 0) {
    throw new Error(`Unable to read count for table ${tableName}`);
  }

  return normalizedCount;
}

function summarizeCommandResult(result) {
  return {
    durationMs: result.durationMs,
    exitCode: result.exitCode,
    stderrLines: countNonEmptyLines(result.stderr),
    stdoutLines: countNonEmptyLines(result.stdout)
  };
}

function countNonEmptyLines(value) {
  return value
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean).length;
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
    child.on("close", (exitCode) => {
      resolve({
        durationMs: Date.now() - startedAt,
        exitCode,
        stderr,
        stdout
      });
    });
  });

  if (result.exitCode !== 0) {
    const details = [result.stdout.trim(), result.stderr.trim()]
      .filter(Boolean)
      .join("\n");

    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.exitCode}\n${details}`
    );
  }

  return result;
}
