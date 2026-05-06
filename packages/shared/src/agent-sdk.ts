import type {
  AgentRole,
  EntityId,
  IsoDateTime,
  Issue,
  Project,
  RunEventType
} from "./domain";
import type { CodingAgentToolName } from "./allowed-tools";

export type CodingRunWorkspace = {
  path: string;
  repoUrl?: string | null;
  branchName?: string | null;
  baseBranchName?: string | null;
};

export type CodingRunModel = {
  provider?: string | null;
  modelId?: string | null;
};

export type CodingRunMode = "normal" | "dry_run";

export type CodingRunProject = Pick<
  Project,
  "id" | "name" | "repoUrl" | "repoOwner" | "repoName"
>;

export type CodingAgentDryRunWarningCode =
  | "empty_issue_title"
  | "empty_project_name"
  | "empty_system_instruction"
  | "empty_workspace_path";

export type CodingAgentDryRunWarning = {
  readonly code: CodingAgentDryRunWarningCode;
  readonly message: string;
};

export type CodingAgentDryRunReport = {
  readonly mode: "dry_run";
  readonly runId: EntityId;
  readonly projectId: EntityId;
  readonly issueId: EntityId;
  readonly workspacePath: string;
  readonly systemInstructionPreview: string;
  readonly allowedTools: readonly CodingAgentToolName[];
  readonly ready: boolean;
  readonly warnings: readonly CodingAgentDryRunWarning[];
  readonly createdAt: IsoDateTime;
};

export type CodingRunInput = {
  runId: EntityId;
  project: CodingRunProject;
  issue: Issue;
  workspace: CodingRunWorkspace;
  systemInstruction: string;
  agentRole?: AgentRole;
  allowedTools?: readonly CodingAgentToolName[];
  dryRun?: boolean;
  model?: CodingRunModel;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type LocalCodingAgentStartRequest = CodingRunInput;

export type CodingAgentEvent = {
  runId: EntityId;
  type: RunEventType;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: IsoDateTime;
};

export type LocalCodingAgentRunHandle = {
  runId: EntityId;
  adapterRunId?: string;
  allowedTools?: readonly CodingAgentToolName[];
  mode?: CodingRunMode;
  dryRunReport?: CodingAgentDryRunReport;
};

export type LocalCodingAgentCancelRequest = {
  runId: EntityId;
  reason?: string;
};

export interface LocalCodingAgentAdapter {
  readonly name: string;
  readonly allowedTools: readonly CodingAgentToolName[];
  start(request: CodingRunInput): Promise<LocalCodingAgentRunHandle>;
  cancel(request: LocalCodingAgentCancelRequest): Promise<void>;
}
