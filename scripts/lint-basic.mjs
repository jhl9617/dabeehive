import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".pnpm",
  "coverage",
  "dist",
  "node_modules"
]);
const checkedExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".scss",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);
const checkedFileNames = new Set([".editorconfig"]);
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (entry.isFile() && shouldCheck(entry.name)) {
      await checkFile(fullPath);
    }
  }
}

function shouldCheck(fileName) {
  return (
    checkedFileNames.has(fileName) ||
    checkedExtensions.has(path.extname(fileName))
  );
}

async function checkFile(filePath) {
  const relativePath = path.relative(root, filePath);
  const content = await readFile(filePath, "utf8");

  if (content.includes("\r\n")) {
    errors.push(`${relativePath}: uses CRLF line endings`);
  }

  if (!content.endsWith("\n")) {
    errors.push(`${relativePath}: missing final newline`);
  }

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (line.endsWith(" ") || line.endsWith("\t")) {
      errors.push(`${relativePath}:${lineNumber}: trailing whitespace`);
    }

    if (line.includes("\t")) {
      errors.push(`${relativePath}:${lineNumber}: tab character`);
    }
  });

  if (path.extname(filePath) === ".json") {
    try {
      JSON.parse(content);
    } catch (error) {
      errors.push(`${relativePath}: invalid JSON (${error.message})`);
    }
  }
}

await walk(root);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("basic lint passed");
