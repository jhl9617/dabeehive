import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import { getPrismaClient } from "../../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const mcpHandler = createMcpHandler(
  (server) => {
    registerProjectTools(server);
    registerIssueTools(server);
    registerRunTools(server);
    registerRunEventTools(server);
    registerApprovalTools(server);
    registerArtifactTools(server);
  },
  {
    serverInfo: {
      name: "dabeehive-orchestrator",
      version: "0.0.0"
    }
  },
  {
    basePath: "/api",
    disableSse: true,
    maxDuration: 60,
    verboseLogs: false
  }
);

const handler = withMcpAuth(mcpHandler, verifyBearerToken, {
  required: true
});

export { handler as DELETE, handler as GET, handler as POST };

const projectStatusSchema = z.enum([
  "draft",
  "active",
  "at_risk",
  "released",
  "archived"
]);
const issueTypeSchema = z.enum(["epic", "story", "task", "bug"]);
const issueStatusSchema = z.enum([
  "backlog",
  "ready",
  "in_progress",
  "in_review",
  "qa",
  "done"
]);
const issuePrioritySchema = z.enum(["critical", "high", "medium", "low"]);
const agentRoleSchema = z.enum([
  "planner",
  "architect",
  "backend",
  "frontend",
  "qa",
  "release"
]);
const runStatusSchema = z.enum([
  "queued",
  "planning",
  "waiting_approval",
  "coding",
  "reviewing",
  "succeeded",
  "failed",
  "cancelled"
]);
const runEventTypeSchema = z.enum([
  "message",
  "tool_call",
  "tool_result",
  "file_change",
  "command",
  "test_result",
  "error",
  "done"
]);
const approvalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "changes_requested"
]);
const approvalTypeSchema = z.enum([
  "schema_change",
  "auth_change",
  "billing_change",
  "prod_deploy",
  "spec_approval",
  "final_approval",
  "risk_approval",
  "general"
]);
const approvalResponseActionSchema = z.enum([
  "approve",
  "reject",
  "request_changes"
]);
const artifactTypeSchema = z.enum([
  "plan",
  "diff",
  "test_report",
  "review",
  "pr_url",
  "log"
]);

const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  repoProvider: true,
  repoUrl: true,
  repoOwner: true,
  repoName: true,
  defaultBranch: true,
  workspacePath: true,
  createdAt: true,
  updatedAt: true
};

const issueSelect = {
  id: true,
  projectId: true,
  parentId: true,
  title: true,
  body: true,
  type: true,
  status: true,
  priority: true,
  assigneeRole: true,
  labels: true,
  createdAt: true,
  updatedAt: true
};

const runSelect = {
  id: true,
  projectId: true,
  issueId: true,
  status: true,
  agentRole: true,
  modelProvider: true,
  modelId: true,
  inputContext: true,
  outputSummary: true,
  outputArtifacts: true,
  errorMessage: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
};

const runEventSelect = {
  id: true,
  runId: true,
  type: true,
  message: true,
  metadata: true,
  createdAt: true
};

const approvalSelect = {
  id: true,
  issueId: true,
  runId: true,
  requestedById: true,
  respondedById: true,
  type: true,
  status: true,
  reason: true,
  changedFiles: true,
  diffSummary: true,
  riskScore: true,
  requiredAction: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true
};

const artifactSelect = {
  id: true,
  runId: true,
  issueId: true,
  type: true,
  title: true,
  content: true,
  uri: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
};

type ProjectStatus = z.infer<typeof projectStatusSchema>;
type IssueType = z.infer<typeof issueTypeSchema>;
type IssueStatus = z.infer<typeof issueStatusSchema>;
type IssuePriority = z.infer<typeof issuePrioritySchema>;
type AgentRole = z.infer<typeof agentRoleSchema>;
type RunStatus = z.infer<typeof runStatusSchema>;
type RunEventType = z.infer<typeof runEventTypeSchema>;
type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
type ApprovalType = z.infer<typeof approvalTypeSchema>;
type ApprovalResponseAction = z.infer<typeof approvalResponseActionSchema>;
type ArtifactType = z.infer<typeof artifactTypeSchema>;
type JsonObject = Record<string, unknown>;

type ProjectRecord = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  repoProvider: string | null;
  repoUrl: string | null;
  repoOwner: string | null;
  repoName: string | null;
  defaultBranch: string | null;
  workspacePath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectResponse = Omit<ProjectRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type IssueRecord = {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  body: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeRole: AgentRole | null;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
};

type IssueResponse = Omit<IssueRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type RunRecord = {
  id: string;
  projectId: string;
  issueId: string | null;
  status: RunStatus;
  agentRole: AgentRole;
  modelProvider: string | null;
  modelId: string | null;
  inputContext: JsonObject | null;
  outputSummary: string | null;
  outputArtifacts: JsonObject | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type RunResponse = Omit<
  RunRecord,
  "startedAt" | "completedAt" | "createdAt" | "updatedAt"
> & {
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type RunEventRecord = {
  id: string;
  runId: string;
  type: RunEventType;
  message: string | null;
  metadata: JsonObject | null;
  createdAt: Date;
};

type RunEventResponse = Omit<RunEventRecord, "createdAt"> & {
  createdAt: string;
};

type ApprovalRecord = {
  id: string;
  issueId: string | null;
  runId: string | null;
  requestedById: string | null;
  respondedById: string | null;
  type: ApprovalType;
  status: ApprovalStatus;
  reason: string | null;
  changedFiles: string[];
  diffSummary: string | null;
  riskScore: number | null;
  requiredAction: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ApprovalResponse = Omit<
  ApprovalRecord,
  "respondedAt" | "createdAt" | "updatedAt"
> & {
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ArtifactRecord = {
  id: string;
  runId: string;
  issueId: string | null;
  type: ArtifactType;
  title: string | null;
  content: string | null;
  uri: string | null;
  metadata: JsonObject | null;
  createdAt: Date;
  updatedAt: Date;
};

type ArtifactResponse = Omit<ArtifactRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type ProjectFindManyArgs = {
  where?: {
    ownerId?: string;
    status?: ProjectStatus;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof projectSelect;
};

type ProjectFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof projectSelect;
};

type ProjectPrismaClient = {
  project: {
    findMany: (args: ProjectFindManyArgs) => Promise<ProjectRecord[]>;
    findUnique: (args: ProjectFindUniqueArgs) => Promise<ProjectRecord | null>;
  };
};

type IssueFindManyArgs = {
  where?: {
    projectId?: string;
    parentId?: string;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeRole?: AgentRole;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof issueSelect;
};

type IssueFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof issueSelect;
};

type IssueCreateData = {
  projectId: string;
  parentId?: string | null;
  title: string;
  body?: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeRole?: AgentRole | null;
  labels: string[];
};

type IssueCreateArgs = {
  data: IssueCreateData;
  select: typeof issueSelect;
};

type IssuePrismaClient = {
  issue: {
    findMany: (args: IssueFindManyArgs) => Promise<IssueRecord[]>;
    findUnique: (args: IssueFindUniqueArgs) => Promise<IssueRecord | null>;
    create: (args: IssueCreateArgs) => Promise<IssueRecord>;
  };
};

type RunFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof runSelect;
};

type RunCreateData = {
  projectId: string;
  issueId?: string | null;
  agentRole: AgentRole;
  modelProvider?: string | null;
  modelId?: string | null;
  inputContext?: JsonObject | null;
  status: "queued";
};

type RunCreateArgs = {
  data: RunCreateData;
  select: typeof runSelect;
};

type RunPrismaClient = {
  agentRun: {
    findUnique: (args: RunFindUniqueArgs) => Promise<RunRecord | null>;
    create: (args: RunCreateArgs) => Promise<RunRecord>;
  };
};

type RunEventCreateArgs = {
  data: {
    runId: string;
    type: RunEventType;
    message: string | null;
    metadata: JsonObject | null;
  };
  select: typeof runEventSelect;
};

type RunEventPrismaClient = {
  runEvent: {
    create: (args: RunEventCreateArgs) => Promise<RunEventRecord>;
  };
};

type ApprovalFindManyArgs = {
  where?: {
    issueId?: string;
    runId?: string;
    status?: ApprovalStatus;
    type?: ApprovalType;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof approvalSelect;
};

type ApprovalCreateData = {
  issueId: string | null;
  runId: string | null;
  requestedById?: string | null;
  type: ApprovalType;
  status: "pending";
  reason?: string | null;
  changedFiles: string[];
  diffSummary?: string | null;
  riskScore?: number | null;
  requiredAction?: string | null;
};

type ApprovalCreateArgs = {
  data: ApprovalCreateData;
  select: typeof approvalSelect;
};

type ApprovalUpdateArgs = {
  where: {
    id: string;
  };
  data: {
    status: Exclude<ApprovalStatus, "pending">;
    respondedById: string | null;
    respondedAt: Date;
    reason?: string | null;
  };
  select: typeof approvalSelect;
};

type ApprovalPrismaClient = {
  approval: {
    findMany: (args: ApprovalFindManyArgs) => Promise<ApprovalRecord[]>;
    create: (args: ApprovalCreateArgs) => Promise<ApprovalRecord>;
    update: (args: ApprovalUpdateArgs) => Promise<ApprovalRecord>;
  };
};

type ArtifactFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof artifactSelect;
};

type ArtifactCreateArgs = {
  data: {
    runId: string;
    issueId: string | null;
    type: ArtifactType;
    title: string | null;
    content: string | null;
    uri: string | null;
    metadata: JsonObject | null;
  };
  select: typeof artifactSelect;
};

type ArtifactPrismaClient = {
  artifact: {
    findUnique: (args: ArtifactFindUniqueArgs) => Promise<ArtifactRecord | null>;
    create: (args: ArtifactCreateArgs) => Promise<ArtifactRecord>;
  };
};

function registerProjectTools(server: McpServer): void {
  server.registerTool(
    "project.list",
    {
      title: "List projects",
      description: "List orchestrator projects.",
      inputSchema: {
        ownerId: z.string().trim().min(1).optional(),
        status: projectStatusSchema.optional()
      }
    },
    async (args) => {
      const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
      const projects = await prisma.project.findMany({
        where: args,
        orderBy: {
          createdAt: "desc"
        },
        select: projectSelect
      });

      return jsonToolResult({
        data: projects.map(serializeProject)
      });
    }
  );

  server.registerTool(
    "project.get",
    {
      title: "Get project",
      description: "Get one orchestrator project by id.",
      inputSchema: {
        id: z.string().trim().min(1)
      }
    },
    async ({ id }) => {
      const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
      const project = await prisma.project.findUnique({
        where: {
          id
        },
        select: projectSelect
      });

      if (!project) {
        return jsonToolResult(
          {
            error: {
              code: "PROJECT_NOT_FOUND",
              message: "Project was not found."
            }
          },
          true
        );
      }

      return jsonToolResult({
        data: serializeProject(project)
      });
    }
  );
}

function registerIssueTools(server: McpServer): void {
  server.registerTool(
    "issue.list",
    {
      title: "List issues",
      description: "List orchestrator issues.",
      inputSchema: {
        projectId: z.string().trim().min(1).optional(),
        parentId: z.string().trim().min(1).optional(),
        type: issueTypeSchema.optional(),
        status: issueStatusSchema.optional(),
        priority: issuePrioritySchema.optional(),
        assigneeRole: agentRoleSchema.optional()
      }
    },
    async (args) => {
      try {
        const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
        const issues = await prisma.issue.findMany({
          where: args,
          orderBy: {
            createdAt: "desc"
          },
          select: issueSelect
        });

        return jsonToolResult({
          data: issues.map(serializeIssue)
        });
      } catch {
        return jsonToolResult(
          {
            error: {
              code: "ISSUE_LIST_FAILED",
              message: "Failed to list issues."
            }
          },
          true
        );
      }
    }
  );

  server.registerTool(
    "issue.get",
    {
      title: "Get issue",
      description: "Get one orchestrator issue by id.",
      inputSchema: {
        id: z.string().trim().min(1)
      }
    },
    async ({ id }) => {
      try {
        const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
        const issue = await prisma.issue.findUnique({
          where: {
            id
          },
          select: issueSelect
        });

        if (!issue) {
          return issueToolError("ISSUE_NOT_FOUND", "Issue was not found.");
        }

        return jsonToolResult({
          data: serializeIssue(issue)
        });
      } catch {
        return issueToolError("ISSUE_GET_FAILED", "Failed to get issue.");
      }
    }
  );

  server.registerTool(
    "issue.create",
    {
      title: "Create issue",
      description: "Create one orchestrator issue.",
      inputSchema: {
        projectId: z.string().trim().min(1),
        parentId: z.string().trim().min(1).nullable().optional(),
        title: z.string().trim().min(1).max(200),
        body: z.string().trim().max(20000).nullable().optional(),
        type: issueTypeSchema.default("task"),
        status: issueStatusSchema.default("backlog"),
        priority: issuePrioritySchema.default("medium"),
        assigneeRole: agentRoleSchema.nullable().optional(),
        labels: z.array(z.string().trim().min(1).max(50)).max(20).default([])
      }
    },
    async (args) => {
      try {
        const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
        const issue = await prisma.issue.create({
          data: args,
          select: issueSelect
        });

        return jsonToolResult({
          data: serializeIssue(issue)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2003")) {
          return issueToolError(
            "ISSUE_PROJECT_OR_PARENT_NOT_FOUND",
            "Issue project or parent issue does not exist."
          );
        }

        return issueToolError("ISSUE_CREATE_FAILED", "Failed to create issue.");
      }
    }
  );
}

function registerRunTools(server: McpServer): void {
  server.registerTool(
    "run.start",
    {
      title: "Start run",
      description: "Create a queued orchestrator agent run.",
      inputSchema: {
        projectId: z.string().trim().min(1),
        issueId: z.string().trim().min(1).nullable().optional(),
        agentRole: agentRoleSchema,
        modelProvider: z.string().trim().max(50).nullable().optional(),
        modelId: z.string().trim().max(120).nullable().optional(),
        inputContext: z.record(z.unknown()).nullable().optional()
      }
    },
    async (args) => {
      try {
        const prisma = (await getPrismaClient()) as unknown as RunPrismaClient;
        const run = await prisma.agentRun.create({
          data: {
            ...args,
            status: "queued"
          },
          select: runSelect
        });

        return jsonToolResult({
          data: serializeRun(run)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2003")) {
          return runToolError(
            "RUN_PROJECT_OR_ISSUE_NOT_FOUND",
            "Run project or issue does not exist."
          );
        }

        return runToolError("RUN_START_FAILED", "Failed to start run.");
      }
    }
  );

  server.registerTool(
    "run.status",
    {
      title: "Get run status",
      description: "Get one orchestrator run status by id.",
      inputSchema: {
        id: z.string().trim().min(1)
      }
    },
    async ({ id }) => {
      try {
        const prisma = (await getPrismaClient()) as unknown as RunPrismaClient;
        const run = await prisma.agentRun.findUnique({
          where: {
            id
          },
          select: runSelect
        });

        if (!run) {
          return runToolError("RUN_NOT_FOUND", "Run was not found.");
        }

        return jsonToolResult({
          data: serializeRun(run)
        });
      } catch {
        return runToolError("RUN_STATUS_FAILED", "Failed to get run status.");
      }
    }
  );
}

function registerRunEventTools(server: McpServer): void {
  server.registerTool(
    "run.append_event",
    {
      title: "Append run event",
      description: "Append a normalized SDK event to an orchestrator run.",
      inputSchema: {
        runId: z.string().trim().min(1),
        type: runEventTypeSchema,
        message: z.string().max(100000).nullable().optional(),
        metadata: z.record(z.unknown()).nullable().optional()
      }
    },
    async (args) => {
      try {
        const prisma =
          (await getPrismaClient()) as unknown as RunEventPrismaClient;
        const event = await prisma.runEvent.create({
          data: {
            runId: args.runId,
            type: args.type,
            message: args.message ?? null,
            metadata: args.metadata ?? null
          },
          select: runEventSelect
        });

        return jsonToolResult({
          data: serializeRunEvent(event)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2003")) {
          return runToolError("RUN_NOT_FOUND", "Run was not found.");
        }

        return runToolError(
          "RUN_EVENT_APPEND_FAILED",
          "Failed to append run event."
        );
      }
    }
  );
}

function registerApprovalTools(server: McpServer): void {
  server.registerTool(
    "approval.list",
    {
      title: "List approvals",
      description: "List orchestrator approvals.",
      inputSchema: {
        issueId: z.string().trim().min(1).optional(),
        runId: z.string().trim().min(1).optional(),
        status: approvalStatusSchema.optional(),
        type: approvalTypeSchema.optional()
      }
    },
    async (args) => {
      try {
        const prisma =
          (await getPrismaClient()) as unknown as ApprovalPrismaClient;
        const approvals = await prisma.approval.findMany({
          where: args,
          orderBy: {
            createdAt: "desc"
          },
          select: approvalSelect
        });

        return jsonToolResult({
          data: approvals.map(serializeApproval)
        });
      } catch {
        return approvalToolError(
          "APPROVAL_LIST_FAILED",
          "Failed to list approvals."
        );
      }
    }
  );

  server.registerTool(
    "approval.request",
    {
      title: "Request approval",
      description: "Create a human approval request.",
      inputSchema: {
        issueId: z.string().trim().min(1).nullable().optional(),
        runId: z.string().trim().min(1).nullable().optional(),
        requestedById: z.string().trim().min(1).nullable().optional(),
        type: approvalTypeSchema,
        reason: z.string().trim().min(1).max(100000).nullable().optional(),
        changedFiles: z
          .array(z.string().trim().min(1).max(1000))
          .max(100)
          .default([]),
        diffSummary: z.string().trim().max(100000).nullable().optional(),
        riskScore: z.number().int().min(0).max(100).nullable().optional(),
        requiredAction: z.string().trim().max(100000).nullable().optional()
      }
    },
    async (args) => {
      if (!args.issueId && !args.runId) {
        return approvalToolError(
          "APPROVAL_TARGET_REQUIRED",
          "Approval requires an issueId or runId."
        );
      }

      try {
        const prisma =
          (await getPrismaClient()) as unknown as ApprovalPrismaClient;
        const approval = await prisma.approval.create({
          data: {
            issueId: args.issueId ?? null,
            runId: args.runId ?? null,
            requestedById: args.requestedById ?? null,
            type: args.type,
            status: "pending",
            reason: args.reason ?? null,
            changedFiles: args.changedFiles,
            diffSummary: args.diffSummary ?? null,
            riskScore: args.riskScore ?? null,
            requiredAction: args.requiredAction ?? null
          },
          select: approvalSelect
        });

        return jsonToolResult({
          data: serializeApproval(approval)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2003")) {
          return approvalToolError(
            "APPROVAL_TARGET_OR_REQUESTER_NOT_FOUND",
            "Approval issue, run, or requester does not exist."
          );
        }

        return approvalToolError(
          "APPROVAL_REQUEST_FAILED",
          "Failed to request approval."
        );
      }
    }
  );

  server.registerTool(
    "approval.respond",
    {
      title: "Respond to approval",
      description: "Approve, reject, or request changes for an approval.",
      inputSchema: {
        id: z.string().trim().min(1),
        action: approvalResponseActionSchema,
        respondedById: z.string().trim().min(1).nullable().optional(),
        reason: z.string().trim().min(1).max(100000).nullable().optional()
      }
    },
    async (args) => {
      try {
        const prisma =
          (await getPrismaClient()) as unknown as ApprovalPrismaClient;
        const approval = await prisma.approval.update({
          where: {
            id: args.id
          },
          data: {
            status: mapApprovalStatus(args.action),
            respondedById: args.respondedById ?? null,
            respondedAt: new Date(),
            ...(args.reason !== undefined
              ? {
                  reason: args.reason
                }
              : {})
          },
          select: approvalSelect
        });

        return jsonToolResult({
          data: serializeApproval(approval)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2025")) {
          return approvalToolError("APPROVAL_NOT_FOUND", "Approval was not found.");
        }

        if (hasPrismaErrorCode(error, "P2003")) {
          return approvalToolError(
            "APPROVAL_RESPONDER_NOT_FOUND",
            "Approval responder does not exist."
          );
        }

        return approvalToolError(
          "APPROVAL_RESPOND_FAILED",
          "Failed to respond to approval."
        );
      }
    }
  );
}

function registerArtifactTools(server: McpServer): void {
  server.registerTool(
    "artifact.create",
    {
      title: "Create artifact",
      description: "Create an orchestrator run artifact.",
      inputSchema: {
        runId: z.string().trim().min(1),
        issueId: z.string().trim().min(1).nullable().optional(),
        type: artifactTypeSchema,
        title: z.string().trim().min(1).max(200).nullable().optional(),
        content: z.string().trim().min(1).max(1000000).nullable().optional(),
        uri: z.string().trim().min(1).max(2000).nullable().optional(),
        metadata: z.record(z.unknown()).nullable().optional()
      }
    },
    async (args) => {
      if (!args.content && !args.uri) {
        return artifactToolError(
          "ARTIFACT_CONTENT_OR_URI_REQUIRED",
          "Artifact content or uri must be provided."
        );
      }

      try {
        const prisma =
          (await getPrismaClient()) as unknown as ArtifactPrismaClient;
        const artifact = await prisma.artifact.create({
          data: {
            runId: args.runId,
            issueId: args.issueId ?? null,
            type: args.type,
            title: args.title ?? null,
            content: args.content ?? null,
            uri: args.uri ?? null,
            metadata: args.metadata ?? null
          },
          select: artifactSelect
        });

        return jsonToolResult({
          data: serializeArtifact(artifact)
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, "P2003")) {
          return artifactToolError(
            "ARTIFACT_RUN_OR_ISSUE_NOT_FOUND",
            "Artifact run or issue does not exist."
          );
        }

        return artifactToolError(
          "ARTIFACT_CREATE_FAILED",
          "Failed to create artifact."
        );
      }
    }
  );

  server.registerTool(
    "artifact.get",
    {
      title: "Get artifact",
      description: "Get one orchestrator artifact by id.",
      inputSchema: {
        id: z.string().trim().min(1)
      }
    },
    async ({ id }) => {
      try {
        const prisma =
          (await getPrismaClient()) as unknown as ArtifactPrismaClient;
        const artifact = await prisma.artifact.findUnique({
          where: {
            id
          },
          select: artifactSelect
        });

        if (!artifact) {
          return artifactToolError(
            "ARTIFACT_NOT_FOUND",
            "Artifact was not found."
          );
        }

        return jsonToolResult({
          data: serializeArtifact(artifact)
        });
      } catch {
        return artifactToolError(
          "ARTIFACT_GET_FAILED",
          "Failed to get artifact."
        );
      }
    }
  );
}

function verifyBearerToken(
  _request: Request,
  bearerToken?: string
): AuthInfo | undefined {
  const token = bearerToken?.trim();

  if (!token) {
    return undefined;
  }

  return {
    token,
    clientId: "poc-mcp-client",
    scopes: []
  };
}

function serializeProject(project: ProjectRecord): ProjectResponse {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

function serializeIssue(issue: IssueRecord): IssueResponse {
  return {
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString()
  };
}

function serializeRun(run: RunRecord): RunResponse {
  return {
    ...run,
    startedAt: run.startedAt?.toISOString() ?? null,
    completedAt: run.completedAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString()
  };
}

function serializeRunEvent(event: RunEventRecord): RunEventResponse {
  return {
    ...event,
    createdAt: event.createdAt.toISOString()
  };
}

function serializeApproval(approval: ApprovalRecord): ApprovalResponse {
  return {
    ...approval,
    respondedAt: approval.respondedAt?.toISOString() ?? null,
    createdAt: approval.createdAt.toISOString(),
    updatedAt: approval.updatedAt.toISOString()
  };
}

function serializeArtifact(artifact: ArtifactRecord): ArtifactResponse {
  return {
    ...artifact,
    createdAt: artifact.createdAt.toISOString(),
    updatedAt: artifact.updatedAt.toISOString()
  };
}

function mapApprovalStatus(
  action: ApprovalResponseAction
): Exclude<ApprovalStatus, "pending"> {
  if (action === "approve") {
    return "approved";
  }

  if (action === "reject") {
    return "rejected";
  }

  return "changes_requested";
}

function issueToolError(code: string, message: string) {
  return jsonToolResult(
    {
      error: {
        code,
        message
      }
    },
    true
  );
}

function runToolError(code: string, message: string) {
  return jsonToolResult(
    {
      error: {
        code,
        message
      }
    },
    true
  );
}

function approvalToolError(code: string, message: string) {
  return jsonToolResult(
    {
      error: {
        code,
        message
      }
    },
    true
  );
}

function artifactToolError(code: string, message: string) {
  return jsonToolResult(
    {
      error: {
        code,
        message
      }
    },
    true
  );
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function jsonToolResult(value: unknown, isError = false) {
  return {
    isError,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value)
      }
    ]
  };
}
