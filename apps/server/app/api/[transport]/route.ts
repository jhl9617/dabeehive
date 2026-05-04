import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import { getPrismaClient } from "../../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const mcpHandler = createMcpHandler(
  (server) => {
    registerProjectTools(server);
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

type ProjectStatus = z.infer<typeof projectStatusSchema>;

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
