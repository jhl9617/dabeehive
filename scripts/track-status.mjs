#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const allowedStatuses = [
  "not_started",
  "planned",
  "in_progress",
  "blocked",
  "implemented",
  "verified",
  "skipped"
];

const usage = `Usage:
  pnpm track:status -- --task <TASK-ID> --status <status> [--dry-run]
  node scripts/track-status.mjs --task <TASK-ID> --status <status> [--file track/MASTER.md] [--dry-run]

Options:
  --task, -t       Task ID such as TRK-006 or API-001.
  --status, -s     One of: ${allowedStatuses.join(", ")}.
  --file, -f       MASTER file to update. Defaults to track/MASTER.md.
  --dry-run        Print the planned change without writing.
  --help, -h       Show this help.

This helper only updates track/MASTER.md. Task files, CURRENT.md, logs,
evidence, and CHANGELOG.md still need explicit updates.`;

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(usage);
  process.exit(0);
}

validateArgs(args);

const masterPath = path.resolve(process.cwd(), args.file);
const currentContent = await readFile(masterPath, "utf8");
const { nextContent, previousStatus, counts, totalTasks } = updateTaskStatus(
  currentContent,
  args.task,
  args.status
);

if (args.dryRun) {
  console.log(formatResult("dry-run", args, previousStatus, counts, totalTasks));
  process.exit(0);
}

await writeFile(masterPath, nextContent, "utf8");
console.log(formatResult("updated", args, previousStatus, counts, totalTasks));

function parseArgs(argv) {
  const parsed = {
    dryRun: false,
    file: "track/MASTER.md",
    help: false,
    status: "",
    task: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      parsed.help = true;
      continue;
    }

    if (value === "--") {
      continue;
    }

    if (value === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (value === "--task" || value === "-t") {
      parsed.task = readValue(argv, index, value);
      index += 1;
      continue;
    }

    if (value === "--status" || value === "-s") {
      parsed.status = readValue(argv, index, value);
      index += 1;
      continue;
    }

    if (value === "--file" || value === "-f") {
      parsed.file = readValue(argv, index, value);
      index += 1;
      continue;
    }

    fail(`Unknown option: ${value}`);
  }

  return parsed;
}

function readValue(argv, index, option) {
  const value = argv[index + 1];

  if (!value || value.startsWith("-")) {
    fail(`Missing value for ${option}`);
  }

  return value;
}

function validateArgs(parsed) {
  if (!/^[A-Z]+-\d{3}$/.test(parsed.task)) {
    fail("A valid --task value is required, for example TRK-006.");
  }

  if (!allowedStatuses.includes(parsed.status)) {
    fail(`A valid --status value is required. Allowed: ${allowedStatuses.join(", ")}`);
  }
}

function updateTaskStatus(content, taskId, nextStatus) {
  const lines = content.split("\n");
  const taskPattern = new RegExp(
    `^(\\|\\s*${escapeRegExp(taskId)}\\s*\\|\\s*)(${allowedStatuses.join("|")})(\\s*\\|.*)$`
  );
  let previousStatus = "";
  let found = false;

  const nextLines = lines.map((line) => {
    const match = taskPattern.exec(line);

    if (!match) {
      return line;
    }

    previousStatus = match[2];
    found = true;
    return `${match[1]}${nextStatus}${match[3]}`;
  });

  if (!found) {
    fail(`Task ${taskId} was not found in ${args.file}.`);
  }

  const withTaskStatus = nextLines.join("\n");
  const counts = countStatuses(withTaskStatus);

  if (nextStatus === "in_progress" && counts.in_progress > 1) {
    fail("Refusing to create multiple in_progress tasks in MASTER.md.");
  }

  return {
    counts,
    nextContent: updateSummaryCounts(withTaskStatus, counts),
    previousStatus,
    totalTasks: Object.values(counts).reduce((sum, count) => sum + count, 0)
  };
}

function countStatuses(content) {
  const counts = Object.fromEntries(allowedStatuses.map((status) => [status, 0]));
  const rowPattern = new RegExp(
    `^\\|\\s*[A-Z]+-\\d{3}\\s*\\|\\s*(${allowedStatuses.join("|")})\\s*\\|`,
    "gm"
  );
  let match = rowPattern.exec(content);

  while (match) {
    counts[match[1]] += 1;
    match = rowPattern.exec(content);
  }

  return counts;
}

function updateSummaryCounts(content, counts) {
  const withTotal = content.replace(
    /^(\|\s*전체 작업 수\s*\|\s*)\d+(\s*\|)$/m,
    (_, prefix, suffix) => `${prefix}${Object.values(counts).reduce((sum, count) => sum + count, 0)}${suffix}`
  );

  return withTotal.replace(
    /^(\|\s*(not_started|planned|in_progress|blocked|implemented|verified|skipped)\s*\|\s*)\d+(\s*\|)$/gm,
    (_, prefix, status, suffix) => `${prefix}${counts[status]}${suffix}`
  );
}

function formatResult(mode, parsed, previousStatus, counts, totalTasks) {
  const summary = allowedStatuses
    .map((status) => `${status}=${counts[status]}`)
    .join(", ");

  return [
    `${mode}: ${parsed.task} ${previousStatus} -> ${parsed.status}`,
    `file: ${parsed.file}`,
    `total=${totalTasks}; ${summary}`
  ].join("\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fail(message) {
  console.error(message);
  console.error("");
  console.error(usage);
  process.exit(1);
}
