import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const serverRequire = createRequire(
  path.join(repoRoot, "apps/server/package.json")
);
const ts = serverRequire("typescript");
const moduleCache = new Map();

const {
  assessCommandPolicy,
  ClaudeAgentSdkAdapter,
  inferValidationCommands,
  normalizeCodingAgentEvent
} = loadTsModule("packages/shared/src/index.ts").exports;

const runId = "sdk-adapter-smoke-001";
const timestamp = new Date("2026-05-06T02:00:00.000Z");
const adapter = new ClaudeAgentSdkAdapter({
  allowedTools: ["read", "search", "bash"],
  dryRun: true,
  name: "claude-agent-sdk-smoke"
});

const runInput = {
  runId,
  project: {
    id: "project-001",
    name: "SDK Adapter Smoke",
    repoUrl: null,
    repoOwner: null,
    repoName: null
  },
  issue: {
    id: "issue-001",
    projectId: "project-001",
    parentId: null,
    title: "Validate SDK adapter smoke",
    body: "Verify adapter dry-run and event normalization without external SDK calls.",
    type: "task",
    status: "ready",
    priority: "high",
    assigneeRole: "planner",
    labels: ["sdk", "smoke"],
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString()
  },
  workspace: {
    path: repoRoot,
    branchName: "poc/SDK-014-adapter-smoke-test",
    baseBranchName: "main"
  },
  systemInstruction: "Dry-run validate the SDK adapter prompt and plan.",
  agentRole: "planner",
  dryRun: true,
  model: {
    provider: "anthropic",
    modelId: "dry-run"
  }
};

const handle = await adapter.start(runInput);

assertEqual(adapter.name, "claude-agent-sdk-smoke", "adapter name");
assertEqual(handle.runId, runId, "handle runId");
assertEqual(handle.adapterRunId, `dry-run:${runId}`, "dry-run adapter run id");
assertEqual(handle.mode, "dry_run", "handle mode");
assertEqual(handle.allowedTools.join(","), "read,search,bash", "allowed tools");
assertEqual(handle.dryRunReport.ready, true, "dry-run report ready");
assertEqual(handle.dryRunReport.warnings.length, 0, "dry-run warning count");
assertEqual(
  handle.dryRunReport.systemInstructionPreview,
  "Dry-run validate the SDK adapter prompt and plan.",
  "dry-run prompt preview"
);

const rawEvents = [
  {
    type: "assistant_message",
    message: "Dry-run prompt validated.",
    data: { mode: "dry_run" }
  },
  {
    event: "tool_use",
    message: "Would inspect workspace context.",
    metadata: { tool: "read" }
  },
  {
    name: "tool_response",
    content: "Workspace context validated.",
    metadata: { ok: true }
  },
  {
    type: "complete",
    message: "SDK adapter smoke complete."
  }
];
const events = rawEvents.map((event) =>
  normalizeCodingAgentEvent({
    runId,
    event,
    now: () => timestamp
  })
);

assertEqual(
  events.map((event) => event.type).join(","),
  "message,tool_call,tool_result,done",
  "event type sequence"
);
assertEqual(events.every((event) => event.runId === runId), true, "event run ids");
assertEqual(
  events.every((event) => event.createdAt === timestamp.toISOString()),
  true,
  "event timestamps"
);

const validationCommands = inferValidationCommands({
  lockfiles: ["pnpm-lock.yaml"],
  scripts: {
    lint: "node scripts/lint-basic.mjs",
    "test:api": "node scripts/rest-happy-path-smoke.mjs",
    "test:mcp": "node scripts/mcp-smoke.mjs"
  }
});
assertEqual(
  validationCommands.map((command) => command.command).join(","),
  "pnpm run lint,pnpm run test:api,pnpm run test:mcp",
  "inferred validation commands"
);

assertEqual(
  assessCommandPolicy({
    command: "pnpm run lint",
    allowedTools: handle.allowedTools
  }).decision,
  "allowed",
  "allowed lint command"
);
assertEqual(
  assessCommandPolicy({
    command: "rm -rf dist",
    allowedTools: handle.allowedTools
  }).decision,
  "blocked",
  "blocked destructive command"
);

console.log(
  JSON.stringify(
    {
      adapter: adapter.name,
      runId,
      mode: handle.mode,
      allowedTools: handle.allowedTools,
      eventTypes: events.map((event) => event.type),
      validationCommands: validationCommands.map((command) => command.command)
    },
    null,
    2
  )
);

function loadTsModule(relativePath) {
  const absolutePath = path.resolve(repoRoot, relativePath);
  const cachedModule = moduleCache.get(absolutePath);

  if (cachedModule) {
    return cachedModule;
  }

  const source = readFileSync(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: absolutePath
  }).outputText;
  const module = {
    exports: {}
  };
  moduleCache.set(absolutePath, module);
  const localRequire = (specifier) => {
    if (specifier.startsWith(".")) {
      const resolvedPath = resolveRelativeTsModule(absolutePath, specifier);

      return loadTsModule(path.relative(repoRoot, resolvedPath)).exports;
    }

    return serverRequire(specifier);
  };
  const execute = new Function("require", "exports", "module", transpiled);
  execute(localRequire, module.exports, module);

  return module;
}

function resolveRelativeTsModule(fromPath, specifier) {
  const basePath = path.resolve(path.dirname(fromPath), specifier);
  const candidates = [basePath, `${basePath}.ts`, path.join(basePath, "index.ts")];
  const candidate = candidates.find((value) => {
    try {
      readFileSync(value);
      return true;
    } catch {
      return false;
    }
  });

  if (!candidate) {
    throw new Error(`Unable to resolve ${specifier} from ${fromPath}`);
  }

  return candidate;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}
