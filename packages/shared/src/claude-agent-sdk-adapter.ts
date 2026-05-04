import type {
  CodingRunInput,
  LocalCodingAgentAdapter,
  LocalCodingAgentCancelRequest,
  LocalCodingAgentRunHandle
} from "./agent-sdk";

export type ClaudeAgentSdkAdapterOptions = {
  name?: string;
};

export class ClaudeAgentSdkAdapter implements LocalCodingAgentAdapter {
  readonly name: string;

  constructor(options: ClaudeAgentSdkAdapterOptions = {}) {
    this.name = options.name ?? "claude-agent-sdk";
  }

  async start(input: CodingRunInput): Promise<LocalCodingAgentRunHandle> {
    return {
      runId: input.runId,
      adapterRunId: input.runId
    };
  }

  async cancel(_request: LocalCodingAgentCancelRequest): Promise<void> {
    return undefined;
  }
}
