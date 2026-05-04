import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";

export const dynamic = "force-dynamic";

const mcpHandler = createMcpHandler(
  () => {
    // Domain tools are registered in MCP-003 and later tasks.
  },
  {
    serverInfo: {
      name: "dabeehive-orchestrator",
      version: "0.0.0"
    }
  },
  {
    basePath: "/api",
    disableSse: true,
    maxDuration: 60,
    verboseLogs: false
  }
);

const handler = withMcpAuth(mcpHandler, verifyBearerToken, {
  required: true
});

export { handler as DELETE, handler as GET, handler as POST };

function verifyBearerToken(
  _request: Request,
  bearerToken?: string
): AuthInfo | undefined {
  const token = bearerToken?.trim();

  if (!token) {
    return undefined;
  }

  return {
    token,
    clientId: "poc-mcp-client",
    scopes: []
  };
}
