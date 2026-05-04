import { NextResponse } from "next/server";

export type ApiSuccessOptions = {
  status?: number;
  headers?: HeadersInit;
  meta?: Record<string, unknown>;
};

export type ApiErrorOptions = {
  status?: number;
  headers?: HeadersInit;
  details?: unknown;
};

export type ApiSuccessBody<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiSuccess<T>(
  data: T,
  options: ApiSuccessOptions = {}
): NextResponse<ApiSuccessBody<T>> {
  const { status = 200, headers, meta } = options;
  const body: ApiSuccessBody<T> =
    meta === undefined ? { data } : { data, meta };

  return NextResponse.json(body, { status, headers });
}

export function apiError(
  code: string,
  message: string,
  options: ApiErrorOptions = {}
): NextResponse<ApiErrorBody> {
  const { status = 500, headers, details } = options;
  const error =
    details === undefined
      ? { code, message }
      : { code, message, details };

  return NextResponse.json({ error }, { status, headers });
}
