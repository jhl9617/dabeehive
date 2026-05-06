import { apiError } from "../api-response";
import { getPrismaClient } from "../db/prisma";
import {
  type BearerAuthContext,
  type BearerAuthenticatedRouteHandler,
  type BearerAuthFailureReason,
  type BearerAuthPrismaClient,
  withBearerAuth
} from "./bearer-auth";

export type ApiTokenAuthContext = BearerAuthContext;

export type ApiTokenAuthMiddlewareOptions = {
  getPrismaClient?: () => Promise<BearerAuthPrismaClient>;
  unauthorizedResponse?: (reason: BearerAuthFailureReason) => Response;
};

export function withApiTokenAuth<TContext = unknown>(
  handler: BearerAuthenticatedRouteHandler<TContext>,
  options: ApiTokenAuthMiddlewareOptions = {}
): (request: Request, context: TContext) => Promise<Response> {
  return withBearerAuth(handler, {
    getPrismaClient: options.getPrismaClient ?? getBearerAuthPrismaClient,
    unauthorizedResponse:
      options.unauthorizedResponse ?? createApiTokenUnauthorizedResponse
  });
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

async function getBearerAuthPrismaClient(): Promise<BearerAuthPrismaClient> {
  return (await getPrismaClient()) as unknown as BearerAuthPrismaClient;
}
