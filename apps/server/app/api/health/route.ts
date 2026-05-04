import { apiSuccess } from "../../../src/lib/api-response";

export const dynamic = "force-dynamic";

export function GET() {
  return apiSuccess({
    status: "ok",
    service: "dabeehive-orchestrator",
    checkedAt: new Date().toISOString()
  });
}
