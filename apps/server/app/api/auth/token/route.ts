import { apiSuccess } from "../../../../src/lib/api-response";
import {
  type ApiTokenAuthContext,
  withApiTokenAuth
} from "../../../../src/lib/security/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TokenContextResponse = {
  authenticated: true;
  tokenId: string;
  userId: string;
  scopes: string[];
  expiresAt: string | null;
};

export const GET = withApiTokenAuth((_request, _context, auth) => {
  return apiSuccess(serializeTokenContext(auth));
});

function serializeTokenContext(auth: ApiTokenAuthContext): TokenContextResponse {
  return {
    authenticated: true,
    tokenId: auth.tokenId,
    userId: auth.userId,
    scopes: auth.scopes,
    expiresAt: auth.expiresAt
  };
}
