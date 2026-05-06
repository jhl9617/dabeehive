export const CODING_AGENT_TOOL_NAMES = ["read", "search", "edit", "bash"] as const;

export type CodingAgentToolName = (typeof CODING_AGENT_TOOL_NAMES)[number];

export type CodingAgentToolAccess = "read_only" | "write" | "command";

export type CodingAgentAllowedToolSetting = {
  readonly name: CodingAgentToolName;
  readonly access: CodingAgentToolAccess;
  readonly description: string;
  readonly constraints: readonly string[];
};

export const DEFAULT_CODING_AGENT_ALLOWED_TOOL_SETTINGS: readonly CodingAgentAllowedToolSetting[] =
  [
    {
      name: "read",
      access: "read_only",
      description: "Read workspace files and provided context.",
      constraints: ["Do not expose secrets or production credentials."]
    },
    {
      name: "search",
      access: "read_only",
      description: "Search workspace files and text context.",
      constraints: ["Use repository-local search before broad assumptions."]
    },
    {
      name: "edit",
      access: "write",
      description: "Edit files required by the approved plan.",
      constraints: ["Keep changes scoped and do not implement a custom patch engine."]
    },
    {
      name: "bash",
      access: "command",
      description: "Run local validation and inspection commands.",
      constraints: [
        "Do not run deploy, production secret, destructive, or auto-merge commands.",
        "Dangerous command blocking is handled by the runner policy layer."
      ]
    }
  ];

export const DEFAULT_CODING_AGENT_ALLOWED_TOOLS: readonly CodingAgentToolName[] =
  DEFAULT_CODING_AGENT_ALLOWED_TOOL_SETTINGS.map((setting) => setting.name);

export function isCodingAgentToolName(value: string): value is CodingAgentToolName {
  return (CODING_AGENT_TOOL_NAMES as readonly string[]).includes(value);
}

export function normalizeAllowedCodingAgentTools(
  tools: readonly string[] | null | undefined
): CodingAgentToolName[] {
  if (!tools || tools.length === 0) {
    return [...DEFAULT_CODING_AGENT_ALLOWED_TOOLS];
  }

  const normalizedTools: CodingAgentToolName[] = [];

  for (const tool of tools) {
    if (!isCodingAgentToolName(tool) || normalizedTools.includes(tool)) {
      continue;
    }

    normalizedTools.push(tool);
  }

  return normalizedTools.length > 0
    ? normalizedTools
    : [...DEFAULT_CODING_AGENT_ALLOWED_TOOLS];
}
