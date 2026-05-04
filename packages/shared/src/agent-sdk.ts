import type {
  AgentRole,
  EntityId,
  IsoDateTime,
  Issue,
  Project,
  RunEventType
} from "./domain";

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

export type CodingRunProject = Pick<
  Project,
  "id" | "name" | "repoUrl" | "repoOwner" | "repoName"
>;

export type CodingRunInput = {
  runId: EntityId;
  project: CodingRunProject;
  issue: Issue;
  workspace: CodingRunWorkspace;
  systemInstruction: string;
  agentRole?: AgentRole;
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
};

export type LocalCodingAgentCancelRequest = {
  runId: EntityId;
  reason?: string;
};

export interface LocalCodingAgentAdapter {
  readonly name: string;
  start(request: CodingRunInput): Promise<LocalCodingAgentRunHandle>;
  cancel(request: LocalCodingAgentCancelRequest): Promise<void>;
}
