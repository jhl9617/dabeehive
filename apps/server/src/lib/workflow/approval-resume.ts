export type ApprovalResponseAction = "approve" | "reject" | "request_changes";

export type ApprovalResumeType =
  | "schema_change"
  | "auth_change"
  | "billing_change"
  | "prod_deploy"
  | "spec_approval"
  | "final_approval"
  | "risk_approval"
  | "general";

export type ApprovalResumeRunStatus =
  | "planning"
  | "coding"
  | "reviewing"
  | "succeeded"
  | "failed";

export type ResumableApproval = {
  runId: string | null;
  type: ApprovalResumeType;
};

export type ResumeRunAfterApprovalInput = {
  approval: ResumableApproval;
  action: ApprovalResponseAction;
  respondedAt?: Date;
  responseReason?: string | null;
};

export type ApprovalRunResumeResult = {
  resumed: boolean;
  runId: string | null;
  nextStatus: ApprovalResumeRunStatus | null;
  reason: "resumed" | "approval_has_no_run" | "no_resume_status";
};

export const approvalResumeRunSelect = {
  id: true,
  status: true,
  completedAt: true,
  errorMessage: true,
  updatedAt: true
};

type ApprovalRunUpdateData = {
  status: ApprovalResumeRunStatus;
  completedAt?: Date | null;
  errorMessage?: string | null;
};

type ApprovalRunUpdateArgs = {
  where: {
    id: string;
  };
  data: ApprovalRunUpdateData;
  select: typeof approvalResumeRunSelect;
};

export type ApprovalResumePrismaClient = {
  agentRun: {
    update: (args: ApprovalRunUpdateArgs) => Promise<unknown>;
  };
};

export async function resumeRunAfterApproval(
  prisma: ApprovalResumePrismaClient,
  input: ResumeRunAfterApprovalInput
): Promise<ApprovalRunResumeResult> {
  const nextStatus = getRunStatusAfterApprovalResponse(
    input.action,
    input.approval.type
  );

  if (!input.approval.runId) {
    return {
      resumed: false,
      runId: null,
      nextStatus,
      reason: "approval_has_no_run"
    };
  }

  if (!nextStatus) {
    return {
      resumed: false,
      runId: input.approval.runId,
      nextStatus: null,
      reason: "no_resume_status"
    };
  }

  await prisma.agentRun.update({
    where: {
      id: input.approval.runId
    },
    data: buildApprovalRunUpdateData(nextStatus, input),
    select: approvalResumeRunSelect
  });

  return {
    resumed: true,
    runId: input.approval.runId,
    nextStatus,
    reason: "resumed"
  };
}

export function getRunStatusAfterApprovalResponse(
  action: ApprovalResponseAction,
  type: ApprovalResumeType
): ApprovalResumeRunStatus | null {
  if (action === "reject") {
    return "failed";
  }

  if (action === "request_changes") {
    return type === "final_approval" ? "coding" : "planning";
  }

  return type === "final_approval" ? "succeeded" : "coding";
}

export function buildApprovalRunUpdateData(
  nextStatus: ApprovalResumeRunStatus,
  input: Pick<ResumeRunAfterApprovalInput, "respondedAt" | "responseReason">
): ApprovalRunUpdateData {
  if (nextStatus === "failed") {
    return {
      status: nextStatus,
      completedAt: input.respondedAt ?? new Date(),
      errorMessage: normalizeRejectionReason(input.responseReason)
    };
  }

  if (nextStatus === "succeeded") {
    return {
      status: nextStatus,
      completedAt: input.respondedAt ?? new Date(),
      errorMessage: null
    };
  }

  return {
    status: nextStatus,
    errorMessage: null
  };
}

function normalizeRejectionReason(reason: string | null | undefined): string {
  const normalizedReason = reason?.trim();

  return normalizedReason || "Run failed after approval rejection.";
}
