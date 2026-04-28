import axios from 'axios';
import type { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError } from '@/api/api-error';
import { getApiBaseUrl } from '@/api/config';
import { pushToast } from '@/lib/toast-store';

declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    metadata?: {
      suppressErrorToast?: boolean;
    };
  }

  interface InternalAxiosRequestConfig<D = any> {
    metadata?: {
      suppressErrorToast?: boolean;
    };
  }
}

function normalizeHeaderValue(
  headers: AxiosHeaders | Record<string, unknown>,
  key: string,
) {
  const source = headers as Record<string, unknown>;
  const value = source[key] ?? source[key.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parsePaginationHeaders(
  headers: AxiosHeaders | Record<string, unknown>,
) {
  const total = Number(normalizeHeaderValue(headers, 'x-total-count') ?? 0);
  const page =
    Number(normalizeHeaderValue(headers, 'x-page') ?? 0) || undefined;
  const limit =
    Number(normalizeHeaderValue(headers, 'x-limit') ?? 0) || undefined;

  return {
    total,
    page,
    limit,
    totalPages:
      page !== undefined && limit !== undefined && limit > 0
        ? Math.ceil(total / limit)
        : undefined,
  };
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 20_000,
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = config as InternalAxiosRequestConfig;

  nextConfig.headers.set('Accept', 'application/json');

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error);
    const shouldNotify = !error.config?.metadata?.suppressErrorToast;

    if (shouldNotify) {
      pushToast({
        title: 'Помилка запиту',
        description: normalizedError.message,
        tone: 'error',
      });
    }

    return Promise.reject(normalizedError);
  },
);
