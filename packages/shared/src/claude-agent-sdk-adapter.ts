import {
  DEFAULT_CODING_AGENT_ALLOWED_TOOLS,
  normalizeAllowedCodingAgentTools,
  type CodingAgentToolName
} from "./allowed-tools";
import type {
  CodingRunInput,
  LocalCodingAgentAdapter,
  LocalCodingAgentCancelRequest,
  LocalCodingAgentRunHandle
} from "./agent-sdk";

export type ClaudeAgentSdkAdapterOptions = {
  allowedTools?: readonly CodingAgentToolName[];
  name?: string;
};

export class ClaudeAgentSdkAdapter implements LocalCodingAgentAdapter {
  readonly name: string;
  readonly allowedTools: readonly CodingAgentToolName[];

  constructor(options: ClaudeAgentSdkAdapterOptions = {}) {
    this.name = options.name ?? "claude-agent-sdk";
    this.allowedTools = normalizeAllowedCodingAgentTools(
      options.allowedTools ?? DEFAULT_CODING_AGENT_ALLOWED_TOOLS
    );
  }

  async start(input: CodingRunInput): Promise<LocalCodingAgentRunHandle> {
    const allowedTools = normalizeAllowedCodingAgentTools(
      input.allowedTools ?? this.allowedTools
    );

    return {
      runId: input.runId,
      adapterRunId: input.runId,
      allowedTools
    };
  }

  async cancel(_request: LocalCodingAgentCancelRequest): Promise<void> {
    return undefined;
  }
}
