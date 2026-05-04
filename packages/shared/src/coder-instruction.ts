import type { CodingRunInput } from "./agent-sdk";

export type CoderInstructionInput = {
  run: CodingRunInput;
  approvedPlan: string;
  constraints?: string[];
  validationCommands?: string[];
};

export function buildCoderInstruction(input: CoderInstructionInput): string {
  const { issue, project, workspace } = input.run;

  return [
    "You are the coder for a local coding agent run.",
    "Implement only the approved plan. Keep changes minimal and scoped.",
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
    "Approved Plan:",
    formatText(input.approvedPlan),
    "",
    "Constraints:",
    ...formatLines(input.constraints ?? [], "No additional constraints provided."),
    "",
    "Validation Commands:",
    ...formatLines(input.validationCommands ?? [], "No validation commands provided."),
    "",
    "Output Requirements:",
    "- Modify only files required by the approved plan.",
    "- Do not implement excluded integrations or custom AI editing engines.",
    "- Report changed files and validation results.",
    "- Stop and report blockers if the approved plan cannot be followed."
  ].join("\n");
}

function formatRepository(project: CodingRunInput["project"]): string {
  if (project.repoOwner && project.repoName) {
    return `${project.repoOwner}/${project.repoName}`;
  }

  return project.repoUrl ?? "Unknown";
}

function formatText(value: string): string {
  const trimmedValue = value.trim();

  return trimmedValue || "No content provided.";
}

function formatLines(values: string[], emptyLabel: string): string[] {
  if (values.length === 0) {
    return [emptyLabel];
  }

  return values.map((value) => `- ${value}`);
}
