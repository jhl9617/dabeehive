export type EntityId = string;
export type IsoDateTime = string;

export type ProjectStatus =
  | "draft"
  | "active"
  | "at_risk"
  | "released"
  | "archived";

export type IssueType = "epic" | "story" | "task" | "bug";
export type IssueStatus =
  | "backlog"
  | "ready"
  | "in_progress"
  | "in_review"
  | "qa"
  | "done";
export type IssuePriority = "critical" | "high" | "medium" | "low";

export type AgentRole =
  | "planner"
  | "architect"
  | "backend"
  | "frontend"
  | "qa"
  | "release";

export type RunStatus =
  | "queued"
  | "planning"
  | "waiting_approval"
  | "coding"
  | "reviewing"
  | "succeeded"
  | "failed"
  | "cancelled";

export type RunEventType =
  | "message"
  | "tool_call"
  | "tool_result"
  | "file_change"
  | "command"
  | "test_result"
  | "error"
  | "done";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export type ApprovalType =
  | "schema_change"
  | "auth_change"
  | "billing_change"
  | "prod_deploy"
  | "spec_approval"
  | "final_approval"
  | "risk_approval"
  | "general";

export type ArtifactType =
  | "plan"
  | "diff"
  | "test_report"
  | "review"
  | "pr_url"
  | "log";

export type Project = {
  id: EntityId;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  repoUrl?: string | null;
  repoOwner?: string | null;
  repoName?: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type Issue = {
  id: EntityId;
  projectId: EntityId;
  parentId?: EntityId | null;
  title: string;
  body?: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeRole?: AgentRole | null;
  labels: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type ContextDocument = {
  id: EntityId;
  projectId: EntityId;
  type: "prd" | "adr" | "spec" | "runbook" | "retro";
  title: string;
  content: string;
  version: number;
  status: "draft" | "in_review" | "approved" | "archived";
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type AgentRun = {
  id: EntityId;
  projectId: EntityId;
  issueId?: EntityId | null;
  status: RunStatus;
  outputSummary?: string | null;
  errorMessage?: string | null;
  startedAt?: IsoDateTime | null;
  completedAt?: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type RunEvent = {
  id: EntityId;
  runId: EntityId;
  type: RunEventType;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: IsoDateTime;
};

export type Approval = {
  id: EntityId;
  issueId?: EntityId | null;
  runId?: EntityId | null;
  type: ApprovalType;
  status: ApprovalStatus;
  reason?: string | null;
  diffSummary?: string | null;
  riskScore?: number | null;
  respondedAt?: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type Artifact = {
  id: EntityId;
  runId?: EntityId | null;
  issueId?: EntityId | null;
  type: ArtifactType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: IsoDateTime;
};
