import { z } from "zod";

import { apiError, apiSuccess } from "../../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../../src/lib/db/prisma";
import { validateInput } from "../../../../../src/lib/validation";

export const dynamic = "force-dynamic";

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

const runParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const createRunEventSchema = z.object({
  type: runEventTypeSchema,
  message: z.string().max(100000).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional()
});

const runEventSelect = {
  id: true,
  runId: true,
  type: true,
  message: true,
  metadata: true,
  createdAt: true
};

type RunEventType = z.infer<typeof runEventTypeSchema>;
type JsonObject = Record<string, unknown>;
type RunEventRouteContext = {
  params: Promise<{
    id: string;
  }>;
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

export async function POST(request: Request, context: RunEventRouteContext) {
  const params = await validateRunParams(context);

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

  const validation = validateInput(createRunEventSchema, body, {
    message: "Invalid run event input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as RunEventPrismaClient;
    const event = await prisma.runEvent.create({
      data: {
        runId: params.id,
        type: validation.data.type,
        message: validation.data.message ?? null,
        metadata: validation.data.metadata ?? null
      },
      select: runEventSelect
    });

    return apiSuccess(serializeRunEvent(event), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return runNotFound();
    }

    return apiError("RUN_EVENT_CREATE_FAILED", "Failed to create run event.", {
      status: 500
    });
  }
}

async function validateRunParams(context: RunEventRouteContext): Promise<
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

function serializeRunEvent(event: RunEventRecord): RunEventResponse {
  return {
    ...event,
    createdAt: event.createdAt.toISOString()
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
