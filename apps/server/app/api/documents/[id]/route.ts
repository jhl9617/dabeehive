import { z } from "zod";

import { apiError, apiSuccess } from "../../../../src/lib/api-response";
import { getPrismaClient } from "../../../../src/lib/db/prisma";
import { validateInput } from "../../../../src/lib/validation";

export const dynamic = "force-dynamic";

const documentTypeSchema = z.enum(["prd", "adr", "spec", "runbook", "retro"]);
const documentStatusSchema = z.enum([
  "draft",
  "in_review",
  "approved",
  "archived"
]);

const documentParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const updateDocumentSchema = z
  .object({
    type: documentTypeSchema.optional(),
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(100000).optional(),
    version: z.number().int().positive().max(100000).optional(),
    status: documentStatusSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one document field must be provided."
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
type DocumentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

type DocumentFindUniqueArgs = {
  where: {
    id: string;
  };
  select: typeof documentSelect;
};

type DocumentUpdateArgs = {
  where: {
    id: string;
  };
  data: z.infer<typeof updateDocumentSchema>;
  select: typeof documentSelect;
};

type DocumentPrismaClient = {
  document: {
    findUnique: (args: DocumentFindUniqueArgs) => Promise<DocumentRecord | null>;
    update: (args: DocumentUpdateArgs) => Promise<DocumentRecord>;
  };
};

export async function GET(_request: Request, context: DocumentRouteContext) {
  const params = await validateDocumentParams(context);

  if (!params.success) {
    return params.response;
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as DocumentPrismaClient;
    const document = await prisma.document.findUnique({
      where: {
        id: params.id
      },
      select: documentSelect
    });

    if (!document) {
      return documentNotFound();
    }

    return apiSuccess(serializeDocument(document));
  } catch {
    return apiError("DOCUMENT_GET_FAILED", "Failed to get document.", {
      status: 500
    });
  }
}

export async function PATCH(request: Request, context: DocumentRouteContext) {
  const params = await validateDocumentParams(context);

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

  const validation = validateInput(updateDocumentSchema, body, {
    message: "Invalid document update input."
  });

  if (!validation.success) {
    return apiError(validation.error.code, validation.error.message, {
      status: 400,
      details: validation.error.details
    });
  }

  try {
    const prisma = (await getPrismaClient()) as unknown as DocumentPrismaClient;
    const document = await prisma.document.update({
      where: {
        id: params.id
      },
      data: validation.data,
      select: documentSelect
    });

    return apiSuccess(serializeDocument(document));
  } catch (error) {
    if (hasPrismaErrorCode(error, "P2025")) {
      return documentNotFound();
    }

    return apiError("DOCUMENT_UPDATE_FAILED", "Failed to update document.", {
      status: 500
    });
  }
}

async function validateDocumentParams(context: DocumentRouteContext): Promise<
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      response: ReturnType<typeof apiError>;
    }
> {
  const validation = validateInput(documentParamsSchema, await context.params, {
    message: "Invalid document route params."
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

function documentNotFound() {
  return apiError("DOCUMENT_NOT_FOUND", "Document was not found.", {
    status: 404
  });
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
