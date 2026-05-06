import {
  normalizeAllowedCodingAgentTools,
  type CodingAgentToolName
} from "./allowed-tools";
import type {
  CodingAgentDryRunReport,
  CodingAgentDryRunWarning,
  CodingRunInput
} from "./agent-sdk";

export type BuildCodingAgentDryRunReportOptions = {
  readonly allowedTools?: readonly CodingAgentToolName[];
  readonly now?: () => Date;
};

export function buildCodingAgentDryRunReport(
  input: CodingRunInput,
  options: BuildCodingAgentDryRunReportOptions = {}
): CodingAgentDryRunReport {
  const warnings = collectDryRunWarnings(input);
  const allowedTools = normalizeAllowedCodingAgentTools(
    options.allowedTools ?? input.allowedTools
  );

  return {
    mode: "dry_run",
    runId: input.runId,
    projectId: input.project.id,
    issueId: input.issue.id,
    workspacePath: input.workspace.path,
    systemInstructionPreview: previewText(input.systemInstruction),
    allowedTools,
    ready: warnings.length === 0,
    warnings,
    createdAt: (options.now?.() ?? new Date()).toISOString()
  };
}

function collectDryRunWarnings(
  input: CodingRunInput
): CodingAgentDryRunWarning[] {
  const warnings: CodingAgentDryRunWarning[] = [];

  if (!input.systemInstruction.trim()) {
    warnings.push({
      code: "empty_system_instruction",
      message: "System instruction is empty."
    });
  }

  if (!input.workspace.path.trim()) {
    warnings.push({
      code: "empty_workspace_path",
      message: "Workspace path is empty."
    });
  }

  if (!input.project.name.trim()) {
    warnings.push({
      code: "empty_project_name",
      message: "Project name is empty."
    });
  }

  if (!input.issue.title.trim()) {
    warnings.push({
      code: "empty_issue_title",
      message: "Issue title is empty."
    });
  }

  return warnings;
}

function previewText(value: string, maxLength = 240): string {
  const normalizedValue = value.trim().replace(/\s+/g, " ");

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 3)}...`;
}
