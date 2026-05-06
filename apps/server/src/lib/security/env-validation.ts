import { z } from "zod";

export const REQUIRED_SERVER_ENV_KEYS = ["DATABASE_URL"] as const;

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required."
    })
    .trim()
    .min(1, "DATABASE_URL is required.")
    .refine(isPlaceholderFree, {
      message: "DATABASE_URL must not contain placeholder markers such as <...>."
    })
    .refine(isPostgresUrl, {
      message: "DATABASE_URL must use postgresql:// or postgres://."
    })
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateServerEnv(
  input: NodeJS.ProcessEnv = process.env
): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error(formatServerEnvValidationError(result.error));
  }

  return result.data;
}

export function formatServerEnvValidationError(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `- ${formatIssuePath(issue.path)}: ${issue.message}`)
    .join("\n");

  return [
    "Invalid server environment configuration.",
    issues,
    "Set required server env values in .env.local or the process environment before starting the server."
  ].join("\n");
}

function isPlaceholderFree(value: string): boolean {
  return !/[<>]/.test(value);
}

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "postgresql:" || url.protocol === "postgres:";
  } catch {
    return false;
  }
}

function formatIssuePath(path: Array<string | number>): string {
  if (path.length === 0) {
    return "$";
  }

  return path.map(String).join(".");
}
