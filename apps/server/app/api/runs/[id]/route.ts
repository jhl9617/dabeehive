import { z } from "zod";

import { apiError, apiSuccess } from "../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../src/lib/db/prisma";
import { validateInput } from "../../../../src/lib/validation";

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

const runParamsSchema = z.object({
  id: z.string().trim().min(1)
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
  updatedAt: true,
  events: {
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      runId: true,
      type: true,
      message: true,
      metadata: true,
      createdAt: true
    }
  }
};

type AgentRole = z.infer<typeof agentRoleSchema>;
type RunStatus = z.infer<typeof runStatusSchema>;
type JsonObject = Record<string, unknown>;
type RunRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RunEventRecord = {
  id: string;
  runId: string;
  type: string;
  message: string | null;
  metadata: JsonObject | null;
  createdAt: Date;
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
  events: RunEventRecord[];
};

type RunEventResponse = Omit<RunEventRecord, "createdAt"> & {
  createdAt: string;
};

type RunResponse = Omit<
  RunRecord,
  "startedAt" | "completedAt" | "createdAt" | "updatedAt" | "events"
> & {
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  events: RunEventResponse[];
};

type RunFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof runSelect;
};

type RunPrismaClient = {
  agentRun: {
    findUnique: (args: RunFindUniqueArgs) => Promise<RunRecord | null>;
  };
};

export async function GET(_request: Request, context: RunRouteContext) {
  const params = await validateRunParams(context);

  if (!params.success) {
    return params.response;
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as RunPrismaClient;
    const run = await prisma.agentRun.findUnique({
      where: {
        id: params.id
      },
      select: runSelect
    });

    if (!run) {
      return runNotFound();
    }

    return apiSuccess(serializeRun(run));
  } catch {
    return apiError("RUN_GET_FAILED", "Failed to get run.", {
      status: 500
    });
  }
}

async function validateRunParams(context: RunRouteContext): Promise<
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      response: ReturnType<typeof apiError>;
    }
> {
  const validation = validateInput(runParamsSchema, await context.params, {
    message: "Invalid run route params."
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

function runNotFound() {
  return apiError("RUN_NOT_FOUND", "Run was not found.", {
    status: 404
  });
}

function serializeRun(run: RunRecord): RunResponse {
  return {
    ...run,
    startedAt: run.startedAt?.toISOString() ?? null,
    completedAt: run.completedAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
    events: run.events.map(serializeRunEvent)
  };
}

function serializeRunEvent(event: RunEventRecord): RunEventResponse {
  return {
    ...event,
    createdAt: event.createdAt.toISOString()
  };
}
