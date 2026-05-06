import { normalizeAllowedCodingAgentTools } from "./allowed-tools";
import type { CodingAgentToolName } from "./allowed-tools";

export type CommandPolicyDecision = "allowed" | "requires_approval" | "blocked";

export type CommandPolicyReasonCode =
  | "auto_merge"
  | "bash_tool_not_allowed"
  | "database_migration"
  | "dependency_change"
  | "deploy_or_infra"
  | "destructive_file_operation"
  | "empty_command"
  | "git_history_rewrite"
  | "secret_access"
  | "shell_control_operator";

export type CommandPolicyReason = {
  readonly code: CommandPolicyReasonCode;
  readonly message: string;
};

export type CommandPolicyAssessment = {
  readonly command: string;
  readonly decision: CommandPolicyDecision;
  readonly reasons: readonly CommandPolicyReason[];
};

export type CommandPolicyInput = {
  readonly command: string | readonly string[];
  readonly allowedTools?: readonly CodingAgentToolName[];
};

type CommandPolicyRule = {
  readonly code: CommandPolicyReasonCode;
  readonly decision: Exclude<CommandPolicyDecision, "allowed">;
  readonly message: string;
  readonly pattern: RegExp;
};

export const DEFAULT_COMMAND_POLICY_RULES: readonly CommandPolicyRule[] = [
  {
    code: "destructive_file_operation",
    decision: "blocked",
    message: "Destructive file operations are not allowed without human handling.",
    pattern: /\brm\s+.*-[a-z]*[rf][a-z]*/
  },
  {
    code: "git_history_rewrite",
    decision: "blocked",
    message: "Git history rewrite or forced workspace cleanup commands are blocked.",
    pattern:
      /\bgit\s+(?:reset\s+--hard|clean\s+-[a-z]*[fdx][a-z]*|push\s+.*--force|checkout\s+--)/
  },
  {
    code: "auto_merge",
    decision: "blocked",
    message: "Automatic merge commands are outside the PoC runner scope.",
    pattern: /\b(?:gh\s+pr\s+merge|git\s+merge(?:\s|$))/
  },
  {
    code: "deploy_or_infra",
    decision: "blocked",
    message: "Deploy and infrastructure mutation commands are outside PoC scope.",
    pattern:
      /\b(?:(?:vercel|netlify|flyctl|railway|firebase)\s+deploy|(?:kubectl|helm|terraform|pulumi)\s+(?:apply|destroy|delete|up))\b/
  },
  {
    code: "secret_access",
    decision: "blocked",
    message: "Commands that read secrets, tokens, or private keys are blocked.",
    pattern:
      /\b(?:cat|less|more|sed|awk|grep|rg|printenv|env)\b.*(?:\.env|secret|token|private[_-]?key|id_rsa|id_ed25519|credentials)/
  },
  {
    code: "dependency_change",
    decision: "requires_approval",
    message: "Package install/add commands require approval before execution.",
    pattern: /\b(?:pnpm|npm|yarn|bun)\s+(?:add|install|i)\b/
  },
  {
    code: "database_migration",
    decision: "requires_approval",
    message: "Database migration or direct SQL mutation commands require approval.",
    pattern:
      /\b(?:prisma\s+migrate\s+(?:deploy|reset|dev)|migrate\s+(?:up|deploy|reset)|psql\s+.*(?:-f|drop|alter|delete|truncate))\b/
  },
  {
    code: "shell_control_operator",
    decision: "requires_approval",
    message: "Compound shell commands require approval before execution.",
    pattern: /(?:&&|\|\||[;|<>]|`|\$\()/
  }
];

export function assessCommandPolicy(
  input: CommandPolicyInput
): CommandPolicyAssessment {
  const command = normalizeCommandText(input.command);

  if (!command) {
    return {
      command,
      decision: "blocked",
      reasons: [
        {
          code: "empty_command",
          message: "Empty commands are blocked."
        }
      ]
    };
  }

  const allowedTools = normalizeAllowedCodingAgentTools(input.allowedTools);

  if (!allowedTools.includes("bash")) {
    return {
      command,
      decision: "blocked",
      reasons: [
        {
          code: "bash_tool_not_allowed",
          message: "The bash tool is not allowed for this run."
        }
      ]
    };
  }

  const comparableCommand = command.toLowerCase();
  const reasons = DEFAULT_COMMAND_POLICY_RULES.filter((rule) =>
    rule.pattern.test(comparableCommand)
  ).map(({ code, message }) => ({ code, message }));

  if (reasons.length === 0) {
    return {
      command,
      decision: "allowed",
      reasons
    };
  }

  const blockedReasonCodes = new Set(
    DEFAULT_COMMAND_POLICY_RULES.filter((rule) => rule.decision === "blocked").map(
      (rule) => rule.code
    )
  );
  const hasBlockedReason = reasons.some((reason) =>
    blockedReasonCodes.has(reason.code)
  );

  return {
    command,
    decision: hasBlockedReason ? "blocked" : "requires_approval",
    reasons
  };
}

export function isCommandBlocked(input: CommandPolicyInput): boolean {
  return assessCommandPolicy(input).decision === "blocked";
}

function normalizeCommandText(command: string | readonly string[]): string {
  if (typeof command === "string") {
    return command.trim();
  }

  return command.join(" ").trim();
}
