const baseUrl = (process.env.DABEEHIVE_REST_BASE_URL ?? "http://127.0.0.1:18081")
  .replace(/\/+$/, "");
const ownerId = process.env.DABEEHIVE_REST_OWNER_ID ?? "demo-user";
const requestedById = process.env.DABEEHIVE_REST_REQUESTED_BY_ID ?? ownerId;
const bearerToken = process.env.DABEEHIVE_REST_TOKEN?.trim();
const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "");

async function main() {
  const steps = [];
  const project = await request("POST", "/api/projects", {
    ownerId,
    name: `REST Smoke Project ${suffix}`,
    description: "Created by TST-003 REST happy path smoke.",
    status: "active",
    repoProvider: "local",
    defaultBranch: "main"
  });
  assertString(project.id, "project.id");
  steps.push("project.create");

  const issue = await request("POST", "/api/issues", {
    projectId: project.id,
    title: `REST Smoke Issue ${suffix}`,
    body: "Created by TST-003 REST happy path smoke.",
    type: "task",
    status: "ready",
    priority: "high",
    assigneeRole: "backend",
    labels: ["poc", "smoke"]
  });
  assertString(issue.id, "issue.id");
  assertEqual(issue.projectId, project.id, "issue.projectId");
  steps.push("issue.create");

  const run = await request("POST", "/api/runs", {
    projectId: project.id,
    issueId: issue.id,
    agentRole: "planner",
    modelProvider: "local",
    modelId: "rest-smoke",
    inputContext: {
      source: "TST-003",
      issueId: issue.id
    }
  });
  assertString(run.id, "run.id");
  assertEqual(run.projectId, project.id, "run.projectId");
  assertEqual(run.issueId, issue.id, "run.issueId");
  steps.push("run.create");

  const approval = await request("POST", "/api/approvals", {
    issueId: issue.id,
    runId: run.id,
    requestedById,
    type: "spec_approval",
    reason: "REST smoke plan approval.",
    changedFiles: [],
    diffSummary: "No diff; validation smoke only.",
    riskScore: 10,
    requiredAction: "Approve REST smoke plan."
  });
  assertString(approval.id, "approval.id");
  assertEqual(approval.status, "pending", "approval.status");
  steps.push("approval.request");

  const respondedApproval = await request("POST", `/api/approvals/${approval.id}`, {
    action: "approve",
    respondedById: requestedById,
    reason: "Approved by REST smoke."
  });
  assertEqual(respondedApproval.id, approval.id, "respondedApproval.id");
  assertEqual(respondedApproval.status, "approved", "respondedApproval.status");
  steps.push("approval.respond");

  console.log(
    JSON.stringify(
      {
        baseUrl,
        authenticated: Boolean(bearerToken),
        steps,
        projectId: project.id,
        issueId: issue.id,
        runId: run.id,
        approvalId: respondedApproval.id,
        approvalStatus: respondedApproval.status
      },
      null,
      2
    )
  );
}

async function request(method, path, body) {
  const headers = {
    accept: "application/json"
  };

  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (bearerToken) {
    headers.authorization = `Bearer ${bearerToken}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || !("data" in payload)) {
    const error = new Error(`${method} ${path} failed with HTTP ${response.status}`);
    error.details = payload;
    throw error;
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    const error = new Error(`${method} ${path} returned an invalid API response shape`);
    error.details = payload;
    throw error;
  }

  return payload.data;
}

function assertString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }
  process.exit(1);
});
