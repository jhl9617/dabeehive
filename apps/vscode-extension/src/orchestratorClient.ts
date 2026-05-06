export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type OrchestratorHealth = {
  status: string;
  service: string;
  checkedAt: string;
};

export type OrchestratorProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

export type OrchestratorIssue = {
  id: string;
  projectId: string;
  title: string;
  status: string;
  priority: string;
};

export type CreateIssueInput = {
  projectId: string;
  parentId?: string | null;
  title: string;
  body?: string | null;
  type?: string;
  status?: string;
  priority?: string;
  assigneeRole?: string | null;
  labels?: string[];
};

export type OrchestratorRun = {
  id: string;
  projectId: string;
  issueId: string | null;
  status: string;
  agentRole: string;
  modelProvider: string | null;
  modelId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrchestratorRunEvent = {
  id: string;
  runId: string;
  type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type OrchestratorRunDetail = OrchestratorRun & {
  inputContext: Record<string, unknown> | null;
  outputSummary: string | null;
  outputArtifacts: Record<string, unknown> | null;
  errorMessage: string | null;
  events: OrchestratorRunEvent[];
};

export type CreateRunInput = {
  projectId: string;
  issueId?: string | null;
  agentRole: string;
  modelProvider?: string | null;
  modelId?: string | null;
  inputContext?: Record<string, unknown> | null;
};

export type OrchestratorApproval = {
  id: string;
  issueId: string | null;
  runId: string | null;
  requestedById: string | null;
  respondedById: string | null;
  type: string;
  status: string;
  reason: string | null;
  changedFiles: string[];
  diffSummary: string | null;
  riskScore: number | null;
  requiredAction: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalResponseAction = "approve" | "reject" | "request_changes";

export type RespondApprovalInput = {
  action: ApprovalResponseAction;
  respondedById?: string | null;
  reason?: string | null;
};

export type OrchestratorClientOptions = {
  serverUrl: string;
  token?: string;
  fetchImpl?: typeof fetch;
};

type OrchestratorRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export class OrchestratorClient {
  private readonly serverUrl: URL;
  private readonly token?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OrchestratorClientOptions) {
    this.serverUrl = new URL(options.serverUrl);
    this.token = options.token?.trim() || undefined;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  getHealth(): Promise<OrchestratorHealth> {
    return this.request<OrchestratorHealth>("/api/health");
  }

  listProjects(): Promise<OrchestratorProject[]> {
    return this.request<OrchestratorProject[]>("/api/projects");
  }

  listIssues(projectId: string): Promise<OrchestratorIssue[]> {
    const searchParams = new URLSearchParams({
      projectId
    });

    return this.request<OrchestratorIssue[]>(`/api/issues?${searchParams}`);
  }

  createIssue(input: CreateIssueInput): Promise<OrchestratorIssue> {
    return this.request<OrchestratorIssue>("/api/issues", {
      method: "POST",
      body: input
    });
  }

  listRuns(): Promise<OrchestratorRun[]> {
    return this.request<OrchestratorRun[]>("/api/runs");
  }

  getRun(runId: string): Promise<OrchestratorRunDetail> {
    return this.request<OrchestratorRunDetail>(
      `/api/runs/${encodeURIComponent(runId)}`
    );
  }

  createRun(input: CreateRunInput): Promise<OrchestratorRun> {
    return this.request<OrchestratorRun>("/api/runs", {
      method: "POST",
      body: input
    });
  }

  listPendingApprovals(): Promise<OrchestratorApproval[]> {
    const searchParams = new URLSearchParams({
      status: "pending"
    });

    return this.request<OrchestratorApproval[]>(
      `/api/approvals?${searchParams}`
    );
  }

  getApproval(approvalId: string): Promise<OrchestratorApproval> {
    return this.request<OrchestratorApproval>(
      `/api/approvals/${encodeURIComponent(approvalId)}`
    );
  }

  respondApproval(
    approvalId: string,
    input: RespondApprovalInput
  ): Promise<OrchestratorApproval> {
    return this.request<OrchestratorApproval>(
      `/api/approvals/${encodeURIComponent(approvalId)}`,
      {
        method: "POST",
        body: input
      }
    );
  }

  private async request<T>(
    path: string,
    options: OrchestratorRequestOptions = {}
  ): Promise<T> {
    const url = new URL(path, this.serverUrl);
    const headers: Record<string, string> = {
      accept: "application/json"
    };

    if (options.body !== undefined) {
      headers["content-type"] = "application/json";
    }

    if (this.token) {
      headers.authorization = `Bearer ${this.token}`;
    }

    const response = await this.fetchImpl(url, {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET"
    });
    const body = (await response.json()) as ApiSuccess<T> | ApiError;

    if (!response.ok) {
      if ("error" in body) {
        throw new Error(body.error.message);
      }

      throw new Error(`Request failed with status ${response.status}.`);
    }

    if (!("data" in body)) {
      throw new Error("Invalid orchestrator response.");
    }

    return body.data;
  }
}
