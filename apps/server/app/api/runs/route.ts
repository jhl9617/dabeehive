import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

export const dynamic = "force-dynamic";

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

const listRunsSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  issueId: z.string().trim().min(1).optional(),
  status: runStatusSchema.optional(),
  agentRole: agentRoleSchema.optional()
});

const createRunSchema = z.object({
  projectId: z.string().trim().min(1),
  issueId: z.string().trim().min(1).nullable().optional(),
  agentRole: agentRoleSchema,
  modelProvider: z.string().trim().max(50).nullable().optional(),
  modelId: z.string().trim().max(120).nullable().optional(),
  inputContext: z.record(z.unknown()).nullable().optional()
});

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

type AgentRole = z.infer<typeof agentRoleSchema>;
type RunStatus = z.infer<typeof runStatusSchema>;
type JsonObject = Record<string, unknown>;

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

type RunFindManyArgs = {
  where?: {
    projectId?: string;
    issueId?: string;
    status?: RunStatus;
    agentRole?: AgentRole;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof runSelect;
};

type RunCreateArgs = {
  data: z.infer<typeof createRunSchema> & {
    status: "queued";
  };
  select: typeof runSelect;
};

type RunPrismaClient = {
  agentRun: {
    findMany: (args: RunFindManyArgs) => Promise<RunRecord[]>;
    create: (args: RunCreateArgs) => Promise<RunRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    projectId: request.nextUrl.searchParams.get("projectId") ?? undefined,
    issueId: request.nextUrl.searchParams.get("issueId") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    agentRole: request.nextUrl.searchParams.get("agentRole") ?? undefined
  };
  const validation = validateInput(listRunsSchema, query, {
    message: "Invalid run query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as RunPrismaClient;
    const runs = await prisma.agentRun.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: runSelect
    });

    return apiSuccess(runs.map(serializeRun));
  } catch {
    return apiError("RUN_LIST_FAILED", "Failed to list runs.", {
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

  const validation = validateInput(createRunSchema, body, {
    message: "Invalid run input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as RunPrismaClient;
    const run = await prisma.agentRun.create({
      data: {
        ...validation.data,
        status: "queued"
      },
      select: runSelect
    });

    return apiSuccess(serializeRun(run), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("RUN_PROJECT_OR_ISSUE_NOT_FOUND", "Run project or issue does not exist.", {
        status: 400
      });
    }

    return apiError("RUN_CREATE_FAILED", "Failed to create run.", {
      status: 500
    });
  }
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

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}
