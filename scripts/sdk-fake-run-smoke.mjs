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
  dispatchRunCancellation,
  normalizeCodingAgentEvent
} = loadTsModule("packages/shared/src/index.ts").exports;

const runId = "fake-run-001";
const timestamp = new Date("2026-05-06T01:30:00.000Z");
const emittedEvents = [];
const cancellationRequests = [];

const fakeAdapter = {
  name: "fake-local-coding-agent",
  async start(input) {
    const rawEvents = [
      {
        type: "assistant_message",
        message: "Planning fake run.",
        data: { phase: "planner" }
      },
      {
        event: "tool_use",
        message: "Reading workspace files.",
        metadata: { tool: "read" }
      },
      {
        name: "tool_response",
        content: "Workspace files loaded.",
        metadata: { ok: true }
      },
      {
        type: "file_changed",
        message: "packages/shared/src/example.ts",
        data: { operation: "modify" }
      },
      {
        type: "shell_command",
        message: "pnpm lint",
        data: { exitCode: 0 }
      },
      {
        type: "test",
        message: "fake validation passed",
        data: { command: "pnpm lint", status: "passed" }
      },
      {
        type: "complete",
        message: "Fake run complete."
      }
    ];

    emittedEvents.push(
      ...rawEvents.map((event) =>
        normalizeCodingAgentEvent({
          runId: input.runId,
          event,
          now: () => timestamp
        })
      )
    );

    return {
      runId: input.runId,
      adapterRunId: "fake-adapter-run-001"
    };
  },
  async cancel(request) {
    cancellationRequests.push(request);
  }
};

const handle = await fakeAdapter.start({
  runId,
  project: {
    id: "project-001",
    name: "Fake SDK Project",
    repoUrl: null,
    repoOwner: null,
    repoName: null
  },
  issue: {
    id: "issue-001",
    projectId: "project-001",
    parentId: null,
    title: "Fake SDK run",
    body: "Validate fake adapter event flow.",
    type: "task",
    status: "ready",
    priority: "high",
    assigneeRole: "planner",
    labels: ["sdk", "fake"],
    createdAt: "2026-05-06T01:30:00.000Z",
    updatedAt: "2026-05-06T01:30:00.000Z"
  },
  workspace: {
    path: repoRoot,
    branchName: "poc/TST-006-sdk-fake-run",
    baseBranchName: "main"
  },
  systemInstruction: "Run a fake local coding adapter flow.",
  agentRole: "planner",
  model: {
    provider: "fake",
    modelId: "fake-model"
  }
});

const cancellation = await dispatchRunCancellation({
  adapter: fakeAdapter,
  request: {
    runId,
    reason: " stop fake run "
  },
  now: () => timestamp
});

assertEqual(handle.runId, runId, "handle runId");
assertEqual(handle.adapterRunId, "fake-adapter-run-001", "adapter run id");
assertEqual(
  emittedEvents.map((event) => event.type).join(","),
  "message,tool_call,tool_result,file_change,command,test_result,done",
  "event type sequence"
);
assertEqual(emittedEvents.every((event) => event.runId === runId), true, "event run ids");
assertEqual(
  emittedEvents.every((event) => event.createdAt === timestamp.toISOString()),
  true,
  "event timestamps"
);
assertEqual(
  emittedEvents[4].metadata?.data?.exitCode,
  0,
  "command event metadata"
);
assertEqual(cancellation.reason, "stop fake run", "cancellation reason");
assertEqual(cancellation.requestedAt, timestamp.toISOString(), "cancellation timestamp");
assertEqual(cancellationRequests.length, 1, "adapter cancel call count");
assertEqual(cancellationRequests[0].reason, "stop fake run", "adapter cancel payload");

console.log(
  JSON.stringify(
    {
      adapter: fakeAdapter.name,
      runId,
      adapterRunId: handle.adapterRunId,
      events: emittedEvents.map((event) => event.type),
      cancellation
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
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}
