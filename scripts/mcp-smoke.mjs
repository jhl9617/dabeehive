const baseUrl = (process.env.DABEEHIVE_MCP_BASE_URL ?? "http://127.0.0.1:18082/api/mcp")
  .replace(/\/+$/, "");
const token = process.env.DABEEHIVE_MCP_TOKEN ?? "demo-local-mcp-token";

const expectedTools = [
  "project.list",
  "project.get",
  "issue.list",
  "issue.get",
  "issue.create",
  "run.start",
  "run.status",
  "run.append_event",
  "approval.list",
  "approval.request",
  "approval.respond",
  "artifact.create",
  "artifact.get",
  "context.search"
];

const expectedResourceTemplates = [
  "issue://{id}",
  "document://{id}",
  "run://{id}"
];

const expectedPrompts = [
  "implementation-plan",
  "review-diff"
];

let requestId = 1;

async function main() {
  const initialize = await mcpRequest("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: {
      name: "dabeehive-mcp-smoke",
      version: "0.0.0"
    }
  });

  const toolsList = await mcpRequest("tools/list", {});
  assertIncludes(
    new Set((toolsList.tools ?? []).map((tool) => tool.name)),
    expectedTools,
    "MCP tools"
  );

  const resourceTemplatesList = await mcpRequest("resources/templates/list", {});
  assertIncludes(
    new Set(
      (resourceTemplatesList.resourceTemplates ?? []).map(
        (template) => template.uriTemplate ?? template.uri
      )
    ),
    expectedResourceTemplates,
    "MCP resource templates"
  );

  const promptsList = await mcpRequest("prompts/list", {});
  assertIncludes(
    new Set((promptsList.prompts ?? []).map((prompt) => prompt.name)),
    expectedPrompts,
    "MCP prompts"
  );

  const projectList = await mcpRequest("tools/call", {
    name: "project.list",
    arguments: {}
  });

  console.log(
    JSON.stringify(
      {
        server: initialize.serverInfo?.name ?? "unknown",
        tools: expectedTools.length,
        resourceTemplates: expectedResourceTemplates.length,
        prompts: expectedPrompts.length,
        projectListContentItems: projectList.content?.length ?? 0
      },
      null,
      2
    )
  );
}

async function mcpRequest(method, params) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId++,
      method,
      params
    })
  });
  const text = await response.text();
  const payload = parseMcpPayload(text);

  if (!response.ok) {
    const error = new Error(`${method} failed with HTTP ${response.status}`);
    error.details = payload ?? text;
    throw error;
  }

  if (!payload) {
    throw new Error(`${method} returned an unparseable MCP response`);
  }

  if (payload.error) {
    const error = new Error(`${method} returned MCP error ${payload.error.code}`);
    error.details = payload.error;
    throw error;
  }

  return payload.result ?? {};
}

function assertIncludes(actualValues, expectedValues, label) {
  const missingValues = expectedValues.filter((value) => !actualValues.has(value));

  if (missingValues.length > 0) {
    throw new Error(`Missing ${label}: ${missingValues.join(", ")}`);
  }
}

function parseMcpPayload(text) {
  try {
    return JSON.parse(text);
  } catch {
    const dataLines = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trim())
      .filter((line) => line && line !== "[DONE]");
    const lastDataLine = dataLines.at(-1);

    if (!lastDataLine) {
      return null;
    }

    return JSON.parse(lastDataLine);
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) {
    console.error(
      typeof error.details === "string"
        ? error.details
        : JSON.stringify(error.details, null, 2)
    );
  }
  process.exit(1);
});
