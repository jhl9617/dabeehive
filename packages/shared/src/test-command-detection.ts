export type PackageManagerName = "pnpm" | "npm" | "yarn" | "bun";

export type ValidationCommandKind = "lint" | "typecheck" | "test" | "build";

export type PackageScripts = Readonly<Record<string, string>>;

export type ValidationCommandInferenceInput = {
  readonly packageManager?: PackageManagerName;
  readonly lockfiles?: readonly string[];
  readonly scripts?: PackageScripts;
  readonly packageFilter?: string;
  readonly kinds?: readonly ValidationCommandKind[];
  readonly includeFallbacks?: boolean;
};

export type InferredValidationCommand = {
  readonly kind: ValidationCommandKind;
  readonly command: string;
  readonly packageManager: PackageManagerName;
  readonly scriptName: string;
  readonly source: "package_script" | "fallback";
};

type PackageManagerLockfile = {
  readonly fileName: string;
  readonly packageManager: PackageManagerName;
};

type ValidationScriptCandidate = {
  readonly kind: ValidationCommandKind;
  readonly scriptNames: readonly string[];
  readonly includeMultiple?: boolean;
};

export const PACKAGE_MANAGER_LOCKFILES: readonly PackageManagerLockfile[] = [
  { fileName: "pnpm-lock.yaml", packageManager: "pnpm" },
  { fileName: "yarn.lock", packageManager: "yarn" },
  { fileName: "bun.lockb", packageManager: "bun" },
  { fileName: "bun.lock", packageManager: "bun" },
  { fileName: "package-lock.json", packageManager: "npm" }
];

export const DEFAULT_VALIDATION_COMMAND_KINDS: readonly ValidationCommandKind[] = [
  "lint",
  "typecheck",
  "test",
  "build"
];

export const VALIDATION_SCRIPT_CANDIDATES: readonly ValidationScriptCandidate[] = [
  { kind: "lint", scriptNames: ["lint", "format:check"] },
  {
    kind: "typecheck",
    scriptNames: ["typecheck", "type:check", "check:types", "tsc"]
  },
  {
    kind: "test",
    scriptNames: ["test", "test:unit", "test:api", "test:mcp", "smoke"],
    includeMultiple: true
  },
  { kind: "build", scriptNames: ["build"] }
];

export function detectPackageManagerFromLockfiles(
  lockfiles: readonly string[]
): PackageManagerName | undefined {
  const fileNames = new Set(lockfiles.map((lockfile) => getBaseName(lockfile)));

  return PACKAGE_MANAGER_LOCKFILES.find((candidate) =>
    fileNames.has(candidate.fileName)
  )?.packageManager;
}

export function inferValidationCommands(
  input: ValidationCommandInferenceInput
): InferredValidationCommand[] {
  const packageManager =
    input.packageManager ?? detectPackageManagerFromLockfiles(input.lockfiles ?? []);

  if (!packageManager) {
    return [];
  }

  const scripts = input.scripts ?? {};
  const selectedKinds = new Set(
    input.kinds ?? DEFAULT_VALIDATION_COMMAND_KINDS
  );
  const commands: InferredValidationCommand[] = [];

  for (const candidate of VALIDATION_SCRIPT_CANDIDATES) {
    if (!selectedKinds.has(candidate.kind)) {
      continue;
    }

    const scriptNames = findScriptNames(candidate, scripts);

    if (scriptNames.length === 0 && input.includeFallbacks === true) {
      const scriptName = candidate.scriptNames[0];
      commands.push({
        kind: candidate.kind,
        command: formatPackageScriptCommand(
          packageManager,
          scriptName,
          input.packageFilter
        ),
        packageManager,
        scriptName,
        source: "fallback"
      });
      continue;
    }

    scriptNames.forEach((scriptName) => {
      commands.push({
        kind: candidate.kind,
        command: formatPackageScriptCommand(
          packageManager,
          scriptName,
          input.packageFilter
        ),
        packageManager,
        scriptName,
        source: "package_script"
      });
    });
  }

  return commands;
}

export function formatPackageScriptCommand(
  packageManager: PackageManagerName,
  scriptName: string,
  packageFilter?: string
): string {
  if (packageManager === "pnpm") {
    return packageFilter
      ? `pnpm --filter ${packageFilter} run ${scriptName}`
      : `pnpm run ${scriptName}`;
  }

  if (packageManager === "npm") {
    return `npm run ${scriptName}`;
  }

  if (packageManager === "yarn") {
    return `yarn ${scriptName}`;
  }

  return `bun run ${scriptName}`;
}

function findScriptNames(
  candidate: ValidationScriptCandidate,
  scripts: PackageScripts
): string[] {
  const scriptNames = candidate.scriptNames.filter((scriptName) =>
    Object.prototype.hasOwnProperty.call(scripts, scriptName)
  );

  return candidate.includeMultiple ? scriptNames : scriptNames.slice(0, 1);
}

function getBaseName(path: string): string {
  return path.split(/[\\/]/).pop()?.toLowerCase() ?? path.toLowerCase();
}
