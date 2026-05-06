import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const extensionRoot = join(repoRoot, "apps/vscode-extension");
const packageJsonPath = join(extensionRoot, "package.json");
const extensionEntryPath = join(extensionRoot, "src/extension.ts");
const sourceRoot = join(extensionRoot, "src");
const sensitiveNamePattern =
  /\b(api[-_ ]?token|access[-_ ]?token|refresh[-_ ]?token|provider[-_ ]?key|api[-_ ]?key|secret|password|credential)\b/i;
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function listTsFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listTsFiles(path);
    }

    return entry.endsWith(".ts") ? [path] : [];
  });
}

function findCallBlocks(source, marker, contextLength = 320) {
  const blocks = [];
  let index = source.indexOf(marker);

  while (index !== -1) {
    blocks.push(
      source.slice(
        Math.max(0, index - contextLength),
        Math.min(source.length, index + marker.length + contextLength)
      )
    );
    index = source.indexOf(marker, index + marker.length);
  }

  return blocks;
}

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}

function relativePath(path) {
  return relative(repoRoot, path);
}

const packageJson = readJson(packageJsonPath);
const contributedProperties =
  packageJson.contributes?.configuration?.properties ?? {};
const contributedPropertyNames = Object.keys(contributedProperties);

for (const [propertyName, propertyDefinition] of Object.entries(
  contributedProperties
)) {
  if (sensitiveNamePattern.test(propertyName)) {
    fail(
      `Sensitive configuration property is contributed in ${relativePath(
        packageJsonPath
      )}: ${propertyName}`
    );
  }

  if (
    typeof propertyDefinition.default === "string" &&
    sensitiveNamePattern.test(propertyDefinition.default)
  ) {
    fail(
      `Sensitive-looking default value is contributed in ${relativePath(
        packageJsonPath
      )}: ${propertyName}`
    );
  }
}

if (!contributedPropertyNames.includes("dabeehive.serverUrl")) {
  fail("Expected non-sensitive dabeehive.serverUrl configuration is missing.");
}

const extensionEntry = readText(extensionEntryPath);

if (!extensionEntry.includes('const API_TOKEN_SECRET_KEY = "dabeehive.apiToken"')) {
  fail("API_TOKEN_SECRET_KEY constant is missing from extension entry.");
}

for (const requiredSecretCall of [
  "context.secrets.get(API_TOKEN_SECRET_KEY)",
  "context.secrets.store(API_TOKEN_SECRET_KEY",
  "context.secrets.delete(API_TOKEN_SECRET_KEY)"
]) {
  if (!extensionEntry.includes(requiredSecretCall)) {
    fail(`Expected SecretStorage call is missing: ${requiredSecretCall}`);
  }
}

if (countOccurrences(extensionEntry, "context.secrets.delete(API_TOKEN_SECRET_KEY)") < 2) {
  fail("Expected SecretStorage delete calls for empty token and explicit clear command.");
}

for (const sourceFile of listTsFiles(sourceRoot)) {
  const source = readText(sourceFile);
  const path = relativePath(sourceFile);

  for (const block of findCallBlocks(source, ".getConfiguration(")) {
    if (
      sensitiveNamePattern.test(block) &&
      /\.get\s*\(|\.update\s*\(/.test(block)
    ) {
      fail(`Sensitive setting access detected near getConfiguration in ${path}.`);
    }
  }

  for (const storageMarker of [
    "globalState.update(",
    "workspaceState.update(",
    ".globalState.update(",
    ".workspaceState.update("
  ]) {
    for (const block of findCallBlocks(source, storageMarker)) {
      if (sensitiveNamePattern.test(block)) {
        fail(`Sensitive value persistence detected near ${storageMarker} in ${path}.`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Extension SecretStorage audit failed:");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exitCode = 1;
} else {
  console.log("Extension SecretStorage audit passed.");
  console.log(
    `Checked ${contributedPropertyNames.length} contributed setting(s) and ${listTsFiles(
      sourceRoot
    ).length} TypeScript source file(s).`
  );
}
