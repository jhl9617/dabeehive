import { z } from "zod";

import { apiError, apiSuccess } from "../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../src/lib/db/prisma";
import { validateInput } from "../../../../src/lib/validation";

export const dynamic = "force-dynamic";

const projectStatusSchema = z.enum([
  "draft",
  "active",
  "at_risk",
  "released",
  "archived"
]);

const projectParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: projectStatusSchema.optional(),
    repoProvider: z.string().trim().max(50).nullable().optional(),
    repoUrl: z.string().trim().url().max(2048).nullable().optional(),
    repoOwner: z.string().trim().max(120).nullable().optional(),
    repoName: z.string().trim().max(120).nullable().optional(),
    defaultBranch: z.string().trim().max(120).nullable().optional(),
    workspacePath: z.string().trim().max(2048).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one project field must be provided."
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
type ProjectRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

type ProjectFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof projectSelect;
};

type ProjectUpdateArgs = {
  where: {
    id: string;
  };
  data: z.infer<typeof updateProjectSchema>;
  select: typeof projectSelect;
};

type ProjectPrismaClient = {
  project: {
    findUnique: (args: ProjectFindUniqueArgs) => Promise<ProjectRecord | null>;
    update: (args: ProjectUpdateArgs) => Promise<ProjectRecord>;
  };
};

export async function GET(_request: Request, context: ProjectRouteContext) {
  const params = await validateProjectParams(context);

  if (!params.success) {
    return params.response;
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
    const project = await prisma.project.findUnique({
      where: {
        id: params.id
      },
      select: projectSelect
    });

    if (!project) {
      return projectNotFound();
    }

    return apiSuccess(serializeProject(project));
  } catch {
    return apiError("PROJECT_GET_FAILED", "Failed to get project.", {
      status: 500
    });
  }
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const params = await validateProjectParams(context);

  if (!params.success) {
    return params.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", {
      status: 400
    });
  }

  const validation = validateInput(updateProjectSchema, body, {
    message: "Invalid project update input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ProjectPrismaClient;
    const project = await prisma.project.update({
      where: {
        id: params.id
      },
      data: validation.data,
      select: projectSelect
    });

    return apiSuccess(serializeProject(project));
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2025")) {
      return projectNotFound();
    }

    return apiError("PROJECT_UPDATE_FAILED", "Failed to update project.", {
      status: 500
    });
  }
}

async function validateProjectParams(context: ProjectRouteContext): Promise<
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      response: ReturnType<typeof apiError>;
    }
> {
  const validation = validateInput(projectParamsSchema, await context.params, {
    message: "Invalid project route params."
  });

  if (!validation.success) {
    return {
      success: false,
      response: apiError(validation.error.code, validation.error.message, {
        status: 400,
        details: validation.error.details
      })
    };
  }

  return {
    success: true,
    id: validation.data.id
  };
}

function projectNotFound() {
  return apiError("PROJECT_NOT_FOUND", "Project was not found.", {
    status: 404
  });
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
