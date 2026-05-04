import {
  storeRunArtifact,
  type WorkflowArtifactInput,
  type WorkflowArtifactPrismaClient,
  type WorkflowArtifactRecord
} from "./artifact-storage";

export const TEST_RESULT_ARTIFACT_TYPE = "test_report" as const;

export type TestResultStatus = "passed" | "failed" | "skipped" | "not_run";

export type TestResultArtifactInput = {
  runId: string;
  issueId?: string | null;
  command: string;
  status: TestResultStatus;
  title?: string | null;
  exitCode?: number | null;
  durationMs?: number | null;
  stdoutSummary?: string | null;
  stderrSummary?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function storeTestResultArtifact(
  prisma: WorkflowArtifactPrismaClient,
  input: TestResultArtifactInput
): Promise<WorkflowArtifactRecord> {
  return storeRunArtifact(prisma, buildTestResultArtifactInput(input));
}

export function buildTestResultArtifactInput(
  input: TestResultArtifactInput
): WorkflowArtifactInput {
  return {
    runId: input.runId,
    issueId: input.issueId ?? null,
    type: TEST_RESULT_ARTIFACT_TYPE,
    title: normalizeText(
      input.title,
      `Test Result: ${formatStatusLabel(input.status)}`
    ),
    content: buildTestResultArtifactContent(input),
    metadata: buildTestResultArtifactMetadata(input)
  };
}

export function buildTestResultArtifactContent(
  input: TestResultArtifactInput
): string {
  const command = normalizeText(input.command, "unknown command");
  const exitCode = normalizeOptionalNumber(input.exitCode);
  const durationMs = normalizeOptionalNumber(input.durationMs);
  const startedAt = normalizeOptionalText(input.startedAt);
  const completedAt = normalizeOptionalText(input.completedAt);
  const stdoutSummary = normalizeOptionalText(input.stdoutSummary);
  const stderrSummary = normalizeOptionalText(input.stderrSummary);
  const lines = [
    "# Test Result",
    "",
    `- Status: ${formatStatusLabel(input.status)}`,
    `- Command: ${command}`
  ];

  if (exitCode !== null) {
    lines.push(`- Exit Code: ${exitCode}`);
  }

  if (durationMs !== null) {
    lines.push(`- Duration: ${durationMs}ms`);
  }

  if (startedAt) {
    lines.push(`- Started At: ${startedAt}`);
  }

  if (completedAt) {
    lines.push(`- Completed At: ${completedAt}`);
  }

  appendSummarySection(lines, "stdout", stdoutSummary);
  appendSummarySection(lines, "stderr", stderrSummary);

  return lines.join("\n");
}

export function buildTestResultArtifactMetadata(
  input: TestResultArtifactInput
): Record<string, unknown> {
  return omitUndefined({
    ...(input.metadata ?? {}),
    kind: "test_result",
    command: normalizeText(input.command, "unknown command"),
    status: input.status,
    exitCode: normalizeOptionalNumber(input.exitCode),
    durationMs: normalizeOptionalNumber(input.durationMs),
    startedAt: normalizeOptionalText(input.startedAt),
    completedAt: normalizeOptionalText(input.completedAt)
  });
}

function appendSummarySection(
  lines: string[],
  title: string,
  value: string | null
) {
  if (!value) {
    return;
  }

  lines.push("", `## ${title}`, "", value);
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue || fallback;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
}

function normalizeOptionalNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

function formatStatusLabel(status: TestResultStatus): string {
  const labels: Record<TestResultStatus, string> = {
    passed: "Passed",
    failed: "Failed",
    skipped: "Skipped",
    not_run: "Not Run"
  };

  return labels[status];
}

function omitUndefined(
  value: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}
