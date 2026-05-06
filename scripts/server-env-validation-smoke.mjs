import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const serverRequire = createRequire(
  path.join(repoRoot, "apps/server/package.json")
);
const ts = serverRequire("typescript");
const moduleCache = new Map();
const { validateServerEnv } = loadTsModule(
  "apps/server/src/lib/security/env-validation.ts"
).exports;
const validDatabaseUrl = "postgresql://user:pass@localhost:5432/dabeehive";
const validEnv = validateServerEnv({
  DATABASE_URL: validDatabaseUrl
});

assertEqual(validEnv.DATABASE_URL, validDatabaseUrl, "valid DATABASE_URL");

for (const { env, label, messageIncludes, redactedValue } of [
  {
    env: {},
    label: "missing DATABASE_URL",
    messageIncludes: "DATABASE_URL is required."
  },
  {
    env: {
      DATABASE_URL: "postgresql://<db_user>:<db_password>@localhost:5432/dabeehive"
    },
    label: "placeholder DATABASE_URL",
    messageIncludes: "placeholder markers",
    redactedValue: "postgresql://<db_user>:<db_password>@localhost:5432/dabeehive"
  },
  {
    env: {
      DATABASE_URL: "mysql://user:pass@localhost:3306/dabeehive"
    },
    label: "non-postgres DATABASE_URL",
    messageIncludes: "postgresql:// or postgres://",
    redactedValue: "mysql://user:pass@localhost:3306/dabeehive"
  }
]) {
  assertThrowsEnvError({
    env,
    label,
    messageIncludes,
    redactedValue
  });
}

console.log(
  JSON.stringify(
    {
      checked: "server-env-validation",
      requiredKeys: ["DATABASE_URL"],
      invalidCases: [
        "missing DATABASE_URL",
        "placeholder DATABASE_URL",
        "non-postgres DATABASE_URL"
      ],
      errorValuesRedacted: true
    },
    null,
    2
  )
);

function assertThrowsEnvError({
  env,
  label,
  messageIncludes,
  redactedValue
}) {
  try {
    validateServerEnv(env);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes(messageIncludes)) {
      throw new Error(`${label}: expected message to include ${messageIncludes}`);
    }

    if (redactedValue && message.includes(redactedValue)) {
      throw new Error(`${label}: error message leaked env value`);
    }

    return;
  }

  throw new Error(`${label}: expected validation to throw`);
}

function loadTsModule(relativePath) {
  const absolutePath = path.resolve(repoRoot, relativePath);
  const cachedModule = moduleCache.get(absolutePath);

  if (cachedModule) {
    return cachedModule;
  }

  const source = readFileSync(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: absolutePath
  }).outputText;
  const module = {
    exports: {}
  };
  moduleCache.set(absolutePath, module);
  const localRequire = (specifier) => {
    if (specifier.startsWith(".")) {
      const resolvedPath = resolveRelativeTsModule(absolutePath, specifier);

      return loadTsModule(path.relative(repoRoot, resolvedPath)).exports;
    }

    return serverRequire(specifier);
  };
  const execute = new Function("require", "exports", "module", transpiled);
  execute(localRequire, module.exports, module);

  return module;
}

function resolveRelativeTsModule(fromPath, specifier) {
  const basePath = path.resolve(path.dirname(fromPath), specifier);
  const candidates = [basePath, `${basePath}.ts`, path.join(basePath, "index.ts")];
  const candidate = candidates.find((value) => {
    try {
      readFileSync(value);
      return true;
    } catch {
      return false;
    }
  });

  if (!candidate) {
    throw new Error(`Unable to resolve ${specifier} from ${fromPath}`);
  }

  return candidate;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}
