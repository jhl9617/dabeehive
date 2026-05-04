import { z } from "zod";

import { apiError, apiSuccess } from "../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../src/lib/db/prisma";
import { validateInput } from "../../../../src/lib/validation";

export const dynamic = "force-dynamic";

const approvalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "changes_requested"
]);
const approvalTypeSchema = z.enum([
  "schema_change",
  "auth_change",
  "billing_change",
  "prod_deploy",
  "spec_approval",
  "final_approval",
  "risk_approval",
  "general"
]);

const approvalParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const approvalResponseActionSchema = z.enum([
  "approve",
  "reject",
  "request_changes"
]);
const respondApprovalSchema = z.object({
  action: approvalResponseActionSchema,
  respondedById: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().min(1).max(100000).nullable().optional()
});

const approvalSelect = {
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

type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
type ApprovalType = z.infer<typeof approvalTypeSchema>;
type ApprovalResponseAction = z.infer<typeof approvalResponseActionSchema>;
type ApprovalRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ApprovalRecord = {
  id: string;
  issueId: string | null;
  runId: string | null;
  requestedById: string | null;
  respondedById: string | null;
  type: ApprovalType;
  status: ApprovalStatus;
  reason: string | null;
  changedFiles: string[];
  diffSummary: string | null;
  riskScore: number | null;
  requiredAction: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ApprovalResponse = Omit<
  ApprovalRecord,
  "respondedAt" | "createdAt" | "updatedAt"
> & {
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApprovalFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof approvalSelect;
};

type ApprovalUpdateArgs = {
  where: {
    id: string;
  };
  data: {
    status: Exclude<ApprovalStatus, "pending">;
    respondedById: string | null;
    respondedAt: Date;
    reason?: string | null;
  };
  select: typeof approvalSelect;
};

type ApprovalPrismaClient = {
  approval: {
    findUnique: (args: ApprovalFindUniqueArgs) => Promise<ApprovalRecord | null>;
    update: (args: ApprovalUpdateArgs) => Promise<ApprovalRecord>;
  };
};

export async function GET(_request: Request, context: ApprovalRouteContext) {
  const params = await validateApprovalParams(context);

  if (!params.success) {
    return params.response;
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ApprovalPrismaClient;
    const approval = await prisma.approval.findUnique({
      where: {
        id: params.id
      },
      select: approvalSelect
    });

    if (!approval) {
      return approvalNotFound();
    }

    return apiSuccess(serializeApproval(approval));
  } catch {
    return apiError("APPROVAL_GET_FAILED", "Failed to get approval.", {
      status: 500
    });
  }
}

export async function POST(request: Request, context: ApprovalRouteContext) {
  const params = await validateApprovalParams(context);

  if (!params.success) {
    return params.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", {
      status: 400
    });
  }

  const validation = validateInput(respondApprovalSchema, body, {
    message: "Invalid approval response input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ApprovalPrismaClient;
    const approval = await prisma.approval.update({
      where: {
        id: params.id
      },
      data: {
        status: mapApprovalStatus(validation.data.action),
        respondedById: validation.data.respondedById ?? null,
        respondedAt: new Date(),
        ...(validation.data.reason !== undefined
          ? {
              reason: validation.data.reason
            }
          : {})
      },
      select: approvalSelect
    });

    return apiSuccess(serializeApproval(approval));
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2025")) {
      return approvalNotFound();
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("APPROVAL_RESPONDER_NOT_FOUND", "Approval responder does not exist.", {
        status: 400
      });
    }

    return apiError("APPROVAL_RESPOND_FAILED", "Failed to respond to approval.", {
      status: 500
    });
  }
}

async function validateApprovalParams(
  context: ApprovalRouteContext
): Promise<
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      response: ReturnType<typeof apiError>;
    }
> {
  const validation = validateInput(approvalParamsSchema, await context.params, {
    message: "Invalid approval route params."
  });

  if (!validation.success) {
    return {
      success: false,
      response: apiError(validation.error.code, validation.error.message, {
        status: 400,
        details: validation.error.details
      })
    };
  }

  return {
    success: true,
    id: validation.data.id
  };
}

function approvalNotFound() {
  return apiError("APPROVAL_NOT_FOUND", "Approval was not found.", {
    status: 404
  });
}

function mapApprovalStatus(
  action: ApprovalResponseAction
): Exclude<ApprovalStatus, "pending"> {
  if (action === "approve") {
    return "approved";
  }

  if (action === "reject") {
    return "rejected";
  }

  return "changes_requested";
}

function serializeApproval(approval: ApprovalRecord): ApprovalResponse {
  return {
    ...approval,
    respondedAt: approval.respondedAt?.toISOString() ?? null,
    createdAt: approval.createdAt.toISOString(),
    updatedAt: approval.updatedAt.toISOString()
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}
