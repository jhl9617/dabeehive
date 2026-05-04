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

type ProjectStatus = z.infer<typeof projectStatusSchema>;
type IssueType = z.infer<typeof issueTypeSchema>;
type IssueStatus = z.infer<typeof issueStatusSchema>;
type IssuePriority = z.infer<typeof issuePrioritySchema>;
type AgentRole = z.infer<typeof agentRoleSchema>;
type RunStatus = z.infer<typeof runStatusSchema>;
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
