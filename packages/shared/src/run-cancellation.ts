import type {
  LocalCodingAgentAdapter,
  LocalCodingAgentCancelRequest
} from "./agent-sdk";
import type { IsoDateTime } from "./domain";

export type RunCancellationCommand = LocalCodingAgentCancelRequest & {
  reason: string;
  requestedAt: IsoDateTime;
};

export type DispatchRunCancellationInput = {
  adapter: Pick<LocalCodingAgentAdapter, "cancel">;
  request: LocalCodingAgentCancelRequest;
  now?: () => Date;
};

export async function dispatchRunCancellation(
  input: DispatchRunCancellationInput
): Promise<RunCancellationCommand> {
  const command = buildRunCancellationCommand(input.request, input.now);

  await input.adapter.cancel(command);

  return command;
}

export function buildRunCancellationCommand(
  request: LocalCodingAgentCancelRequest,
  now?: () => Date
): RunCancellationCommand {
  return {
    runId: request.runId,
    reason: normalizeCancellationReason(request.reason),
    requestedAt: (now?.() ?? new Date()).toISOString()
  };
}

function normalizeCancellationReason(reason: string | undefined): string {
  const normalizedReason = reason?.trim();

  return normalizedReason || "No cancellation reason provided.";
}
