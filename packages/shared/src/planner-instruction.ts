import type { ContextDocument, Issue, Project } from "./domain";

export type PlannerInstructionProject = Pick<
  Project,
  "id" | "name" | "description" | "repoUrl" | "repoOwner" | "repoName"
>;

export type PlannerInstructionContextDocument = Pick<
  ContextDocument,
  "id" | "type" | "title" | "content" | "version"
>;

export type PlannerInstructionInput = {
  issue: Issue;
  project?: PlannerInstructionProject;
  contextDocuments?: PlannerInstructionContextDocument[];
  constraints?: string[];
};

export function buildPlannerInstruction(input: PlannerInstructionInput): string {
  const project = input.project;
  const constraints = input.constraints ?? [];

  return [
    "You are the planner for a local coding agent run.",
    "Create an implementation plan only. Do not modify files or run commands.",
    "",
    "Project:",
    `- ID: ${project?.id ?? input.issue.projectId}`,
    `- Name: ${project?.name ?? "Unknown"}`,
    `- Repository: ${formatRepository(project)}`,
    "",
    "Issue:",
    `- ID: ${input.issue.id}`,
    `- Title: ${input.issue.title}`,
    `- Type: ${input.issue.type}`,
    `- Status: ${input.issue.status}`,
    `- Priority: ${input.issue.priority}`,
    `- Assignee Role: ${input.issue.assigneeRole ?? "unassigned"}`,
    `- Labels: ${formatList(input.issue.labels)}`,
    "",
    "Issue Body:",
    formatText(input.issue.body),
    "",
    "Context Documents:",
    ...formatContextDocuments(input.contextDocuments ?? []),
    "",
    "Constraints:",
    ...formatConstraints(constraints),
    "",
    "Output Requirements:",
    "- Summarize the goal and relevant context.",
    "- List concrete implementation steps.",
    "- List validation commands or checks.",
    "- Call out risks, blockers, or approvals needed.",
    "- Keep the plan scoped to this issue."
  ].join("\n");
}

function formatRepository(project: PlannerInstructionProject | undefined): string {
  if (!project) {
    return "Unknown";
  }

  if (project.repoOwner && project.repoName) {
    return `${project.repoOwner}/${project.repoName}`;
  }

  return project.repoUrl ?? "Unknown";
}

function formatText(value: string | null | undefined): string {
  const trimmedValue = value?.trim();

  return trimmedValue || "No content provided.";
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function formatContextDocuments(
  documents: PlannerInstructionContextDocument[]
): string[] {
  if (documents.length === 0) {
    return ["No context documents provided."];
  }

  return documents.flatMap((document, index) => [
    `${index + 1}. ${document.title} (${document.type}, v${document.version})`,
    formatText(document.content)
  ]);
}

function formatConstraints(constraints: string[]): string[] {
  if (constraints.length === 0) {
    return ["No additional constraints provided."];
  }

  return constraints.map((constraint) => `- ${constraint}`);
}
