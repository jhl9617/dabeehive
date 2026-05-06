const baseUrl = (process.env.DABEEHIVE_REST_BASE_URL ?? "http://127.0.0.1:18081")
  .replace(/\/+$/, "");
const ownerId = process.env.DABEEHIVE_REST_OWNER_ID ?? "demo-user";
const requestedById = process.env.DABEEHIVE_REST_REQUESTED_BY_ID ?? ownerId;
const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "");

async function main() {
  const project = await request("POST", "/api/projects", {
    ownerId,
    name: `REST Smoke Project ${suffix}`,
    description: "Created by TST-003 REST happy path smoke.",
    status: "active",
    repoProvider: "local",
    defaultBranch: "main"
  });

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

  const respondedApproval = await request("POST", `/api/approvals/${approval.id}`, {
    action: "approve",
    respondedById: requestedById,
    reason: "Approved by REST smoke."
  });

  console.log(
    JSON.stringify(
      {
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
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || !("data" in payload)) {
    const error = new Error(`${method} ${path} failed with HTTP ${response.status}`);
    error.details = payload;
    throw error;
  }

  return payload.data;
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }
  process.exit(1);
});
