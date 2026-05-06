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
  buildDiffSummary,
  buildDraftPrCommandPlan,
  buildDraftPrConfigStatus,
  buildPrBody,
  parseDiffNumstat,
  runDraftPrCommand
} = loadTsModule("packages/shared/src/index.ts").exports;

testDraftPrCommandPlanning();
await testDraftPrCommandRunner();
testPrBodyTemplate();
testDiffSummary();

console.log(
  JSON.stringify(
    {
      tests: [
        "draft-pr-command-planning",
        "draft-pr-command-runner",
        "pr-body-template",
        "git-diff-summary"
      ],
      result: "passed"
    },
    null,
    2
  )
);

function testDraftPrCommandPlanning() {
  const readyConfig = buildDraftPrConfigStatus({
    repoOwner: " dabeehive ",
    repoName: " orchestrator ",
    token: "local-placeholder-token",
    baseBranch: "main"
  });
  const baseInput = {
    approval: {
      id: "approval-001",
      status: "approved",
      type: "final_approval"
    },
    body: " Validate shared helpers. ",
    config: readyConfig,
    headBranch: " poc/TST-011-shared-regression-tests ",
    title: " Add shared regression tests "
  };

  assertEqual(readyConfig.configured, true, "ready config is configured");
  assertEqual(readyConfig.repoOwner, "dabeehive", "repo owner trimmed");
  assertEqual(readyConfig.repoName, "orchestrator", "repo name trimmed");

  for (const { input, reason, label } of [
    {
      input: {
        ...baseInput,
        approval: {
          ...baseInput.approval,
          type: "spec_approval"
        }
      },
      label: "non-final approval blocks Draft PR",
      reason: "approval_not_final"
    },
    {
      input: {
        ...baseInput,
        approval: {
          ...baseInput.approval,
          status: "pending"
        }
      },
      label: "pending approval blocks Draft PR",
      reason: "approval_not_approved"
    },
    {
      input: {
        ...baseInput,
        config: buildDraftPrConfigStatus({
          repoOwner: "dabeehive",
          repoName: "",
          token: ""
        })
      },
      label: "incomplete config blocks Draft PR",
      reason: "config_incomplete"
    },
    {
      input: {
        ...baseInput,
        title: " "
      },
      label: "missing title blocks Draft PR",
      reason: "missing_title"
    },
    {
      input: {
        ...baseInput,
        body: " "
      },
      label: "missing body blocks Draft PR",
      reason: "missing_body"
    },
    {
      input: {
        ...baseInput,
        headBranch: " "
      },
      label: "missing head branch blocks Draft PR",
      reason: "missing_head_branch"
    }
  ]) {
    const plan = buildDraftPrCommandPlan(input);

    assertEqual(plan.allowed, false, label);
    assertEqual(plan.reason, reason, `${label} reason`);
  }

  const plan = buildDraftPrCommandPlan(baseInput);

  assertEqual(plan.allowed, true, "ready Draft PR plan is allowed");
  assertEqual(plan.approvalId, "approval-001", "approval id preserved");
  assertEqual(plan.repo, "dabeehive/orchestrator", "repo rendered");
  assertEqual(
    plan.headBranch,
    "poc/TST-011-shared-regression-tests",
    "head branch trimmed"
  );
  assertEqual(plan.title, "Add shared regression tests", "title trimmed");
  assertDeepEqual(
    plan.command,
    [
      "gh",
      "pr",
      "create",
      "--draft",
      "--repo",
      "dabeehive/orchestrator",
      "--base",
      "main",
      "--head",
      "poc/TST-011-shared-regression-tests",
      "--title",
      "Add shared regression tests",
      "--body",
      "Validate shared helpers."
    ],
    "Draft PR command arguments"
  );
}

async function testDraftPrCommandRunner() {
  const config = buildDraftPrConfigStatus({
    repoOwner: "dabeehive",
    repoName: "orchestrator",
    token: "local-placeholder-token"
  });
  const calls = [];
  const result = await runDraftPrCommand({
    approval: {
      id: "approval-002",
      status: "approved",
      type: "final_approval"
    },
    body: "Body",
    config,
    cwd: repoRoot,
    headBranch: "poc/test",
    runCommand: async (command, options) => {
      calls.push({ command, options });

      return {
        exitCode: 0,
        stdout: "https://github.com/dabeehive/orchestrator/pull/42\n"
      };
    },
    title: "Title"
  });

  assertEqual(result.executed, true, "ready Draft PR command executes");
  assertEqual(
    result.prUrl,
    "https://github.com/dabeehive/orchestrator/pull/42",
    "Draft PR URL extracted"
  );
  assertEqual(calls.length, 1, "runner called once");
  assertEqual(calls[0].options.cwd, repoRoot, "runner cwd forwarded");

  const blocked = await runDraftPrCommand({
    approval: {
      id: "approval-003",
      status: "pending",
      type: "final_approval"
    },
    body: "Body",
    config,
    headBranch: "poc/test",
    runCommand: async () => {
      throw new Error("blocked Draft PR command should not execute");
    },
    title: "Title"
  });

  assertEqual(blocked.executed, false, "blocked Draft PR command not executed");
  assertEqual(
    blocked.reason,
    "approval_not_approved",
    "blocked runner reason"
  );
}

function testPrBodyTemplate() {
  const body = buildPrBody({
    approval: {
      id: "approval-001",
      summary: " approved ",
      title: " Final approval ",
      url: "https://example.test/approvals/approval-001"
    },
    artifacts: [
      {
        summary: " all checks passed ",
        title: " Validation report ",
        type: "test_report",
        url: "https://example.test/artifacts/test-report"
      }
    ],
    changedFiles: [
      " scripts/shared-regression-tests.mjs ",
      "",
      "package.json"
    ],
    context: {
      issueId: "TST-011",
      issueTitle: " Add   shared regression tests ",
      issueUrl: "https://example.test/issues/TST-011",
      runId: "run-001"
    },
    diff: {
      id: "diff-001",
      summary: " 2 files changed "
    },
    plan: {
      id: "plan-001"
    },
    summary: " Add deterministic shared helper regression tests. ",
    test: {
      title: "pnpm test:shared",
      summary: " passed "
    },
    validationResults: [" pnpm test:shared passed ", "pnpm lint passed"]
  });

  assertIncludes(
    body,
    "## Summary\nAdd deterministic shared helper regression tests.",
    "summary section"
  );
  assertIncludes(
    body,
    "- Issue: [Add shared regression tests](https://example.test/issues/TST-011) (TST-011)",
    "issue context line"
  );
  assertIncludes(body, "- Run: run-001", "run context line");
  assertIncludes(body, "- Plan: plan-001", "plan reference line");
  assertIncludes(
    body,
    "- Diff: diff-001 - 2 files changed",
    "diff reference line"
  );
  assertIncludes(
    body,
    "- Test: pnpm test:shared - passed",
    "test reference line"
  );
  assertIncludes(
    body,
    "- Approval: [Final approval](https://example.test/approvals/approval-001) - approved",
    "approval reference line"
  );
  assertIncludes(
    body,
    "- scripts/shared-regression-tests.mjs\n- package.json",
    "changed files normalized"
  );
  assertIncludes(
    body,
    "- test_report: [Validation report](https://example.test/artifacts/test-report) - all checks passed",
    "artifact reference line"
  );
  assertEqual(body.endsWith("\n"), true, "PR body ends with newline");
}

function testDiffSummary() {
  const files = parseDiffNumstat(
    [
      "10\t2\tpackages/shared/src/index.ts",
      "-\t-\tapps/server/public/logo.png",
      "3\t0\tpath\twith\ttabs.txt"
    ].join("\n")
  );

  assertEqual(files.length, 3, "numstat file count");
  assertEqual(files[1].binary, true, "binary file detected");
  assertEqual(files[2].path, "path\twith\ttabs.txt", "tab path preserved");

  const summary = buildDiffSummary(files, {
    maxFiles: 2,
    title: "Review diff"
  });

  assertEqual(summary.totalFiles, 3, "summary total files");
  assertEqual(summary.totalInsertions, 13, "summary insertions");
  assertEqual(summary.totalDeletions, 2, "summary deletions");
  assertEqual(summary.binaryFiles, 1, "summary binary file count");
  assertEqual(summary.omittedFiles, 1, "summary omitted file count");
  assertIncludes(
    summary.text,
    "Review diff: 3 files changed (+13/-2, 1 binary file)",
    "summary header"
  );
  assertIncludes(
    summary.text,
    "- apps/server/public/logo.png: binary change",
    "binary summary line"
  );
  assertIncludes(summary.text, "- 1 more file omitted", "omitted summary line");
}

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

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertIncludes(value, expectedSubstring, label) {
  if (!value.includes(expectedSubstring)) {
    throw new Error(`${label}: expected substring ${expectedSubstring}`);
  }
}
