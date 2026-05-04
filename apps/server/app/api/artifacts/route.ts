import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

export const dynamic = "force-dynamic";

const artifactTypeSchema = z.enum([
  "plan",
  "diff",
  "test_report",
  "review",
  "pr_url",
  "log"
]);

const listArtifactsSchema = z.object({
  runId: z.string().trim().min(1).optional(),
  issueId: z.string().trim().min(1).optional(),
  type: artifactTypeSchema.optional()
});

const createArtifactSchema = z
  .object({
    runId: z.string().trim().min(1),
    issueId: z.string().trim().min(1).nullable().optional(),
    type: artifactTypeSchema,
    title: z.string().trim().min(1).max(200).nullable().optional(),
    content: z.string().trim().min(1).max(1000000).nullable().optional(),
    uri: z.string().trim().min(1).max(2000).nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional()
  })
  .refine(
    (value) =>
      (value.content !== undefined && value.content !== null) ||
      (value.uri !== undefined && value.uri !== null),
    {
      message: "Artifact content or uri must be provided."
    }
  );

const artifactSelect = {
  id: true,
  runId: true,
  issueId: true,
  type: true,
  title: true,
  content: true,
  uri: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
};

type ArtifactType = z.infer<typeof artifactTypeSchema>;
type JsonObject = Record<string, unknown>;

type ArtifactRecord = {
  id: string;
  runId: string;
  issueId: string | null;
  type: ArtifactType;
  title: string | null;
  content: string | null;
  uri: string | null;
  metadata: JsonObject | null;
  createdAt: Date;
  updatedAt: Date;
};

type ArtifactResponse = Omit<ArtifactRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type ArtifactFindManyArgs = {
  where?: {
    runId?: string;
    issueId?: string;
    type?: ArtifactType;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof artifactSelect;
};

type ArtifactCreateArgs = {
  data: {
    runId: string;
    issueId: string | null;
    type: ArtifactType;
    title: string | null;
    content: string | null;
    uri: string | null;
    metadata: JsonObject | null;
  };
  select: typeof artifactSelect;
};

type ArtifactPrismaClient = {
  artifact: {
    findMany: (args: ArtifactFindManyArgs) => Promise<ArtifactRecord[]>;
    create: (args: ArtifactCreateArgs) => Promise<ArtifactRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    runId: request.nextUrl.searchParams.get("runId") ?? undefined,
    issueId: request.nextUrl.searchParams.get("issueId") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined
  };
  const validation = validateInput(listArtifactsSchema, query, {
    message: "Invalid artifact query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ArtifactPrismaClient;
    const artifacts = await prisma.artifact.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: artifactSelect
    });

    return apiSuccess(artifacts.map(serializeArtifact));
  } catch {
    return apiError("ARTIFACT_LIST_FAILED", "Failed to list artifacts.", {
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

  const validation = validateInput(createArtifactSchema, body, {
    message: "Invalid artifact input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as ArtifactPrismaClient;
    const artifact = await prisma.artifact.create({
      data: {
        runId: validation.data.runId,
        issueId: validation.data.issueId ?? null,
        type: validation.data.type,
        title: validation.data.title ?? null,
        content: validation.data.content ?? null,
        uri: validation.data.uri ?? null,
        metadata: validation.data.metadata ?? null
      },
      select: artifactSelect
    });

    return apiSuccess(serializeArtifact(artifact), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("ARTIFACT_RUN_OR_ISSUE_NOT_FOUND", "Artifact run or issue does not exist.", {
        status: 400
      });
    }

    return apiError("ARTIFACT_CREATE_FAILED", "Failed to create artifact.", {
      status: 500
    });
  }
}

function serializeArtifact(artifact: ArtifactRecord): ArtifactResponse {
  return {
    ...artifact,
    createdAt: artifact.createdAt.toISOString(),
    updatedAt: artifact.updatedAt.toISOString()
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
