export const FINAL_DIFF_APPROVAL_TYPE = "final_approval" as const;
export const FINAL_DIFF_APPROVAL_STATUS = "pending" as const;
export const DEFAULT_FINAL_DIFF_APPROVAL_REASON =
  "Coder produced a final diff that requires approval before completion.";
export const DEFAULT_FINAL_DIFF_APPROVAL_REQUIRED_ACTION =
  "Review the final diff, changed files, and validation results before approving completion.";

export const finalDiffApprovalSelect = {
  id: true,
  issueId: true,
  runId: true,
  requestedById: true,
  respondedById: true,
  type: true,
  status: true,
  reason: true,
  changedFiles: true,
  diffSummary: true,
  riskScore: true,
  requiredAction: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true
};

export type FinalDiffApprovalInput = {
  runId: string;
  issueId: string;
  diffSummary: string;
  changedFiles: string[];
  requestedById?: string | null;
  reason?: string;
  requiredAction?: string;
  riskScore?: number;
};

export type FinalDiffApprovalCreateData = {
  issueId: string;
  runId: string;
  requestedById: string | null;
  type: typeof FINAL_DIFF_APPROVAL_TYPE;
  status: typeof FINAL_DIFF_APPROVAL_STATUS;
  reason: string;
  changedFiles: string[];
  diffSummary: string;
  riskScore: number;
  requiredAction: string;
};

export type FinalDiffApprovalRecord = FinalDiffApprovalCreateData & {
  id: string;
  respondedById: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type FinalDiffApprovalCreateArgs = {
  data: FinalDiffApprovalCreateData;
  select: typeof finalDiffApprovalSelect;
};

export type FinalDiffApprovalPrismaClient = {
  approval: {
    create: (
      args: FinalDiffApprovalCreateArgs
    ) => Promise<FinalDiffApprovalRecord>;
  };
};

export async function createFinalDiffApproval(
  prisma: FinalDiffApprovalPrismaClient,
  input: FinalDiffApprovalInput
): Promise<FinalDiffApprovalRecord> {
  return prisma.approval.create({
    data: buildFinalDiffApprovalData(input),
    select: finalDiffApprovalSelect
  });
}

export function buildFinalDiffApprovalData(
  input: FinalDiffApprovalInput
): FinalDiffApprovalCreateData {
  return {
    issueId: input.issueId,
    runId: input.runId,
    requestedById: input.requestedById ?? null,
    type: FINAL_DIFF_APPROVAL_TYPE,
    status: FINAL_DIFF_APPROVAL_STATUS,
    reason: normalizeText(input.reason, DEFAULT_FINAL_DIFF_APPROVAL_REASON),
    changedFiles: normalizeChangedFiles(input.changedFiles),
    diffSummary: normalizeText(input.diffSummary, "No diff summary provided."),
    riskScore: normalizeRiskScore(input.riskScore),
    requiredAction: normalizeText(
      input.requiredAction,
      DEFAULT_FINAL_DIFF_APPROVAL_REQUIRED_ACTION
    )
  };
}

function normalizeText(value: string | undefined, fallback: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function normalizeChangedFiles(changedFiles: string[]): string[] {
  return Array.from(
    new Set(
      changedFiles
        .map((changedFile) => changedFile.trim())
        .filter((changedFile) => changedFile.length > 0)
    )
  );
}

function normalizeRiskScore(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 40;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
