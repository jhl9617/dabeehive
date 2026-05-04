import { verifyApiToken } from "./api-token";

export const bearerAuthTokenSelect = {
  id: true,
  userId: true,
  tokenHash: true,
  expiresAt: true
};

export type BearerAuthTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date | null;
};

export type BearerAuthTokenFindManyArgs = {
  where: {
    OR: [
      {
        expiresAt: null;
      },
      {
        expiresAt: {
          gt: Date;
        };
      }
    ];
  };
  select: typeof bearerAuthTokenSelect;
};

export type BearerAuthPrismaClient = {
  apiToken: {
    findMany: (
      args: BearerAuthTokenFindManyArgs
    ) => Promise<BearerAuthTokenRecord[]>;
  };
};

export type BearerAuthContext = {
  tokenId: string;
  userId: string;
  scopes: string[];
  expiresAt: string | null;
};

export type BearerAuthFailureReason = "missing" | "invalid";

export type BearerAuthResult =
  | {
      authenticated: true;
      auth: BearerAuthContext;
    }
  | {
      authenticated: false;
      reason: BearerAuthFailureReason;
    };

export type BearerAuthenticatedRouteHandler<TContext = unknown> = (
  request: Request,
  context: TContext,
  auth: BearerAuthContext
) => Response | Promise<Response>;

export type BearerAuthMiddlewareOptions = {
  getPrismaClient: () => Promise<BearerAuthPrismaClient>;
  unauthorizedResponse?: (reason: BearerAuthFailureReason) => Response;
};

export function parseBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(?<token>.+)$/i);
  const token = match?.groups?.token.trim();

  return token || null;
}

export async function authenticateRequestBearerToken(
  prisma: BearerAuthPrismaClient,
  request: Request,
  now = new Date()
): Promise<BearerAuthResult> {
  const token = parseBearerToken(request);

  if (!token) {
    return {
      authenticated: false,
      reason: "missing"
    };
  }

  return authenticateBearerToken(prisma, token, now);
}

export async function authenticateBearerToken(
  prisma: BearerAuthPrismaClient,
  token: string,
  now = new Date()
): Promise<BearerAuthResult> {
  if (!token) {
    return {
      authenticated: false,
      reason: "missing"
    };
  }

  const candidates = await prisma.apiToken.findMany({
    where: {
      OR: [
        {
          expiresAt: null
        },
        {
          expiresAt: {
            gt: now
          }
        }
      ]
    },
    select: bearerAuthTokenSelect
  });

  for (const candidate of candidates) {
    if (await verifyApiToken(token, candidate.tokenHash)) {
      return {
        authenticated: true,
        auth: {
          tokenId: candidate.id,
          userId: candidate.userId,
          scopes: [],
          expiresAt: candidate.expiresAt?.toISOString() ?? null
        }
      };
    }
  }

  return {
    authenticated: false,
    reason: "invalid"
  };
}

export function withBearerAuth<TContext = unknown>(
  handler: BearerAuthenticatedRouteHandler<TContext>,
  options: BearerAuthMiddlewareOptions
): (request: Request, context: TContext) => Promise<Response> {
  return async (request, context) => {
    const prisma = await options.getPrismaClient();
    const result = await authenticateRequestBearerToken(prisma, request);

    if (!result.authenticated) {
      return (options.unauthorizedResponse ?? createBearerUnauthorizedResponse)(
        result.reason
      );
    }

    return handler(request, context, result.auth);
  };
}

export function createBearerUnauthorizedResponse(
  _reason: BearerAuthFailureReason
): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "UNAUTHORIZED",
        message: "Valid Bearer token is required."
      }
    }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        "www-authenticate": "Bearer"
      }
    }
  );
}
