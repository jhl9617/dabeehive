export type TaskBranchInput = {
  taskId: string;
  title: string;
  prefix?: string;
  maxSlugLength?: number;
};

export type GitBranchCommandResult = {
  stdout: string;
  stderr?: string;
  exitCode: number;
};

export type GitBranchCommandRunner = (
  command: readonly string[],
  options: {
    cwd?: string;
  }
) => Promise<GitBranchCommandResult>;

export type CreateTaskBranchInput = TaskBranchInput & {
  runCommand: GitBranchCommandRunner;
  cwd?: string;
};

export async function createTaskBranch(
  input: CreateTaskBranchInput
): Promise<string> {
  const branchName = buildTaskBranchName(input);
  const result = await input.runCommand(["git", "switch", "-c", branchName], {
    cwd: input.cwd
  });

  if (result.exitCode !== 0) {
    throw new Error(formatGitBranchError(result, branchName));
  }

  return branchName;
}

export function buildTaskBranchName(input: TaskBranchInput): string {
  const prefix = normalizeBranchPrefix(input.prefix ?? "poc");
  const taskId = normalizeTaskId(input.taskId);
  const slug = slugifyTaskBranchTitle(
    input.title,
    input.maxSlugLength ?? 48
  );

  return `${prefix}/${taskId}-${slug}`;
}

export function slugifyTaskBranchTitle(
  value: string,
  maxLength = 48
): string {
  const safeMaxLength = Math.max(1, maxLength);
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = normalizedValue || "task";

  return slug.slice(0, safeMaxLength).replace(/-+$/g, "") || "task";
}

function normalizeTaskId(taskId: string): string {
  const normalizedTaskId = taskId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedTaskId) {
    throw new Error("Task branch name requires a task ID");
  }

  return normalizedTaskId;
}

function normalizeBranchPrefix(prefix: string): string {
  const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, "");

  return normalizedPrefix || "poc";
}

function formatGitBranchError(
  result: GitBranchCommandResult,
  branchName: string
): string {
  const detail = (result.stderr || result.stdout).trim();

  return detail
    ? `git switch failed for ${branchName} with exit code ${result.exitCode}: ${detail}`
    : `git switch failed for ${branchName} with exit code ${result.exitCode}`;
}
