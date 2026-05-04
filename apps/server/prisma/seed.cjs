const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";
const DEMO_PROJECT_ID = "demo-project";
const DEMO_ISSUE_ID = "demo-issue";
const DEMO_DOCUMENT_ID = "demo-prd";
const DEMO_RUN_ID = "demo-run";
const DEMO_EVENT_ID = "demo-run-event";
const DEMO_APPROVAL_ID = "demo-approval";
const DEMO_ARTIFACT_ID = "demo-plan-artifact";

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      name: "Demo Developer",
      role: "developer"
    },
    create: {
      id: DEMO_USER_ID,
      email: "demo@dabeehive.local",
      name: "Demo Developer",
      role: "developer"
    }
  });

  const project = await prisma.project.upsert({
    where: { id: DEMO_PROJECT_ID },
    update: {
      name: "Dabeehive Orchestrator Demo",
      description: "Local PoC project for migrate and seed validation.",
      status: "active",
      repoProvider: "local",
      defaultBranch: "main",
      workspacePath: "/tmp/dabeehive-orchestrator-demo"
    },
    create: {
      id: DEMO_PROJECT_ID,
      ownerId: user.id,
      name: "Dabeehive Orchestrator Demo",
      description: "Local PoC project for migrate and seed validation.",
      status: "active",
      repoProvider: "local",
      defaultBranch: "main",
      workspacePath: "/tmp/dabeehive-orchestrator-demo"
    }
  });

  const issue = await prisma.issue.upsert({
    where: { id: DEMO_ISSUE_ID },
    update: {
      title: "Validate orchestrator PoC flow",
      body: "Demo issue used by local migrate and seed validation.",
      type: "task",
      status: "backlog",
      priority: "high",
      assigneeRole: "coder",
      labels: ["poc", "demo"]
    },
    create: {
      id: DEMO_ISSUE_ID,
      projectId: project.id,
      title: "Validate orchestrator PoC flow",
      body: "Demo issue used by local migrate and seed validation.",
      type: "task",
      status: "backlog",
      priority: "high",
      assigneeRole: "coder",
      labels: ["poc", "demo"]
    }
  });

  const document = await prisma.document.upsert({
    where: { id: DEMO_DOCUMENT_ID },
    update: {
      type: "prd",
      title: "Demo PRD",
      content: "Demo context document for local PoC validation.",
      version: 1,
      status: "active"
    },
    create: {
      id: DEMO_DOCUMENT_ID,
      projectId: project.id,
      type: "prd",
      title: "Demo PRD",
      content: "Demo context document for local PoC validation.",
      version: 1,
      status: "active"
    }
  });

  const run = await prisma.agentRun.upsert({
    where: { id: DEMO_RUN_ID },
    update: {
      status: "queued",
      agentRole: "planner",
      modelProvider: "local",
      modelId: "demo-adapter",
      inputContext: {
        source: "seed",
        issueId: issue.id,
        documentId: document.id
      }
    },
    create: {
      id: DEMO_RUN_ID,
      projectId: project.id,
      issueId: issue.id,
      status: "queued",
      agentRole: "planner",
      modelProvider: "local",
      modelId: "demo-adapter",
      inputContext: {
        source: "seed",
        issueId: issue.id,
        documentId: document.id
      }
    }
  });

  await prisma.runEvent.upsert({
    where: { id: DEMO_EVENT_ID },
    update: {
      type: "message",
      message: "Demo run queued by seed data.",
      metadata: { source: "seed" }
    },
    create: {
      id: DEMO_EVENT_ID,
      runId: run.id,
      type: "message",
      message: "Demo run queued by seed data.",
      metadata: { source: "seed" }
    }
  });

  await prisma.approval.upsert({
    where: { id: DEMO_APPROVAL_ID },
    update: {
      type: "spec_approval",
      status: "pending",
      reason: "Demo approval for local PoC validation.",
      changedFiles: [],
      diffSummary: "No code changes in seeded approval.",
      riskScore: 10,
      requiredAction: "Review seeded plan before coding."
    },
    create: {
      id: DEMO_APPROVAL_ID,
      issueId: issue.id,
      runId: run.id,
      requestedById: user.id,
      type: "spec_approval",
      status: "pending",
      reason: "Demo approval for local PoC validation.",
      changedFiles: [],
      diffSummary: "No code changes in seeded approval.",
      riskScore: 10,
      requiredAction: "Review seeded plan before coding."
    }
  });

  await prisma.artifact.upsert({
    where: { id: DEMO_ARTIFACT_ID },
    update: {
      type: "plan",
      title: "Demo Implementation Plan",
      content: "Seeded plan artifact for local PoC validation.",
      metadata: { source: "seed" }
    },
    create: {
      id: DEMO_ARTIFACT_ID,
      runId: run.id,
      issueId: issue.id,
      type: "plan",
      title: "Demo Implementation Plan",
      content: "Seeded plan artifact for local PoC validation.",
      metadata: { source: "seed" }
    }
  });

  console.log(
    JSON.stringify(
      {
        userId: user.id,
        projectId: project.id,
        issueId: issue.id,
        documentId: document.id,
        runId: run.id,
        approvalId: DEMO_APPROVAL_ID,
        artifactId: DEMO_ARTIFACT_ID
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
