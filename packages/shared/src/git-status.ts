export type WorkspaceGitFileStatus = {
  path: string;
  indexStatus: string;
  worktreeStatus: string;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  raw: string;
};

export type WorkspaceGitStatus = {
  branchName: string | null;
  upstreamName: string | null;
  ahead: number;
  behind: number;
  dirty: boolean;
  files: WorkspaceGitFileStatus[];
  raw: string;
};

export type GitStatusCommandResult = {
  stdout: string;
  stderr?: string;
  exitCode: number;
};

export type GitStatusCommandRunner = (
  command: readonly string[],
  options: {
    cwd?: string;
  }
) => Promise<GitStatusCommandResult>;

export async function getWorkspaceGitStatus(
  runCommand: GitStatusCommandRunner,
  options: {
    cwd?: string;
  } = {}
): Promise<WorkspaceGitStatus> {
  const result = await runCommand(["git", "status", "--short", "--branch"], {
    cwd: options.cwd
  });

  if (result.exitCode !== 0) {
    throw new Error(formatGitStatusError(result));
  }

  return parseWorkspaceGitStatus(result.stdout);
}

export function parseWorkspaceGitStatus(output: string): WorkspaceGitStatus {
  const lines = output.split(/\r?\n/).filter((line) => line.length > 0);
  const branchLine = lines.find((line) => line.startsWith("## "));
  const fileLines = lines.filter((line) => !line.startsWith("## "));
  const branch = parseBranchLine(branchLine);
  const files = fileLines.map(parseFileLine);

  return {
    branchName: branch.branchName,
    upstreamName: branch.upstreamName,
    ahead: branch.ahead,
    behind: branch.behind,
    dirty: files.length > 0,
    files,
    raw: output
  };
}

function parseBranchLine(
  branchLine: string | undefined
): Pick<WorkspaceGitStatus, "branchName" | "upstreamName" | "ahead" | "behind"> {
  if (!branchLine) {
    return {
      branchName: null,
      upstreamName: null,
      ahead: 0,
      behind: 0
    };
  }

  const summary = branchLine.slice(3);
  const trackingMatch = summary.match(/\[(?<tracking>[^\]]+)\]$/);
  const tracking = trackingMatch?.groups?.tracking ?? "";
  const branchPart = summary.replace(/\s+\[[^\]]+\]$/, "");
  const [branchName, upstreamName] = branchPart.split("...");

  return {
    branchName: normalizeBranchName(branchName),
    upstreamName: upstreamName?.trim() || null,
    ahead: parseTrackingCount(tracking, "ahead"),
    behind: parseTrackingCount(tracking, "behind")
  };
}

function parseFileLine(line: string): WorkspaceGitFileStatus {
  const indexStatus = line[0] ?? " ";
  const worktreeStatus = line[1] ?? " ";
  const path = line.slice(3).trim();
  const untracked = indexStatus === "?" && worktreeStatus === "?";

  return {
    path,
    indexStatus,
    worktreeStatus,
    staged: indexStatus !== " " && indexStatus !== "?",
    unstaged: worktreeStatus !== " " && worktreeStatus !== "?",
    untracked,
    raw: line
  };
}

function normalizeBranchName(value: string | undefined): string | null {
  const normalizedValue = value?.trim();

  if (!normalizedValue || normalizedValue === "HEAD (no branch)") {
    return null;
  }

  return normalizedValue;
}

function parseTrackingCount(tracking: string, key: "ahead" | "behind"): number {
  const match = tracking.match(new RegExp(`${key} (?<count>\\d+)`));
  const value = match?.groups?.count;

  return value === undefined ? 0 : Number(value);
}

function formatGitStatusError(result: GitStatusCommandResult): string {
  const stderr = result.stderr?.trim();

  return stderr
    ? `git status failed with exit code ${result.exitCode}: ${stderr}`
    : `git status failed with exit code ${result.exitCode}`;
}
