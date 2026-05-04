export type WorkflowArtifactType = "plan" | "diff" | "test_report" | "review";

export type WorkflowArtifactInput = {
  runId: string;
  issueId?: string | null;
  type: WorkflowArtifactType;
  title?: string | null;
  content?: string | null;
  uri?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type WorkflowArtifactCreateData = {
  runId: string;
  issueId: string | null;
  type: WorkflowArtifactType;
  title: string;
  content: string | null;
  uri: string | null;
  metadata: Record<string, unknown> | null;
};

export type WorkflowArtifactRecord = WorkflowArtifactCreateData & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export const workflowArtifactSelect = {
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

const DEFAULT_ARTIFACT_TITLES: Record<WorkflowArtifactType, string> = {
  plan: "Implementation Plan",
  diff: "Code Diff",
  test_report: "Test Report",
  review: "Review Report"
};

type WorkflowArtifactCreateArgs = {
  data: WorkflowArtifactCreateData;
  select: typeof workflowArtifactSelect;
};

export type WorkflowArtifactPrismaClient = {
  artifact: {
    create: (
      args: WorkflowArtifactCreateArgs
    ) => Promise<WorkflowArtifactRecord>;
  };
};

export async function storeRunArtifact(
  prisma: WorkflowArtifactPrismaClient,
  input: WorkflowArtifactInput
): Promise<WorkflowArtifactRecord> {
  return prisma.artifact.create({
    data: buildRunArtifactData(input),
    select: workflowArtifactSelect
  });
}

export function buildRunArtifactData(
  input: WorkflowArtifactInput
): WorkflowArtifactCreateData {
  const content = normalizeOptionalText(input.content);
  const uri = normalizeOptionalText(input.uri);

  if (!content && !uri) {
    throw new Error("Artifact content or uri must be provided.");
  }

  return {
    runId: input.runId,
    issueId: input.issueId ?? null,
    type: input.type,
    title: normalizeText(input.title, DEFAULT_ARTIFACT_TITLES[input.type]),
    content,
    uri,
    metadata: input.metadata ?? null
  };
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
}
