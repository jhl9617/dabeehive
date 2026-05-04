import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "../../../src/lib/api-response";
import { getPrismaClient } from "../../../src/lib/db/prisma";
import { validateInput } from "../../../src/lib/validation";

export const dynamic = "force-dynamic";

const documentTypeSchema = z.enum(["prd", "adr", "spec", "runbook", "retro"]);
const documentStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "archived"
]);

const listDocumentsSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  type: documentTypeSchema.optional(),
  status: documentStatusSchema.optional()
});

const createDocumentSchema = z.object({
  projectId: z.string().trim().min(1),
  type: documentTypeSchema,
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(100000),
  version: z.number().int().positive().max(100000).default(1),
  status: documentStatusSchema.default("draft")
});

const documentSelect = {
  id: true,
  projectId: true,
  type: true,
  title: true,
  content: true,
  version: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

type DocumentType = z.infer<typeof documentTypeSchema>;
type DocumentStatus = z.infer<typeof documentStatusSchema>;

type DocumentRecord = {
  id: string;
  projectId: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
};

type DocumentResponse = Omit<DocumentRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type DocumentFindManyArgs = {
  where?: {
    projectId?: string;
    type?: DocumentType;
    status?: DocumentStatus;
  };
  orderBy: {
    createdAt: "desc";
  };
  select: typeof documentSelect;
};

type DocumentCreateArgs = {
  data: z.infer<typeof createDocumentSchema>;
  select: typeof documentSelect;
};

type DocumentPrismaClient = {
  document: {
    findMany: (args: DocumentFindManyArgs) => Promise<DocumentRecord[]>;
    create: (args: DocumentCreateArgs) => Promise<DocumentRecord>;
  };
};

export async function GET(request: NextRequest) {
  const query = {
    projectId: request.nextUrl.searchParams.get("projectId") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined
  };
  const validation = validateInput(listDocumentsSchema, query, {
    message: "Invalid document query."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as DocumentPrismaClient;
    const documents = await prisma.document.findMany({
      where: validation.data,
      orderBy: {
        createdAt: "desc"
      },
      select: documentSelect
    });

    return apiSuccess(documents.map(serializeDocument));
  } catch {
    return apiError("DOCUMENT_LIST_FAILED", "Failed to list documents.", {
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

  const validation = validateInput(createDocumentSchema, body, {
    message: "Invalid document input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as DocumentPrismaClient;
    const document = await prisma.document.create({
      data: validation.data,
      select: documentSelect
    });

    return apiSuccess(serializeDocument(document), {
      status: 201
    });
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2003")) {
      return apiError("DOCUMENT_PROJECT_NOT_FOUND", "Document project does not exist.", {
        status: 400
      });
    }

    return apiError("DOCUMENT_CREATE_FAILED", "Failed to create document.", {
      status: 500
    });
  }
}

function serializeDocument(document: DocumentRecord): DocumentResponse {
  return {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
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
