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

export type CommandPolicyRule = {
  readonly code: CommandPolicyReasonCode;
  readonly decision: Exclude<CommandPolicyDecision, "allowed">;
  readonly examples: readonly string[];
  readonly message: string;
  readonly pattern: RegExp;
};

export const DEFAULT_DANGEROUS_COMMAND_DENYLIST: readonly CommandPolicyRule[] = [
  {
    code: "destructive_file_operation",
    decision: "blocked",
    examples: ["rm -rf dist", "rm .env.local", "git rm src/file.ts"],
    message: "Destructive file delete commands are blocked.",
    pattern: /\b(?:git\s+rm|rm|rmdir|del|remove-item)\b/
  },
  {
    code: "git_history_rewrite",
    decision: "blocked",
    examples: ["git reset --hard HEAD", "git clean -fdx", "git push --force"],
    message: "Git history rewrite or forced workspace cleanup commands are blocked.",
    pattern:
      /\bgit\s+(?:reset\s+--hard|clean\s+-[a-z]*[fdx][a-z]*|push\s+.*--force|checkout\s+--)/
  },
  {
    code: "auto_merge",
    decision: "blocked",
    examples: ["git merge main", "gh pr merge 123 --merge"],
    message: "Automatic merge commands are outside the PoC runner scope.",
    pattern: /\b(?:gh\s+pr\s+merge|git\s+merge(?:\s|$))/
  },
  {
    code: "deploy_or_infra",
    decision: "blocked",
    examples: ["vercel deploy --prod", "kubectl delete deployment app"],
    message: "Deploy and infrastructure mutation commands are outside PoC scope.",
    pattern:
      /\b(?:(?:vercel|netlify|flyctl|railway|firebase)\s+deploy|(?:kubectl|helm|terraform|pulumi)\s+(?:apply|destroy|delete|up))\b/
  },
  {
    code: "secret_access",
    decision: "blocked",
    examples: ["cat .env.local", "printenv API_TOKEN"],
    message: "Commands that read secrets, tokens, or private keys are blocked.",
    pattern:
      /\b(?:cat|less|more|sed|awk|grep|rg|printenv|env)\b.*(?:\.env|secret|token|private[_-]?key|id_rsa|id_ed25519|credentials)/
  },
  {
    code: "shell_control_operator",
    decision: "blocked",
    examples: ["pnpm lint | tee lint.log", "pnpm lint && pnpm test"],
    message: "Compound shell commands, pipes, redirects, and substitutions are blocked.",
    pattern: /(?:&&|\|\||[;|<>]|`|\$\()/
  }
];

export const APPROVAL_REQUIRED_COMMAND_RULES: readonly CommandPolicyRule[] = [
  {
    code: "dependency_change",
    decision: "requires_approval",
    examples: ["pnpm add zod", "npm install lodash"],
    message: "Package install/add commands require approval before execution.",
    pattern: /\b(?:pnpm|npm|yarn|bun)\s+(?:add|install|i)\b/
  },
  {
    code: "database_migration",
    decision: "requires_approval",
    examples: ["prisma migrate deploy", "psql -f migration.sql"],
    message: "Database migration or direct SQL mutation commands require approval.",
    pattern:
      /\b(?:prisma\s+migrate\s+(?:deploy|reset|dev)|migrate\s+(?:up|deploy|reset)|psql\s+.*(?:-f|drop|alter|delete|truncate))\b/
  }
];

export const DEFAULT_COMMAND_POLICY_RULES: readonly CommandPolicyRule[] = [
  ...DEFAULT_DANGEROUS_COMMAND_DENYLIST,
  ...APPROVAL_REQUIRED_COMMAND_RULES
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
