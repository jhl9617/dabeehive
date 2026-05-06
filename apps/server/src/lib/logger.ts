import { redactSecrets } from "./security/secret-redaction";

export type ServerLogLevel = "debug" | "info" | "warn" | "error";

export type ServerLogContext = Record<string, unknown>;

export type ServerLogError = {
  name?: string;
  message: string;
  stack?: string;
  cause?: unknown;
};

export type ServerLogEntry = {
  createdAt: string;
  service: string;
  level: ServerLogLevel;
  message: string;
  context?: ServerLogContext;
  error?: ServerLogError | unknown;
};

export type ServerLogSink = (
  entry: ServerLogEntry,
  serializedEntry: string
) => void;

export type ServerLoggerOptions = {
  service?: string;
  minLevel?: ServerLogLevel;
  clock?: () => Date;
  sink?: ServerLogSink;
};

export type ApiRequestLogInput = {
  method: string;
  path: string;
  status?: number;
  durationMs?: number;
  requestId?: string;
  metadata?: ServerLogContext;
};

export type ApiErrorLogInput = ApiRequestLogInput & {
  code: string;
  error?: unknown;
};

export type RunEventLogInput = {
  runId: string;
  type: string;
  message?: string;
  metadata?: ServerLogContext;
};

export type ServerLogger = {
  debug: (message: string, context?: ServerLogContext) => void;
  info: (message: string, context?: ServerLogContext) => void;
  warn: (message: string, context?: ServerLogContext) => void;
  error: (
    message: string,
    error?: unknown,
    context?: ServerLogContext
  ) => void;
  logApiRequest: (input: ApiRequestLogInput) => void;
  logApiError: (input: ApiErrorLogInput) => void;
  logRunEvent: (input: RunEventLogInput) => void;
  child: (context: ServerLogContext) => ServerLogger;
};

const LOG_LEVEL_PRIORITY: Record<ServerLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const DEFAULT_SERVICE_NAME = "dabeehive-orchestrator";

export const serverLogger = createServerLogger();

export function createServerLogger(
  options: ServerLoggerOptions = {},
  baseContext: ServerLogContext = {}
): ServerLogger {
  const normalizedOptions = normalizeOptions(options);

  function writeLog(
    level: ServerLogLevel,
    message: string,
    context?: ServerLogContext,
    error?: unknown
  ): void {
    if (!shouldLog(level, normalizedOptions.minLevel)) {
      return;
    }

    const entry: ServerLogEntry = {
      createdAt: normalizedOptions.clock().toISOString(),
      service: normalizedOptions.service,
      level,
      message
    };
    const mergedContext = mergeContext(baseContext, context);

    if (Object.keys(mergedContext).length > 0) {
      entry.context = mergedContext;
    }

    if (error !== undefined) {
      entry.error = normalizeError(error);
    }

    const redactedEntry = redactSecrets(entry) as ServerLogEntry;
    normalizedOptions.sink(redactedEntry, JSON.stringify(redactedEntry));
  }

  return {
    debug(message, context) {
      writeLog("debug", message, context);
    },
    info(message, context) {
      writeLog("info", message, context);
    },
    warn(message, context) {
      writeLog("warn", message, context);
    },
    error(message, error, context) {
      writeLog("error", message, context, error);
    },
    logApiRequest(input) {
      writeLog("info", "api request", {
        api: {
          method: input.method,
          path: input.path,
          status: input.status,
          durationMs: input.durationMs,
          requestId: input.requestId,
          metadata: input.metadata
        }
      });
    },
    logApiError(input) {
      writeLog(
        "error",
        "api error",
        {
          api: {
            method: input.method,
            path: input.path,
            status: input.status,
            durationMs: input.durationMs,
            requestId: input.requestId,
            code: input.code,
            metadata: input.metadata
          }
        },
        input.error
      );
    },
    logRunEvent(input) {
      writeLog("info", input.message ?? `run event: ${input.type}`, {
        runEvent: {
          runId: input.runId,
          type: input.type,
          metadata: input.metadata
        }
      });
    },
    child(context) {
      return createServerLogger(options, mergeContext(baseContext, context));
    }
  };
}

function normalizeOptions(
  options: ServerLoggerOptions
): Required<ServerLoggerOptions> {
  return {
    service: options.service ?? DEFAULT_SERVICE_NAME,
    minLevel: options.minLevel ?? "info",
    clock: options.clock ?? (() => new Date()),
    sink: options.sink ?? writeConsoleLog
  };
}

function shouldLog(
  level: ServerLogLevel,
  minLevel: ServerLogLevel
): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

function mergeContext(
  first: ServerLogContext,
  second: ServerLogContext = {}
): ServerLogContext {
  return {
    ...first,
    ...second
  };
}

function normalizeError(error: unknown): ServerLogError | unknown {
  if (error instanceof Error) {
    const normalizedError: ServerLogError = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };

    if ("cause" in error) {
      normalizedError.cause = (error as { cause?: unknown }).cause;
    }

    return normalizedError;
  }

  if (typeof error === "string") {
    return {
      message: error
    };
  }

  return error;
}

function writeConsoleLog(
  entry: ServerLogEntry,
  serializedEntry: string
): void {
  if (entry.level === "error") {
    console.error(serializedEntry);
    return;
  }

  if (entry.level === "warn") {
    console.warn(serializedEntry);
    return;
  }

  if (entry.level === "debug") {
    console.debug(serializedEntry);
    return;
  }

  console.info(serializedEntry);
}
