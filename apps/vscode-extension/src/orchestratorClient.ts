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
