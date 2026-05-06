import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "../../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../../src/lib/db/prisma";
import { validateInput } from "../../../../../src/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

const runParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const streamQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  intervalMs: z.coerce.number().int().min(500).max(10000).default(1000),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

const runStatusSelect = {
  id: true,
  status: true,
  errorMessage: true,
  startedAt: true,
  completedAt: true,
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

const terminalStatuses = new Set<RunStatus>([
  "succeeded",
  "failed",
  "cancelled"
]);

type RunStatus = z.infer<typeof runStatusSchema>;
type RunEventType = z.infer<typeof runEventTypeSchema>;
type JsonObject = Record<string, unknown>;
type RunStreamRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RunStatusRecord = {
  id: string;
  status: RunStatus;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
};

type RunEventRecord = {
  id: string;
  runId: string;
  type: RunEventType;
  message: string | null;
  metadata: JsonObject | null;
  createdAt: Date;
};

type RunStatusResponse = Omit<
  RunStatusRecord,
  "startedAt" | "completedAt" | "updatedAt"
> & {
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
};

type RunEventResponse = Omit<RunEventRecord, "createdAt"> & {
  createdAt: string;
};

type RunFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof runStatusSelect;
};

type RunEventFindManyArgs = {
  where: {
    runId: string;
  };
  orderBy: {
    createdAt: "asc";
  };
  take: number;
  select: typeof runEventSelect;
  cursor?: {
    id: string;
  };
  skip?: number;
};

type RunStreamPrismaClient = {
  agentRun: {
    findUnique: (args: RunFindUniqueArgs) => Promise<RunStatusRecord | null>;
  };
  runEvent: {
    findMany: (args: RunEventFindManyArgs) => Promise<RunEventRecord[]>;
  };
};

type StreamOptions = {
  prisma: RunStreamPrismaClient;
  runId: string;
  initialRun: RunStatusRecord;
  cursor: string | undefined;
  intervalMs: number;
  limit: number;
};

export async function GET(request: NextRequest, context: RunStreamRouteContext) {
  const params = await validateRunParams(context);

  if (!params.success) {
    return params.response;
  }

  const query = {
    cursor:
      request.nextUrl.searchParams.get("cursor") ??
      request.headers.get("last-event-id") ??
      undefined,
    intervalMs: request.nextUrl.searchParams.get("intervalMs") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined
  };
  const validation = validateInput(streamQuerySchema, query, {
    message: "Invalid run stream query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as RunStreamPrismaClient;
    const run = await findRunStatus(prisma, params.id);

    if (!run) {
      return runNotFound();
    }

    const stream = createRunStream({
      prisma,
      runId: params.id,
      initialRun: run,
      cursor: validation.data.cursor,
      intervalMs: validation.data.intervalMs,
      limit: validation.data.limit
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no"
      }
    });
  } catch {
    return apiError("RUN_STREAM_INIT_FAILED", "Failed to initialize run stream.", {
      status: 500
    });
  }
}

async function validateRunParams(context: RunStreamRouteContext): Promise<
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

function createRunStream(options: StreamOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let closed = false;
  let lastEventId = options.cursor ?? "";
  let lastStatusPayload = JSON.stringify(serializeRunStatus(options.initialRun));
  let timer: ReturnType<typeof setTimeout> | undefined;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      sendSse(controller, encoder, {
        event: "run.status",
        data: serializeRunStatus(options.initialRun)
      });

      void pollRun(controller);
    },
    cancel() {
      closed = true;

      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  });

  async function pollRun(
    controller: ReadableStreamDefaultController<Uint8Array>
  ) {
    if (closed) {
      return;
    }

    try {
      const events = await listRunEvents(
        options.prisma,
        options.runId,
        lastEventId,
        options.limit
      );

      for (const event of events) {
        lastEventId = event.id;
        sendSse(controller, encoder, {
          id: event.id,
          event: "run.event",
          data: serializeRunEvent(event)
        });
      }

      const run = await findRunStatus(options.prisma, options.runId);

      if (!run) {
        sendSse(controller, encoder, {
          event: "run.error",
          data: {
            code: "RUN_NOT_FOUND",
            message: "Run was not found."
          }
        });
        closeStream(controller);
        return;
      }

      const statusPayload = JSON.stringify(serializeRunStatus(run));

      if (statusPayload !== lastStatusPayload) {
        lastStatusPayload = statusPayload;
        sendSse(controller, encoder, {
          event: "run.status",
          data: serializeRunStatus(run)
        });
      }

      if (isTerminalRun(run)) {
        sendSse(controller, encoder, {
          event: "run.done",
          data: serializeRunStatus(run)
        });
        closeStream(controller);
        return;
      }

      timer = setTimeout(() => {
        void pollRun(controller);
      }, options.intervalMs);
    } catch {
      sendSse(controller, encoder, {
        event: "run.error",
        data: {
          code: "RUN_STREAM_FAILED",
          message: "Failed to stream run events."
        }
      });
      closeStream(controller);
    }
  }

  function closeStream(controller: ReadableStreamDefaultController<Uint8Array>) {
    if (closed) {
      return;
    }

    closed = true;

    if (timer !== undefined) {
      clearTimeout(timer);
    }

    controller.close();
  }

  function sendSse(
    controller: ReadableStreamDefaultController<Uint8Array>,
    textEncoder: TextEncoder,
    message: SseMessage
  ) {
    if (closed) {
      return;
    }

    controller.enqueue(textEncoder.encode(formatSseMessage(message)));
  }
}

async function findRunStatus(
  prisma: RunStreamPrismaClient,
  runId: string
): Promise<RunStatusRecord | null> {
  return prisma.agentRun.findUnique({
    where: {
      id: runId
    },
    select: runStatusSelect
  });
}

async function listRunEvents(
  prisma: RunStreamPrismaClient,
  runId: string,
  cursor: string,
  limit: number
): Promise<RunEventRecord[]> {
  const args: RunEventFindManyArgs = {
    where: {
      runId
    },
    orderBy: {
      createdAt: "asc"
    },
    take: limit,
    select: runEventSelect
  };

  if (cursor !== "") {
    args.cursor = {
      id: cursor
    };
    args.skip = 1;
  }

  return prisma.runEvent.findMany(args);
}

type SseMessage = {
  id?: string;
  event: string;
  data: unknown;
};

function formatSseMessage(message: SseMessage): string {
  const lines: string[] = [];

  if (message.id !== undefined) {
    lines.push(`id: ${message.id}`);
  }

  lines.push(`event: ${message.event}`);

  for (const line of JSON.stringify(message.data).split("\n")) {
    lines.push(`data: ${line}`);
  }

  lines.push("", "");

  return lines.join("\n");
}

function isTerminalRun(run: RunStatusRecord): boolean {
  return terminalStatuses.has(run.status);
}

function runNotFound() {
  return apiError("RUN_NOT_FOUND", "Run was not found.", {
    status: 404
  });
}

function serializeRunStatus(run: RunStatusRecord): RunStatusResponse {
  return {
    ...run,
    startedAt: run.startedAt?.toISOString() ?? null,
    completedAt: run.completedAt?.toISOString() ?? null,
    updatedAt: run.updatedAt.toISOString()
  };
}

function serializeRunEvent(event: RunEventRecord): RunEventResponse {
  return {
    ...event,
    createdAt: event.createdAt.toISOString()
  };
}
