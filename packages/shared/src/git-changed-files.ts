export type ChangedFileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | "untracked"
  | "unknown";

export type ChangedFile = {
  path: string;
  previousPath?: string;
  status: ChangedFileStatus;
  indexStatus: string;
  worktreeStatus: string;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  raw: string;
};

export type ChangedFilesCommandResult = {
  stdout: string;
  stderr?: string;
  exitCode: number;
};

export type ChangedFilesCommandRunner = (
  command: readonly string[],
  options: {
    cwd?: string;
  }
) => Promise<ChangedFilesCommandResult>;

export type GetChangedFilesOptions = {
  cwd?: string;
  includeUntracked?: boolean;
};

export async function getChangedFiles(
  runCommand: ChangedFilesCommandRunner,
  options: GetChangedFilesOptions = {}
): Promise<ChangedFile[]> {
  const command = [
    "git",
    "status",
    "--porcelain=v1",
    options.includeUntracked === false
      ? "--untracked-files=no"
      : "--untracked-files=all"
  ];
  const result = await runCommand(command, { cwd: options.cwd });

  if (result.exitCode !== 0) {
    throw new Error(formatChangedFilesError(result));
  }

  return parseChangedFiles(result.stdout);
}

export function parseChangedFiles(output: string): ChangedFile[] {
  return output
    .split(/\r?\n/)
    .filter((line) => line.length > 0 && !line.startsWith("## "))
    .map(parseChangedFileLine)
    .filter((file) => file.path.length > 0);
}

function parseChangedFileLine(line: string): ChangedFile {
  const indexStatus = line[0] ?? " ";
  const worktreeStatus = line[1] ?? " ";
  const rawPath = line.slice(3).trim();
  const renamed = indexStatus === "R" || worktreeStatus === "R";
  const copied = indexStatus === "C" || worktreeStatus === "C";
  const pathParts = renamed || copied ? parseMovedPath(rawPath) : { path: rawPath };
  const untracked = indexStatus === "?" && worktreeStatus === "?";

  return {
    path: pathParts.path,
    previousPath: pathParts.previousPath,
    status: inferChangedFileStatus(indexStatus, worktreeStatus),
    indexStatus,
    worktreeStatus,
    staged: indexStatus !== " " && indexStatus !== "?",
    unstaged: worktreeStatus !== " " && worktreeStatus !== "?",
    untracked,
    raw: line
  };
}

function parseMovedPath(rawPath: string): Pick<ChangedFile, "path" | "previousPath"> {
  const marker = " -> ";
  const markerIndex = rawPath.lastIndexOf(marker);

  if (markerIndex === -1) {
    return { path: rawPath };
  }

  return {
    previousPath: rawPath.slice(0, markerIndex).trim(),
    path: rawPath.slice(markerIndex + marker.length).trim()
  };
}

function inferChangedFileStatus(
  indexStatus: string,
  worktreeStatus: string
): ChangedFileStatus {
  if (indexStatus === "?" && worktreeStatus === "?") {
    return "untracked";
  }

  if (indexStatus === "R" || worktreeStatus === "R") {
    return "renamed";
  }

  if (indexStatus === "C" || worktreeStatus === "C") {
    return "copied";
  }

  if (indexStatus === "D" || worktreeStatus === "D") {
    return "deleted";
  }

  if (indexStatus === "A" || worktreeStatus === "A") {
    return "added";
  }

  if (indexStatus === "M" || worktreeStatus === "M") {
    return "modified";
  }

  return "unknown";
}

function formatChangedFilesError(result: ChangedFilesCommandResult): string {
  const detail = (result.stderr || result.stdout).trim();

  return detail
    ? `git changed files detection failed with exit code ${result.exitCode}: ${detail}`
    : `git changed files detection failed with exit code ${result.exitCode}`;
}
