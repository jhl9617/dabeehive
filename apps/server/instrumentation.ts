import { validateServerEnv } from "./src/lib/security/env-validation";

export function register(): void {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  validateServerEnv();
}
