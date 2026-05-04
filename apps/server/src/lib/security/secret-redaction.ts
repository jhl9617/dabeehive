export const REDACTED_SECRET = "[REDACTED]";
export const CIRCULAR_REFERENCE_REDACTION = "[Circular]";

export type SecretValuePattern = {
  name: string;
  pattern: RegExp;
  replacement: string;
};

export type SecretRedactionOptions = {
  redaction?: string;
  maxDepth?: number;
  sensitiveKeyPatterns?: RegExp[];
  valuePatterns?: SecretValuePattern[];
};

export const DEFAULT_SENSITIVE_KEY_PATTERNS = [
  /authorization/i,
  /api[-_]?key/i,
  /access[-_]?token/i,
  /refresh[-_]?token/i,
  /token/i,
  /secret/i,
  /password/i,
  /private[-_]?key/i,
  /cookie/i
];

export const DEFAULT_SECRET_VALUE_PATTERNS: SecretValuePattern[] = [
  {
    name: "bearer-token",
    pattern: /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
    replacement: `Bearer ${REDACTED_SECRET}`
  },
  {
    name: "assignment-secret",
    pattern:
      /\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|PRIVATE_KEY)[A-Z0-9_]*)\s*=\s*([^\s'"]+)/gi,
    replacement: `$1=${REDACTED_SECRET}`
  },
  {
    name: "url-credentials",
    pattern: /(\b[a-z][a-z0-9+.-]*:\/\/)([^:@/\s]+):([^@/\s]+)@/gi,
    replacement: `$1${REDACTED_SECRET}@`
  }
];

type NormalizedSecretRedactionOptions = Required<SecretRedactionOptions>;

export function redactSecretText(
  value: string,
  options: SecretRedactionOptions = {}
): string {
  const normalizedOptions = normalizeOptions(options);

  return normalizedOptions.valuePatterns.reduce(
    (redactedValue, secretPattern) =>
      redactedValue.replace(
        ensureGlobalPattern(secretPattern.pattern),
        normalizeReplacement(secretPattern.replacement, normalizedOptions)
      ),
    value
  );
}

export function redactSecrets(
  value: unknown,
  options: SecretRedactionOptions = {}
): unknown {
  return redactValue(value, normalizeOptions(options), 0, new WeakSet<object>());
}

function redactValue(
  value: unknown,
  options: NormalizedSecretRedactionOptions,
  depth: number,
  seen: WeakSet<object>
): unknown {
  if (typeof value === "string") {
    return redactSecretText(value, options);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (seen.has(value)) {
    return CIRCULAR_REFERENCE_REDACTION;
  }

  if (depth >= options.maxDepth) {
    return value;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, options, depth + 1, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      isSensitiveKey(key, options)
        ? options.redaction
        : redactValue(entryValue, options, depth + 1, seen)
    ])
  );
}

function isSensitiveKey(
  key: string,
  options: NormalizedSecretRedactionOptions
): boolean {
  return options.sensitiveKeyPatterns.some((pattern) => pattern.test(key));
}

function normalizeOptions(
  options: SecretRedactionOptions
): NormalizedSecretRedactionOptions {
  return {
    redaction: options.redaction ?? REDACTED_SECRET,
    maxDepth: options.maxDepth ?? 10,
    sensitiveKeyPatterns:
      options.sensitiveKeyPatterns ?? DEFAULT_SENSITIVE_KEY_PATTERNS,
    valuePatterns: options.valuePatterns ?? DEFAULT_SECRET_VALUE_PATTERNS
  };
}

function ensureGlobalPattern(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;

  return new RegExp(pattern.source, flags);
}

function normalizeReplacement(
  replacement: string,
  options: NormalizedSecretRedactionOptions
): string {
  return replacement.replaceAll(REDACTED_SECRET, options.redaction);
}
