import { z } from "zod";

import { apiError, apiSuccess } from "../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../src/lib/db/prisma";
import { validateInput } from "../../../../src/lib/validation";

export const dynamic = "force-dynamic";

const issueTypeSchema = z.enum(["epic", "story", "task", "bug"]);
const issueStatusSchema = z.enum([
  "backlog",
  "ready",
  "in_progress",
  "in_review",
  "qa",
  "done"
]);
const issuePrioritySchema = z.enum(["critical", "high", "medium", "low"]);
const agentRoleSchema = z.enum([
  "planner",
  "architect",
  "backend",
  "frontend",
  "qa",
  "release"
]);

const issueParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const updateIssueSchema = z
  .object({
    parentId: z.string().trim().min(1).nullable().optional(),
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().max(20000).nullable().optional(),
    type: issueTypeSchema.optional(),
    status: issueStatusSchema.optional(),
    priority: issuePrioritySchema.optional(),
    assigneeRole: agentRoleSchema.nullable().optional(),
    labels: z.array(z.string().trim().min(1).max(50)).max(20).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one issue field must be provided."
  });

const issueSelect = {
  id: true,
  projectId: true,
  parentId: true,
  title: true,
  body: true,
  type: true,
  status: true,
  priority: true,
  assigneeRole: true,
  labels: true,
  createdAt: true,
  updatedAt: true
};

type IssueType = z.infer<typeof issueTypeSchema>;
type IssueStatus = z.infer<typeof issueStatusSchema>;
type IssuePriority = z.infer<typeof issuePrioritySchema>;
type AgentRole = z.infer<typeof agentRoleSchema>;
type IssueRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type IssueRecord = {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  body: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeRole: AgentRole | null;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
};

type IssueResponse = Omit<IssueRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type IssueFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof issueSelect;
};

type IssueUpdateArgs = {
  where: {
    id: string;
  };
  data: z.infer<typeof updateIssueSchema>;
  select: typeof issueSelect;
};

type IssuePrismaClient = {
  issue: {
    findUnique: (args: IssueFindUniqueArgs) => Promise<IssueRecord | null>;
    update: (args: IssueUpdateArgs) => Promise<IssueRecord>;
  };
};

export async function GET(_request: Request, context: IssueRouteContext) {
  const params = await validateIssueParams(context);

  if (!params.success) {
    return params.response;
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
    const issue = await prisma.issue.findUnique({
      where: {
        id: params.id
      },
      select: issueSelect
    });

    if (!issue) {
      return issueNotFound();
    }

    return apiSuccess(serializeIssue(issue));
  } catch {
    return apiError("ISSUE_GET_FAILED", "Failed to get issue.", {
      status: 500
    });
  }
}

export async function PATCH(request: Request, context: IssueRouteContext) {
  const params = await validateIssueParams(context);

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

  const validation = validateInput(updateIssueSchema, body, {
    message: "Invalid issue update input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
    const issue = await prisma.issue.update({
      where: {
        id: params.id
      },
      data: validation.data,
      select: issueSelect
    });

    return apiSuccess(serializeIssue(issue));
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2025")) {
      return issueNotFound();
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("ISSUE_PARENT_NOT_FOUND", "Parent issue does not exist.", {
        status: 400
      });
    }

    return apiError("ISSUE_UPDATE_FAILED", "Failed to update issue.", {
      status: 500
    });
  }
}

async function validateIssueParams(context: IssueRouteContext): Promise<
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      response: ReturnType<typeof apiError>;
    }
> {
  const validation = validateInput(issueParamsSchema, await context.params, {
    message: "Invalid issue route params."
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

function issueNotFound() {
  return apiError("ISSUE_NOT_FOUND", "Issue was not found.", {
    status: 404
  });
}

function serializeIssue(issue: IssueRecord): IssueResponse {
  return {
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString()
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
