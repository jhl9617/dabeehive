import type { DraftPrConfigStatus } from "./draft-pr-config";

export type DraftPrApprovalGate = {
  id?: string | null;
  status: string;
  type: string;
};

export type DraftPrCommandInput = {
  approval: DraftPrApprovalGate;
  body: string;
  config: DraftPrConfigStatus;
  headBranch?: string | null;
  title: string;
};

export type DraftPrCommandBlockReason =
  | "approval_not_final"
  | "approval_not_approved"
  | "config_incomplete"
  | "missing_body"
  | "missing_head_branch"
  | "missing_title";

export type DraftPrCommandBlocked = {
  allowed: false;
  reason: DraftPrCommandBlockReason;
  message: string;
  missingConfig: readonly string[];
};

export type DraftPrCommandReady = {
  allowed: true;
  approvalId: string | null;
  baseBranch: string;
  body: string;
  command: readonly string[];
  headBranch: string;
  repo: string;
  title: string;
};

export type DraftPrCommandPlan =
  | DraftPrCommandBlocked
  | DraftPrCommandReady;

export type DraftPrCommandResult = {
  stdout: string;
  stderr?: string;
  exitCode: number;
};

export type DraftPrCommandRunner = (
  command: readonly string[],
  options: {
    cwd?: string;
  }
) => Promise<DraftPrCommandResult>;

export type RunDraftPrCommandInput = DraftPrCommandInput & {
  cwd?: string;
  runCommand: DraftPrCommandRunner;
};

export type DraftPrCommandRunResult =
  | (DraftPrCommandBlocked & {
      executed: false;
    })
  | (DraftPrCommandReady & {
      executed: true;
      exitCode: number;
      prUrl: string | null;
      stderr: string;
      stdout: string;
    });

export function buildDraftPrCommandPlan(
  input: DraftPrCommandInput
): DraftPrCommandPlan {
  if (input.approval.type !== "final_approval") {
    return blockDraftPrCommand(
      "approval_not_final",
      "Draft PR creation requires a final approval record."
    );
  }

  if (input.approval.status !== "approved") {
    return blockDraftPrCommand(
      "approval_not_approved",
      "Draft PR creation requires the final approval to be approved."
    );
  }

  if (!input.config.configured) {
    return blockDraftPrCommand(
      "config_incomplete",
      "Draft PR config is incomplete.",
      input.config.missing
    );
  }

  const repoOwner = normalizeOptionalText(input.config.repoOwner);
  const repoName = normalizeOptionalText(input.config.repoName);
  const missingConfig = [
    ...(!repoOwner ? ["repoOwner"] : []),
    ...(!repoName ? ["repoName"] : []),
    ...(!input.config.tokenConfigured ? ["token"] : [])
  ];

  if (missingConfig.length > 0) {
    return blockDraftPrCommand(
      "config_incomplete",
      "Draft PR config is incomplete.",
      missingConfig
    );
  }

  const title = normalizeOptionalText(input.title);

  if (!title) {
    return blockDraftPrCommand("missing_title", "Draft PR title is required.");
  }

  const body = normalizeOptionalText(input.body);

  if (!body) {
    return blockDraftPrCommand("missing_body", "Draft PR body is required.");
  }

  const headBranch = normalizeOptionalText(input.headBranch);

  if (!headBranch) {
    return blockDraftPrCommand(
      "missing_head_branch",
      "Draft PR head branch is required."
    );
  }

  const repo = `${repoOwner}/${repoName}`;

  return {
    allowed: true,
    approvalId: input.approval.id ?? null,
    baseBranch: input.config.baseBranch,
    body,
    command: [
      "gh",
      "pr",
      "create",
      "--draft",
      "--repo",
      repo,
      "--base",
      input.config.baseBranch,
      "--head",
      headBranch,
      "--title",
      title,
      "--body",
      body
    ],
    headBranch,
    repo,
    title
  };
}

export async function runDraftPrCommand(
  input: RunDraftPrCommandInput
): Promise<DraftPrCommandRunResult> {
  const plan = buildDraftPrCommandPlan(input);

  if (!plan.allowed) {
    return {
      ...plan,
      executed: false
    };
  }

  const result = await input.runCommand(plan.command, {
    cwd: input.cwd
  });

  return {
    ...plan,
    executed: true,
    exitCode: result.exitCode,
    prUrl: extractDraftPrUrl(result.stdout),
    stderr: result.stderr ?? "",
    stdout: result.stdout
  };
}

function blockDraftPrCommand(
  reason: DraftPrCommandBlockReason,
  message: string,
  missingConfig: readonly string[] = []
): DraftPrCommandBlocked {
  return {
    allowed: false,
    reason,
    message,
    missingConfig
  };
}

function extractDraftPrUrl(stdout: string): string | null {
  const match = stdout.match(/https:\/\/github\.com\/\S+/);

  return match?.[0] ?? null;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
}
