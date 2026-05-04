import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

export const dynamic = "force-dynamic";

const projectStatusSchema = z.enum([
  "draft",
  "active",
  "at_risk",
  "released",
  "archived"
]);

const listProjectsSchema = z.object({
  ownerId: z.string().trim().min(1).optional(),
  status: projectStatusSchema.optional()
});

const createProjectSchema = z.object({
  ownerId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(5000).nullable().optional(),
  status: projectStatusSchema.default("draft"),
  repoProvider: z.string().trim().max(50).nullable().optional(),
  repoUrl: z.string().trim().url().max(2048).nullable().optional(),
  repoOwner: z.string().trim().max(120).nullable().optional(),
  repoName: z.string().trim().max(120).nullable().optional(),
  defaultBranch: z.string().trim().max(120).nullable().optional(),
  workspacePath: z.string().trim().max(2048).nullable().optional()
});

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

type ProjectCreateArgs = {
  data: z.infer<typeof createProjectSchema>;
  select: typeof projectSelect;
};

type ProjectPrismaClient = {
  project: {
    findMany: (args: ProjectFindManyArgs) => Promise<ProjectRecord[]>;
    create: (args: ProjectCreateArgs) => Promise<ProjectRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    ownerId: request.nextUrl.searchParams.get("ownerId") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined
  };
  const validation = validateInput(listProjectsSchema, query, {
    message: "Invalid project query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
    const projects = await prisma.project.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: projectSelect
    });

    return apiSuccess(projects.map(serializeProject));
  } catch {
    return apiError("PROJECT_LIST_FAILED", "Failed to list projects.", {
      status: 500
    });
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", {
      status: 400
    });
  }

  const validation = validateInput(createProjectSchema, body, {
    message: "Invalid project input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
    const project = await prisma.project.create({
      data: validation.data,
      select: projectSelect
    });

    return apiSuccess(serializeProject(project), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("PROJECT_OWNER_NOT_FOUND", "Project owner does not exist.", {
        status: 400
      });
    }

    return apiError("PROJECT_CREATE_FAILED", "Failed to create project.", {
      status: 500
    });
  }
}

function serializeProject(project: ProjectRecord): ProjectResponse {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}
