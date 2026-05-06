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
const {
  buildApiTokenAbuseGuardKey,
  checkBasicAbuseGuard,
  createBasicAbuseGuardHeaders
} = loadTsModule("apps/server/src/lib/security/basic-abuse-guard.ts").exports;
const rawToken = "secret-api-token-value";
const request = new Request("http://127.0.0.1:3000/api/auth/token", {
  headers: {
    authorization: `Bearer ${rawToken}`,
    "x-forwarded-for": "203.0.113.10"
  }
});
const key = buildApiTokenAbuseGuardKey(request);

assertEqual(key.includes(rawToken), false, "guard key redacts raw token");
assertEqual(
  key,
  buildApiTokenAbuseGuardKey(request, rawToken),
  "guard key is stable"
);

const uniqueKey = `${key}:smoke:${Date.now()}`;
const first = checkBasicAbuseGuard(uniqueKey, {
  limit: 2,
  now: new Date("2026-05-06T06:00:00.000Z"),
  windowMs: 1000
});
const second = checkBasicAbuseGuard(uniqueKey, {
  limit: 2,
  now: new Date("2026-05-06T06:00:00.100Z"),
  windowMs: 1000
});
const third = checkBasicAbuseGuard(uniqueKey, {
  limit: 2,
  now: new Date("2026-05-06T06:00:00.200Z"),
  windowMs: 1000
});
const reset = checkBasicAbuseGuard(uniqueKey, {
  limit: 2,
  now: new Date("2026-05-06T06:00:01.100Z"),
  windowMs: 1000
});
const limitedHeaders = createBasicAbuseGuardHeaders(third);

assertEqual(first.allowed, true, "first request allowed");
assertEqual(first.remaining, 1, "first remaining");
assertEqual(second.allowed, true, "second request allowed");
assertEqual(second.remaining, 0, "second remaining");
assertEqual(third.allowed, false, "third request limited");
assertEqual(third.remaining, 0, "limited remaining");
assertEqual(limitedHeaders["Retry-After"], "1", "retry-after header");
assertEqual(reset.allowed, true, "request allowed after reset");

console.log(
  JSON.stringify(
    {
      checked: "api-token-abuse-guard",
      limit: third.limit,
      firstAllowed: first.allowed,
      secondAllowed: second.allowed,
      thirdAllowed: third.allowed,
      retryAfterSeconds: third.retryAfterSeconds,
      resetAllowed: reset.allowed,
      rawTokenRedacted: !key.includes(rawToken)
    },
    null,
    2
  )
);

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
