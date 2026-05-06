import { createHash } from "node:crypto";

export const DEFAULT_API_TOKEN_ABUSE_LIMIT = 120;
export const DEFAULT_API_TOKEN_ABUSE_WINDOW_MS = 60_000;

export type BasicAbuseGuardOptions = {
  readonly limit?: number;
  readonly now?: Date;
  readonly windowMs?: number;
};

export type BasicAbuseGuardDecision = {
  readonly allowed: boolean;
  readonly key: string;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: string;
  readonly retryAfterSeconds?: number;
};

type BasicAbuseGuardEntry = {
  count: number;
  resetAtMs: number;
};

const globalForAbuseGuard = globalThis as typeof globalThis & {
  dabeehiveApiTokenAbuseGuard?: Map<string, BasicAbuseGuardEntry>;
};

const abuseGuardStore =
  globalForAbuseGuard.dabeehiveApiTokenAbuseGuard ??
  new Map<string, BasicAbuseGuardEntry>();

if (!globalForAbuseGuard.dabeehiveApiTokenAbuseGuard) {
  globalForAbuseGuard.dabeehiveApiTokenAbuseGuard = abuseGuardStore;
}

export function checkBasicAbuseGuard(
  key: string,
  options: BasicAbuseGuardOptions = {}
): BasicAbuseGuardDecision {
  const nowMs = options.now?.getTime() ?? Date.now();
  const limit = Math.max(1, Math.floor(options.limit ?? DEFAULT_API_TOKEN_ABUSE_LIMIT));
  const windowMs = Math.max(1, Math.floor(options.windowMs ?? DEFAULT_API_TOKEN_ABUSE_WINDOW_MS));
  const existingEntry = abuseGuardStore.get(key);
  const entry =
    existingEntry && existingEntry.resetAtMs > nowMs
      ? existingEntry
      : {
          count: 0,
          resetAtMs: nowMs + windowMs
        };

  abuseGuardStore.set(key, entry);
  pruneExpiredEntries(nowMs);

  if (entry.count >= limit) {
    return {
      allowed: false,
      key,
      limit,
      remaining: 0,
      resetAt: new Date(entry.resetAtMs).toISOString(),
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAtMs - nowMs) / 1000))
    };
  }

  entry.count += 1;

  return {
    allowed: true,
    key,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: new Date(entry.resetAtMs).toISOString()
  };
}

export function buildApiTokenAbuseGuardKey(
  request: Request,
  bearerToken?: string | null
): string {
  const token = bearerToken?.trim() || parseBearerTokenFromRequest(request);
  const tokenKey = token ? `token:${hashTokenForGuardKey(token)}` : "missing-token";

  return `api-token:${getClientAddress(request)}:${tokenKey}`;
}

export function createBasicAbuseGuardHeaders(
  decision: BasicAbuseGuardDecision
): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": decision.resetAt
  };

  if (!decision.allowed && decision.retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(decision.retryAfterSeconds);
  }

  return headers;
}

function parseBearerTokenFromRequest(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(?<token>.+)$/i);
  const token = match?.groups?.token.trim();

  return token || null;
}

function getClientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return (
    forwardedFor ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function hashTokenForGuardKey(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 32);
}

function pruneExpiredEntries(nowMs: number): void {
  for (const [key, entry] of abuseGuardStore.entries()) {
    if (entry.resetAtMs <= nowMs) {
      abuseGuardStore.delete(key);
    }
  }
}
