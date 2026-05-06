export type SensitiveFileCategory =
  | "auth_or_security"
  | "db_schema_or_migration"
  | "deploy_or_infra";

export type SensitiveChangedFile =
  | string
  | {
      path: string;
      status?: string | null;
    };

export type SensitiveFileDetectionInput = {
  changedFiles: SensitiveChangedFile[];
};

export type SensitiveFileRule = {
  category: SensitiveFileCategory;
  message: string;
  pattern: RegExp;
  requiresApproval: boolean;
};

export type SensitiveFileMatch = {
  category: SensitiveFileCategory;
  message: string;
  files: string[];
  requiresApproval: boolean;
};

export type SensitiveFileDetection = {
  hasSensitiveFiles: boolean;
  requiresApproval: boolean;
  changedFiles: string[];
  matches: SensitiveFileMatch[];
};

const MAX_MATCH_FILES = 5;

export const SENSITIVE_FILE_RULES: readonly SensitiveFileRule[] = [
  {
    category: "auth_or_security",
    message: "Authentication, authorization, session, token, or security code changed.",
    pattern: /(^|\/)(auth|security|session|permission|permissions|token|tokens|middleware)(\/|\.|-|_)/i,
    requiresApproval: true
  },
  {
    category: "db_schema_or_migration",
    message: "Database schema, migration, SQL, or DDL files changed.",
    pattern: /(^|\/)(prisma\/schema\.prisma|prisma\/migrations\/|migrations\/|ddl\/|.*\.sql$)/i,
    requiresApproval: true
  },
  {
    category: "deploy_or_infra",
    message: "Deployment or infrastructure configuration changed.",
    pattern: /(^|\/)(Dockerfile|docker-compose.*|\.github\/workflows\/|k8s\/|helm\/|terraform\/|pulumi\/|vercel\.json|netlify\.toml|fly\.toml|railway\.json)/i,
    requiresApproval: true
  }
];

export function detectSensitiveFiles(
  input: SensitiveFileDetectionInput
): SensitiveFileDetection {
  const changedFiles = normalizeSensitiveChangedFiles(input.changedFiles);
  const matches = SENSITIVE_FILE_RULES.flatMap((rule) => {
    const files = changedFiles.filter((file) => rule.pattern.test(file));

    if (files.length === 0) {
      return [];
    }

    return [
      {
        category: rule.category,
        message: rule.message,
        files: files.slice(0, MAX_MATCH_FILES),
        requiresApproval: rule.requiresApproval
      }
    ];
  });

  return {
    hasSensitiveFiles: matches.length > 0,
    requiresApproval: matches.some((match) => match.requiresApproval),
    changedFiles,
    matches
  };
}

export function isSensitiveFilePath(path: string): boolean {
  return SENSITIVE_FILE_RULES.some((rule) => rule.pattern.test(path.trim()));
}

function normalizeSensitiveChangedFiles(
  changedFiles: SensitiveChangedFile[]
): string[] {
  const seenPaths = new Set<string>();
  const normalizedFiles: string[] = [];

  for (const changedFile of changedFiles) {
    const path =
      typeof changedFile === "string"
        ? changedFile.trim()
        : changedFile.path.trim();

    if (!path || seenPaths.has(path)) {
      continue;
    }

    seenPaths.add(path);
    normalizedFiles.push(path);
  }

  return normalizedFiles;
}
