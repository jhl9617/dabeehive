import type { z } from "zod";

export const VALIDATION_ERROR_CODE = "VALIDATION_ERROR";

export type ValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export type ValidationErrorDetails = {
  issues: ValidationIssue[];
};

export type ValidationErrorPayload = {
  code: typeof VALIDATION_ERROR_CODE;
  message: string;
  details: ValidationErrorDetails;
};

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ValidationErrorPayload;
    };

export type ValidateInputOptions = {
  message?: string;
};

export function validateInput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  options: ValidateInputOptions = {}
): ValidationResult<z.infer<TSchema>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  return {
    success: false,
    error: {
      code: VALIDATION_ERROR_CODE,
      message: options.message ?? "Invalid request input.",
      details: {
        issues: formatZodIssues(result.error)
      }
    }
  };
}

export function formatZodIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: formatIssuePath(issue.path),
    code: issue.code,
    message: issue.message
  }));
}

function formatIssuePath(path: Array<string | number>): string {
  if (path.length === 0) {
    return "$";
  }

  return path.map(String).join(".");
}
