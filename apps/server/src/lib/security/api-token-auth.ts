import { apiError } from "../api-response";
import { getPrismaClient } from "../db/prisma";
import {
  type BasicAbuseGuardDecision,
  type BasicAbuseGuardOptions,
  buildApiTokenAbuseGuardKey,
  checkBasicAbuseGuard,
  createBasicAbuseGuardHeaders
} from "./basic-abuse-guard";
import {
  type BearerAuthContext,
  type BearerAuthenticatedRouteHandler,
  type BearerAuthFailureReason,
  type BearerAuthPrismaClient,
  withBearerAuth
} from "./bearer-auth";

export type ApiTokenAuthContext = BearerAuthContext;

export type ApiTokenAuthMiddlewareOptions = {
  abuseGuard?: BasicAbuseGuardOptions | false;
  getPrismaClient?: () => Promise<BearerAuthPrismaClient>;
  unauthorizedResponse?: (reason: BearerAuthFailureReason) => Response;
};

export function withApiTokenAuth<TContext = unknown>(
  handler: BearerAuthenticatedRouteHandler<TContext>,
  options: ApiTokenAuthMiddlewareOptions = {}
): (request: Request, context: TContext) => Promise<Response> {
  const authenticatedHandler = withBearerAuth(handler, {
    getPrismaClient: options.getPrismaClient ?? getBearerAuthPrismaClient,
    unauthorizedResponse:
      options.unauthorizedResponse ?? createApiTokenUnauthorizedResponse
  });

  return async (request, context) => {
    if (options.abuseGuard !== false) {
      const decision = checkBasicAbuseGuard(
        buildApiTokenAbuseGuardKey(request),
        options.abuseGuard
      );

      if (!decision.allowed) {
        return createApiTokenRateLimitedResponse(decision);
      }
    }

    return authenticatedHandler(request, context);
  };
}

export function createApiTokenUnauthorizedResponse(
  _reason: BearerAuthFailureReason
): Response {
  return apiError("UNAUTHORIZED", "Valid Bearer token is required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Bearer"
    }
  });
}

export function createApiTokenRateLimitedResponse(
  decision: BasicAbuseGuardDecision
): Response {
  return apiError("RATE_LIMITED", "Too many API token requests. Retry later.", {
    status: 429,
    headers: createBasicAbuseGuardHeaders(decision)
  });
}

async function getBearerAuthPrismaClient(): Promise<BearerAuthPrismaClient> {
  return (await getPrismaClient()) as unknown as BearerAuthPrismaClient;
}
