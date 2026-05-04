import type { EntityId } from "./domain";

export type LocalCodingAgentStartRequest = {
  runId: EntityId;
  projectId: EntityId;
  issueId?: EntityId | null;
  workspacePath: string;
  instructions: string;
  metadata?: Record<string, unknown>;
};

export type LocalCodingAgentRunHandle = {
  runId: EntityId;
  adapterRunId?: string;
};

export type LocalCodingAgentCancelRequest = {
  runId: EntityId;
  reason?: string;
};

export interface LocalCodingAgentAdapter {
  readonly name: string;
  start(
    request: LocalCodingAgentStartRequest
  ): Promise<LocalCodingAgentRunHandle>;
  cancel(request: LocalCodingAgentCancelRequest): Promise<void>;
}
