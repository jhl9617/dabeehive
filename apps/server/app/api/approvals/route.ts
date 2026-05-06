import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

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

const listApprovalsSchema = z.object({
  issueId: z.string().trim().min(1).optional(),
  runId: z.string().trim().min(1).optional(),
  status: approvalStatusSchema.optional(),
  type: approvalTypeSchema.optional()
});

const createApprovalSchema = z
  .object({
    issueId: z.string().trim().min(1).nullable().optional(),
    runId: z.string().trim().min(1).nullable().optional(),
    requestedById: z.string().trim().min(1).nullable().optional(),
    type: approvalTypeSchema.default("general"),
    reason: z.string().trim().min(1).max(100000).nullable().optional(),
    changedFiles: z.array(z.string().trim().min(1).max(2048)).max(200).default([]),
    diffSummary: z.string().trim().min(1).max(100000).nullable().optional(),
    riskScore: z.number().int().min(0).max(100).nullable().optional(),
    requiredAction: z.string().trim().min(1).max(100000).nullable().optional()
  })
  .refine((input) => input.issueId || input.runId, {
    message: "Approval must be linked to an issue or run.",
    path: ["issueId"]
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

type ApprovalFindManyArgs = {
  where?: {
    issueId?: string;
    runId?: string;
    status?: ApprovalStatus;
    type?: ApprovalType;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof approvalSelect;
};

type ApprovalCreateArgs = {
  data: z.infer<typeof createApprovalSchema> & {
    status: "pending";
  };
  select: typeof approvalSelect;
};

type ApprovalPrismaClient = {
  approval: {
    findMany: (args: ApprovalFindManyArgs) => Promise<ApprovalRecord[]>;
    create: (args: ApprovalCreateArgs) => Promise<ApprovalRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    issueId: request.nextUrl.searchParams.get("issueId") ?? undefined,
    runId: request.nextUrl.searchParams.get("runId") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined
  };
  const validation = validateInput(listApprovalsSchema, query, {
    message: "Invalid approval query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ApprovalPrismaClient;
    const approvals = await prisma.approval.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: approvalSelect
    });

    return apiSuccess(approvals.map(serializeApproval));
  } catch {
    return apiError("APPROVAL_LIST_FAILED", "Failed to list approvals.", {
      status: 500
    });
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", {
      status: 400
    });
  }

  const validation = validateInput(createApprovalSchema, body, {
    message: "Invalid approval input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ApprovalPrismaClient;
    const approval = await prisma.approval.create({
      data: {
        ...validation.data,
        status: "pending"
      },
      select: approvalSelect
    });

    return apiSuccess(serializeApproval(approval), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError(
        "APPROVAL_LINK_NOT_FOUND",
        "Approval issue, run, or requester does not exist.",
        {
          status: 400
        }
      );
    }

    return apiError("APPROVAL_CREATE_FAILED", "Failed to create approval.", {
      status: 500
    });
  }
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
