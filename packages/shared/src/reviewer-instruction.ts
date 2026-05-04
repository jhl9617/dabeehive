import type { CodingRunInput } from "./agent-sdk";

export type ReviewerInstructionTestResult = {
  command: string;
  exitCode: number;
  durationMs?: number;
  summary?: string;
  stdoutSummary?: string;
  stderrSummary?: string;
};

export type ReviewerInstructionInput = {
  run: CodingRunInput;
  diffSummary: string;
  changedFiles?: string[];
  testResults?: ReviewerInstructionTestResult[];
  reviewFocus?: string[];
};

export function buildReviewerInstruction(
  input: ReviewerInstructionInput
): string {
  const { issue, project, workspace } = input.run;

  return [
    "You are the reviewer for a local coding agent run.",
    "Review the diff and validation results. Do not modify files or run commands.",
    "",
    "Project:",
    `- ID: ${project.id}`,
    `- Name: ${project.name}`,
    `- Repository: ${formatRepository(project)}`,
    "",
    "Workspace:",
    `- Path: ${workspace.path}`,
    `- Branch: ${workspace.branchName ?? "current branch"}`,
    "",
    "Issue:",
    `- ID: ${issue.id}`,
    `- Title: ${issue.title}`,
    `- Type: ${issue.type}`,
    `- Priority: ${issue.priority}`,
    "",
    "Changed Files:",
    ...formatLines(input.changedFiles ?? [], "No changed files provided."),
    "",
    "Diff Summary:",
    formatText(input.diffSummary),
    "",
    "Test Results:",
    ...formatTestResults(input.testResults ?? []),
    "",
    "Review Focus:",
    ...formatLines(input.reviewFocus ?? [], "No additional review focus provided."),
    "",
    "Output Requirements:",
    "- List correctness, regression, security, and test coverage concerns.",
    "- Prioritize blocking issues before non-blocking suggestions.",
    "- Reference changed files when possible.",
    "- State whether the change is ready for approval or needs follow-up."
  ].join("\n");
}

function formatRepository(project: CodingRunInput["project"]): string {
  if (project.repoOwner && project.repoName) {
    return `${project.repoOwner}/${project.repoName}`;
  }

  return project.repoUrl ?? "Unknown";
}

function formatText(value: string | null | undefined): string {
  const trimmedValue = value?.trim();

  return trimmedValue || "No content provided.";
}

function formatLines(values: string[], emptyLabel: string): string[] {
  if (values.length === 0) {
    return [emptyLabel];
  }

  return values.map((value) => `- ${value}`);
}

function formatTestResults(
  testResults: ReviewerInstructionTestResult[]
): string[] {
  if (testResults.length === 0) {
    return ["No test results provided."];
  }

  return testResults.flatMap((result, index) => [
    `${index + 1}. ${result.command}`,
    `- Exit Code: ${result.exitCode}`,
    `- Duration: ${formatDuration(result.durationMs)}`,
    `- Summary: ${formatText(result.summary)}`,
    `- Stdout Summary: ${formatText(result.stdoutSummary)}`,
    `- Stderr Summary: ${formatText(result.stderrSummary)}`
  ]);
}

function formatDuration(durationMs: number | undefined): string {
  return durationMs === undefined ? "Unknown" : `${durationMs}ms`;
}
