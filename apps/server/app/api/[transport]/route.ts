import { createMcpHandler } from "mcp-handler";

export const dynamic = "force-dynamic";

const handler = createMcpHandler(
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

export { handler as DELETE, handler as GET, handler as POST };
