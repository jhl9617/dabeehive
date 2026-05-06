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
import { buildCodingAgentDryRunReport } from "./dry-run";

export type ClaudeAgentSdkAdapterOptions = {
  allowedTools?: readonly CodingAgentToolName[];
  dryRun?: boolean;
  name?: string;
};

export class ClaudeAgentSdkAdapter implements LocalCodingAgentAdapter {
  readonly name: string;
  readonly allowedTools: readonly CodingAgentToolName[];
  readonly dryRun: boolean;

  constructor(options: ClaudeAgentSdkAdapterOptions = {}) {
    this.name = options.name ?? "claude-agent-sdk";
    this.allowedTools = normalizeAllowedCodingAgentTools(
      options.allowedTools ?? DEFAULT_CODING_AGENT_ALLOWED_TOOLS
    );
    this.dryRun = options.dryRun ?? false;
  }

  async start(input: CodingRunInput): Promise<LocalCodingAgentRunHandle> {
    const allowedTools = normalizeAllowedCodingAgentTools(
      input.allowedTools ?? this.allowedTools
    );
    const dryRun = input.dryRun ?? this.dryRun;

    if (dryRun) {
      return {
        runId: input.runId,
        adapterRunId: `dry-run:${input.runId}`,
        allowedTools,
        mode: "dry_run",
        dryRunReport: buildCodingAgentDryRunReport(input, { allowedTools })
      };
    }

    return {
      runId: input.runId,
      adapterRunId: input.runId,
      allowedTools,
      mode: "normal"
    };
  }

  async cancel(_request: LocalCodingAgentCancelRequest): Promise<void> {
    return undefined;
  }
}
