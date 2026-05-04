import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

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

const listIssuesSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  parentId: z.string().trim().min(1).optional(),
  type: issueTypeSchema.optional(),
  status: issueStatusSchema.optional(),
  priority: issuePrioritySchema.optional(),
  assigneeRole: agentRoleSchema.optional()
});

const createIssueSchema = z.object({
  projectId: z.string().trim().min(1),
  parentId: z.string().trim().min(1).nullable().optional(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(20000).nullable().optional(),
  type: issueTypeSchema.default("task"),
  status: issueStatusSchema.default("backlog"),
  priority: issuePrioritySchema.default("medium"),
  assigneeRole: agentRoleSchema.nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(50)).max(20).default([])
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

type IssueFindManyArgs = {
  where?: {
    projectId?: string;
    parentId?: string;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeRole?: AgentRole;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof issueSelect;
};

type IssueCreateArgs = {
  data: z.infer<typeof createIssueSchema>;
  select: typeof issueSelect;
};

type IssuePrismaClient = {
  issue: {
    findMany: (args: IssueFindManyArgs) => Promise<IssueRecord[]>;
    create: (args: IssueCreateArgs) => Promise<IssueRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    projectId: request.nextUrl.searchParams.get("projectId") ?? undefined,
    parentId: request.nextUrl.searchParams.get("parentId") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    priority: request.nextUrl.searchParams.get("priority") ?? undefined,
    assigneeRole: request.nextUrl.searchParams.get("assigneeRole") ?? undefined
  };
  const validation = validateInput(listIssuesSchema, query, {
    message: "Invalid issue query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
    const issues = await prisma.issue.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: issueSelect
    });

    return apiSuccess(issues.map(serializeIssue));
  } catch {
    return apiError("ISSUE_LIST_FAILED", "Failed to list issues.", {
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

  const validation = validateInput(createIssueSchema, body, {
    message: "Invalid issue input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as IssuePrismaClient;
    const issue = await prisma.issue.create({
      data: validation.data,
      select: issueSelect
    });

    return apiSuccess(serializeIssue(issue), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError(
        "ISSUE_PROJECT_OR_PARENT_NOT_FOUND",
        "Issue project or parent issue does not exist.",
        {
          status: 400
        }
      );
    }

    return apiError("ISSUE_CREATE_FAILED", "Failed to create issue.", {
      status: 500
    });
  }
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
