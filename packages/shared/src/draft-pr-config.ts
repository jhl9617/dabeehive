export type DraftPrProvider = "github";

export type DraftPrConfigMissingField = "repoOwner" | "repoName" | "token";

export type DraftPrConfigInput = {
  repoOwner?: string | null;
  repoName?: string | null;
  token?: string | null;
  baseBranch?: string | null;
  defaultDraft?: boolean | null;
};

export type DraftPrProjectFallback = {
  repoOwner?: string | null;
  repoName?: string | null;
};

export type DraftPrConfigStatus = {
  provider: DraftPrProvider;
  configured: boolean;
  repoOwner: string | null;
  repoName: string | null;
  baseBranch: string;
  defaultDraft: boolean;
  tokenConfigured: boolean;
  missing: DraftPrConfigMissingField[];
};

export const DRAFT_PR_ENV_KEYS = {
  baseBranch: "DABEEHIVE_DRAFT_PR_BASE_BRANCH",
  repoName: "DABEEHIVE_DRAFT_PR_GITHUB_REPO",
  repoOwner: "DABEEHIVE_DRAFT_PR_GITHUB_OWNER",
  token: "DABEEHIVE_DRAFT_PR_GITHUB_TOKEN"
} as const;

const DEFAULT_BASE_BRANCH = "main";

export function buildDraftPrConfigStatus(
  input: DraftPrConfigInput
): DraftPrConfigStatus {
  const repoOwner = normalizeOptionalText(input.repoOwner);
  const repoName = normalizeOptionalText(input.repoName);
  const tokenConfigured = Boolean(normalizeOptionalText(input.token));
  const missing = getMissingDraftPrFields({
    repoName,
    repoOwner,
    tokenConfigured
  });

  return {
    provider: "github",
    configured: missing.length === 0,
    repoOwner,
    repoName,
    baseBranch: normalizeRequiredText(input.baseBranch, DEFAULT_BASE_BRANCH),
    defaultDraft: input.defaultDraft ?? true,
    tokenConfigured,
    missing
  };
}

export function buildDraftPrConfigStatusFromEnv(
  env: Record<string, string | undefined>,
  project?: DraftPrProjectFallback
): DraftPrConfigStatus {
  return buildDraftPrConfigStatus({
    baseBranch: env[DRAFT_PR_ENV_KEYS.baseBranch],
    repoName: env[DRAFT_PR_ENV_KEYS.repoName] ?? project?.repoName,
    repoOwner: env[DRAFT_PR_ENV_KEYS.repoOwner] ?? project?.repoOwner,
    token: env[DRAFT_PR_ENV_KEYS.token]
  });
}

export function summarizeDraftPrConfigStatus(
  status: DraftPrConfigStatus
): string {
  if (status.configured) {
    return `Draft PR config ready for ${status.repoOwner}/${status.repoName} targeting ${status.baseBranch}.`;
  }

  return `Draft PR config missing: ${status.missing.join(", ")}.`;
}

function getMissingDraftPrFields(input: {
  repoOwner: string | null;
  repoName: string | null;
  tokenConfigured: boolean;
}): DraftPrConfigMissingField[] {
  const missing: DraftPrConfigMissingField[] = [];

  if (!input.repoOwner) {
    missing.push("repoOwner");
  }

  if (!input.repoName) {
    missing.push("repoName");
  }

  if (!input.tokenConfigured) {
    missing.push("token");
  }

  return missing;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
}

function normalizeRequiredText(
  value: string | null | undefined,
  fallback: string
): string {
  return normalizeOptionalText(value) ?? fallback;
}
