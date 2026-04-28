import { AxiosError } from 'axios';

interface ApiErrorPayload {
  message?: string | string[];
  details?: unknown;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractMessage(payload: ApiErrorPayload | undefined) {
  if (!payload) {
    return undefined;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }

  if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
    return payload.error;
  }

  return undefined;
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    const message =
      extractMessage(payload) ??
      error.message ??
      'Не вдалося виконати HTTP-запит до backend API.';

    return new ApiError(message, error.response?.status, payload?.details);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Сталася невідома помилка.');
}

export function getErrorMessage(error: unknown) {
  return normalizeApiError(error).message;
}

export function isUnauthorizedError(error: unknown) {
  return normalizeApiError(error).status === 401;
}
