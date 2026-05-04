export const PLAN_APPROVAL_TYPE = "spec_approval" as const;
export const PLAN_APPROVAL_STATUS = "pending" as const;
export const DEFAULT_PLAN_APPROVAL_REASON =
  "Planner produced an implementation plan that requires approval before coding starts.";
export const DEFAULT_PLAN_APPROVAL_REQUIRED_ACTION =
  "Review the implementation plan and approve, reject, or request changes.";

export const planApprovalSelect = {
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

export type PlanApprovalInput = {
  runId: string;
  issueId: string;
  plannerOutput: string;
  requestedById?: string | null;
  reason?: string;
  requiredAction?: string;
  riskScore?: number;
};

export type PlanApprovalCreateData = {
  issueId: string;
  runId: string;
  requestedById: string | null;
  type: typeof PLAN_APPROVAL_TYPE;
  status: typeof PLAN_APPROVAL_STATUS;
  reason: string;
  changedFiles: string[];
  diffSummary: string;
  riskScore: number;
  requiredAction: string;
};

export type PlanApprovalRecord = PlanApprovalCreateData & {
  id: string;
  respondedById: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PlanApprovalCreateArgs = {
  data: PlanApprovalCreateData;
  select: typeof planApprovalSelect;
};

export type PlanApprovalPrismaClient = {
  approval: {
    create: (args: PlanApprovalCreateArgs) => Promise<PlanApprovalRecord>;
  };
};

export async function createPlanApproval(
  prisma: PlanApprovalPrismaClient,
  input: PlanApprovalInput
): Promise<PlanApprovalRecord> {
  return prisma.approval.create({
    data: buildPlanApprovalData(input),
    select: planApprovalSelect
  });
}

export function buildPlanApprovalData(
  input: PlanApprovalInput
): PlanApprovalCreateData {
  return {
    issueId: input.issueId,
    runId: input.runId,
    requestedById: input.requestedById ?? null,
    type: PLAN_APPROVAL_TYPE,
    status: PLAN_APPROVAL_STATUS,
    reason: normalizeText(input.reason, DEFAULT_PLAN_APPROVAL_REASON),
    changedFiles: [],
    diffSummary: normalizeText(input.plannerOutput, "No planner output provided."),
    riskScore: normalizeRiskScore(input.riskScore),
    requiredAction: normalizeText(
      input.requiredAction,
      DEFAULT_PLAN_APPROVAL_REQUIRED_ACTION
    )
  };
}

function normalizeText(value: string | undefined, fallback: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function normalizeRiskScore(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 20;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
