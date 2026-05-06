export type ChangeRiskLevel = "low" | "medium" | "high" | "critical";

export type ChangeRiskReasonCode =
  | "auth_or_security"
  | "db_schema_or_migration"
  | "dependency_manifest"
  | "deploy_or_infra"
  | "env_or_secret"
  | "file_count"
  | "file_deletion"
  | "no_changed_files"
  | "source_code";

export type RiskChangedFile =
  | string
  | {
      path: string;
      status?: string | null;
    };

export type ChangeRiskAssessmentInput = {
  changedFiles: RiskChangedFile[];
};

export type ChangeRiskReason = {
  code: ChangeRiskReasonCode;
  message: string;
  scoreImpact: number;
  files: string[];
  requiresApproval: boolean;
};

export type ChangeRiskAssessment = {
  riskScore: number;
  riskLevel: ChangeRiskLevel;
  requiresApproval: boolean;
  changedFiles: string[];
  reasons: ChangeRiskReason[];
};

type RiskRule = {
  code: ChangeRiskReasonCode;
  scoreImpact: number;
  message: string;
  pattern: RegExp;
  requiresApproval: boolean;
};

const HIGH_RISK_APPROVAL_THRESHOLD = 60;
const MAX_REASON_FILES = 5;

const RISK_RULES: readonly RiskRule[] = [
  {
    code: "env_or_secret",
    scoreImpact: 35,
    message: "Secrets, env files, credentials, or private key paths changed.",
    pattern: /(^|\/)(\.env|\.env\..*|.*secret.*|.*credential.*|.*private[_-]?key.*|id_rsa|id_ed25519)$/i,
    requiresApproval: true
  },
  {
    code: "db_schema_or_migration",
    scoreImpact: 35,
    message: "Database schema, migration, SQL, or DDL files changed.",
    pattern: /(^|\/)(prisma\/schema\.prisma|prisma\/migrations\/|migrations\/|ddl\/|.*\.sql$)/i,
    requiresApproval: true
  },
  {
    code: "auth_or_security",
    scoreImpact: 30,
    message: "Authentication, authorization, session, token, or security code changed.",
    pattern: /(^|\/)(auth|security|session|permission|permissions|token|tokens|middleware)(\/|\.|-|_)/i,
    requiresApproval: true
  },
  {
    code: "deploy_or_infra",
    scoreImpact: 30,
    message: "Deployment or infrastructure configuration changed.",
    pattern: /(^|\/)(Dockerfile|docker-compose.*|\.github\/workflows\/|k8s\/|helm\/|terraform\/|pulumi\/|vercel\.json|netlify\.toml|fly\.toml|railway\.json)/i,
    requiresApproval: true
  },
  {
    code: "dependency_manifest",
    scoreImpact: 20,
    message: "Package or dependency manifest changed.",
    pattern: /(^|\/)(package\.json|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?|requirements\.txt|pyproject\.toml|pom\.xml|build\.gradle|Cargo\.toml|go\.mod)$/i,
    requiresApproval: true
  },
  {
    code: "source_code",
    scoreImpact: 10,
    message: "Application or package source code changed.",
    pattern: /(^|\/)(apps|packages)\/.*\.(ts|tsx|js|jsx|mjs|cjs)$/i,
    requiresApproval: false
  }
];

export function assessChangeRisk(
  input: ChangeRiskAssessmentInput
): ChangeRiskAssessment {
  const changedFiles = normalizeChangedFiles(input.changedFiles);

  if (changedFiles.length === 0) {
    return {
      riskScore: 0,
      riskLevel: "low",
      requiresApproval: false,
      changedFiles: [],
      reasons: [
        {
          code: "no_changed_files",
          message: "No changed files were provided.",
          scoreImpact: 0,
          files: [],
          requiresApproval: false
        }
      ]
    };
  }

  const reasons = [
    ...buildRuleReasons(changedFiles),
    ...buildVolumeReasons(changedFiles)
  ];
  const rawScore = 10 + reasons.reduce((total, reason) => total + reason.scoreImpact, 0);
  const riskScore = clampRiskScore(rawScore);

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    requiresApproval:
      riskScore >= HIGH_RISK_APPROVAL_THRESHOLD ||
      reasons.some((reason) => reason.requiresApproval),
    changedFiles: changedFiles.map((file) => file.path),
    reasons
  };
}

function normalizeChangedFiles(changedFiles: RiskChangedFile[]): NormalizedRiskFile[] {
  const seenPaths = new Set<string>();
  const normalizedFiles: NormalizedRiskFile[] = [];

  for (const changedFile of changedFiles) {
    const file =
      typeof changedFile === "string"
        ? { path: changedFile.trim(), status: null }
        : {
            path: changedFile.path.trim(),
            status: changedFile.status?.trim() || null
          };

    if (!file.path || seenPaths.has(file.path)) {
      continue;
    }

    seenPaths.add(file.path);
    normalizedFiles.push(file);
  }

  return normalizedFiles;
}

type NormalizedRiskFile = {
  path: string;
  status: string | null;
};

function buildRuleReasons(files: NormalizedRiskFile[]): ChangeRiskReason[] {
  return RISK_RULES.flatMap((rule) => {
    const matchedFiles = files
      .filter((file) => rule.pattern.test(file.path))
      .map((file) => file.path);

    if (matchedFiles.length === 0) {
      return [];
    }

    return [
      {
        code: rule.code,
        message: rule.message,
        scoreImpact: rule.scoreImpact,
        files: matchedFiles.slice(0, MAX_REASON_FILES),
        requiresApproval: rule.requiresApproval
      }
    ];
  });
}

function buildVolumeReasons(files: NormalizedRiskFile[]): ChangeRiskReason[] {
  const reasons: ChangeRiskReason[] = [];
  const fileCountImpact = getFileCountImpact(files.length);

  if (fileCountImpact > 0) {
    reasons.push({
      code: "file_count",
      message: `${files.length} changed files increase review risk.`,
      scoreImpact: fileCountImpact,
      files: files.map((file) => file.path).slice(0, MAX_REASON_FILES),
      requiresApproval: false
    });
  }

  const deletedFiles = files.filter((file) =>
    ["deleted", "d"].includes(file.status?.toLowerCase() ?? "")
  );

  if (deletedFiles.length > 0) {
    reasons.push({
      code: "file_deletion",
      message: "Deleted files increase review risk.",
      scoreImpact: Math.min(20, deletedFiles.length * 5),
      files: deletedFiles.map((file) => file.path).slice(0, MAX_REASON_FILES),
      requiresApproval: deletedFiles.length >= 3
    });
  }

  return reasons;
}

function getFileCountImpact(fileCount: number): number {
  if (fileCount > 30) {
    return 25;
  }

  if (fileCount > 10) {
    return 15;
  }

  if (fileCount > 5) {
    return 5;
  }

  return 0;
}

function clampRiskScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getRiskLevel(riskScore: number): ChangeRiskLevel {
  if (riskScore >= 85) {
    return "critical";
  }

  if (riskScore >= 60) {
    return "high";
  }

  if (riskScore >= 30) {
    return "medium";
  }

  return "low";
}
