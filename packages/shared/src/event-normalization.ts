import type { CodingAgentEvent } from "./agent-sdk";
import type { EntityId, IsoDateTime, RunEventType } from "./domain";

export type RawCodingAgentEvent = {
  type?: string | null;
  event?: string | null;
  name?: string | null;
  message?: unknown;
  text?: unknown;
  content?: unknown;
  metadata?: unknown;
  data?: unknown;
  createdAt?: string | Date | null;
  timestamp?: string | Date | null;
};

export type NormalizeCodingAgentEventInput = {
  runId: EntityId;
  event: RawCodingAgentEvent;
  defaultType?: RunEventType;
  now?: () => Date;
};

const RUN_EVENT_TYPE_ALIASES: Record<string, RunEventType> = {
  message: "message",
  assistant_message: "message",
  text: "message",
  tool_call: "tool_call",
  tool_use: "tool_call",
  tool_start: "tool_call",
  tool_result: "tool_result",
  tool_response: "tool_result",
  file_change: "file_change",
  file_changed: "file_change",
  command: "command",
  shell_command: "command",
  test_result: "test_result",
  test: "test_result",
  error: "error",
  exception: "error",
  done: "done",
  complete: "done",
  completed: "done"
};

export function normalizeCodingAgentEvent(
  input: NormalizeCodingAgentEventInput
): CodingAgentEvent {
  const rawEvent = input.event;
  const normalizedEvent: CodingAgentEvent = {
    runId: input.runId,
    type: normalizeCodingAgentEventType(
      rawEvent.type ?? rawEvent.event ?? rawEvent.name,
      input.defaultType ?? "message"
    ),
    createdAt: normalizeCreatedAt(
      rawEvent.createdAt ?? rawEvent.timestamp,
      input.now
    )
  };
  const message = normalizeMessage(
    rawEvent.message ?? rawEvent.text ?? rawEvent.content
  );
  const metadata = normalizeMetadata(rawEvent.metadata, rawEvent.data);

  if (message) {
    normalizedEvent.message = message;
  }

  if (metadata) {
    normalizedEvent.metadata = metadata;
  }

  return normalizedEvent;
}

export function normalizeCodingAgentEventType(
  value: string | null | undefined,
  fallback: RunEventType = "message"
): RunEventType {
  const normalizedValue = value?.trim().toLowerCase().replace(/[-\s.]+/g, "_");

  if (!normalizedValue) {
    return fallback;
  }

  return RUN_EVENT_TYPE_ALIASES[normalizedValue] ?? fallback;
}

function normalizeCreatedAt(
  value: string | Date | null | undefined,
  now: (() => Date) | undefined
): IsoDateTime {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  return (now?.() ?? new Date()).toISOString();
}

function normalizeMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue || undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function normalizeMetadata(
  metadata: unknown,
  data: unknown
): Record<string, unknown> | undefined {
  const normalizedMetadata: Record<string, unknown> = {};

  if (isRecord(metadata)) {
    Object.assign(normalizedMetadata, metadata);
  } else if (metadata !== null && metadata !== undefined) {
    normalizedMetadata.metadata = metadata;
  }

  if (isRecord(data)) {
    normalizedMetadata.data = data;
  } else if (data !== null && data !== undefined) {
    normalizedMetadata.data = data;
  }

  return Object.keys(normalizedMetadata).length === 0
    ? undefined
    : normalizedMetadata;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
