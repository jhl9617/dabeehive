export type DiffSummaryFile = {
  path: string;
  insertions: number | null;
  deletions: number | null;
  binary: boolean;
  raw: string;
};

export type DiffSummary = {
  text: string;
  files: DiffSummaryFile[];
  totalFiles: number;
  totalInsertions: number;
  totalDeletions: number;
  binaryFiles: number;
  omittedFiles: number;
  raw: string;
};

export type DiffSummaryCommandResult = {
  stdout: string;
  stderr?: string;
  exitCode: number;
};

export type DiffSummaryCommandRunner = (
  command: readonly string[],
  options: {
    cwd?: string;
  }
) => Promise<DiffSummaryCommandResult>;

export type BuildDiffSummaryOptions = {
  title?: string;
  maxFiles?: number;
};

export type GetDiffSummaryOptions = BuildDiffSummaryOptions & {
  cwd?: string;
  staged?: boolean;
};

export async function getDiffSummary(
  runCommand: DiffSummaryCommandRunner,
  options: GetDiffSummaryOptions = {}
): Promise<DiffSummary> {
  const command = options.staged
    ? ["git", "diff", "--cached", "--numstat"]
    : ["git", "diff", "--numstat"];
  const result = await runCommand(command, { cwd: options.cwd });

  if (result.exitCode !== 0) {
    throw new Error(formatDiffSummaryError(result));
  }

  return buildDiffSummary(parseDiffNumstat(result.stdout), {
    title: options.title,
    maxFiles: options.maxFiles
  });
}

export function parseDiffNumstat(output: string): DiffSummaryFile[] {
  return output
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map(parseDiffNumstatLine)
    .filter((file) => file.path.length > 0);
}

export function buildDiffSummary(
  files: DiffSummaryFile[],
  options: BuildDiffSummaryOptions = {}
): DiffSummary {
  const totals = calculateDiffTotals(files);
  const maxFiles = Math.max(0, options.maxFiles ?? 12);
  const visibleFiles = files.slice(0, maxFiles);
  const omittedFiles = Math.max(0, files.length - visibleFiles.length);
  const text = buildHumanReadableDiffSummary(files, options);

  return {
    text,
    files,
    totalFiles: files.length,
    totalInsertions: totals.totalInsertions,
    totalDeletions: totals.totalDeletions,
    binaryFiles: totals.binaryFiles,
    omittedFiles,
    raw: files.map((file) => file.raw).join("\n")
  };
}

export function buildHumanReadableDiffSummary(
  files: DiffSummaryFile[],
  options: BuildDiffSummaryOptions = {}
): string {
  if (files.length === 0) {
    return options.title
      ? `${options.title}: no tracked diff changes`
      : "No tracked diff changes.";
  }

  const totals = calculateDiffTotals(files);
  const maxFiles = Math.max(0, options.maxFiles ?? 12);
  const visibleFiles = files.slice(0, maxFiles);
  const omittedFiles = Math.max(0, files.length - visibleFiles.length);
  const lines = [
    buildSummaryHeader(files.length, totals, options.title),
    ...visibleFiles.map(formatDiffSummaryFile)
  ];

  if (omittedFiles > 0) {
    lines.push(`- ${omittedFiles} more ${pluralize("file", omittedFiles)} omitted`);
  }

  return lines.join("\n");
}

function parseDiffNumstatLine(line: string): DiffSummaryFile {
  const [insertionsRaw = "0", deletionsRaw = "0", ...pathParts] =
    line.split("\t");
  const binary = insertionsRaw === "-" || deletionsRaw === "-";

  return {
    path: pathParts.join("\t").trim(),
    insertions: binary ? null : parseNumstatNumber(insertionsRaw),
    deletions: binary ? null : parseNumstatNumber(deletionsRaw),
    binary,
    raw: line
  };
}

function calculateDiffTotals(files: DiffSummaryFile[]): Pick<
  DiffSummary,
  "totalInsertions" | "totalDeletions" | "binaryFiles"
> {
  return files.reduce(
    (totals, file) => ({
      totalInsertions: totals.totalInsertions + (file.insertions ?? 0),
      totalDeletions: totals.totalDeletions + (file.deletions ?? 0),
      binaryFiles: totals.binaryFiles + (file.binary ? 1 : 0)
    }),
    {
      totalInsertions: 0,
      totalDeletions: 0,
      binaryFiles: 0
    }
  );
}

function buildSummaryHeader(
  totalFiles: number,
  totals: Pick<DiffSummary, "totalInsertions" | "totalDeletions" | "binaryFiles">,
  title: string | undefined
): string {
  const binaryText =
    totals.binaryFiles > 0
      ? `, ${totals.binaryFiles} binary ${pluralize("file", totals.binaryFiles)}`
      : "";
  const summary = `${totalFiles} ${pluralize("file", totalFiles)} changed (+${totals.totalInsertions}/-${totals.totalDeletions}${binaryText})`;

  return title ? `${title}: ${summary}` : summary;
}

function formatDiffSummaryFile(file: DiffSummaryFile): string {
  if (file.binary) {
    return `- ${file.path}: binary change`;
  }

  return `- ${file.path}: +${file.insertions ?? 0}/-${file.deletions ?? 0}`;
}

function parseNumstatNumber(value: string): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function formatDiffSummaryError(result: DiffSummaryCommandResult): string {
  const detail = (result.stderr || result.stdout).trim();

  return detail
    ? `git diff summary failed with exit code ${result.exitCode}: ${detail}`
    : `git diff summary failed with exit code ${result.exitCode}`;
}
