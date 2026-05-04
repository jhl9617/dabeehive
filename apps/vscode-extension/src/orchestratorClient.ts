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

export type OrchestratorClientOptions = {
  serverUrl: string;
  token?: string;
  fetchImpl?: typeof fetch;
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

  listRuns(): Promise<OrchestratorRun[]> {
    return this.request<OrchestratorRun[]>("/api/runs");
  }

  private async request<T>(path: string): Promise<T> {
    const url = new URL(path, this.serverUrl);
    const headers: Record<string, string> = {
      accept: "application/json"
    };

    if (this.token) {
      headers.authorization = `Bearer ${this.token}`;
    }

    const response = await this.fetchImpl(url, {
      headers
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
