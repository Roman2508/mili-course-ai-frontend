const FALLBACK_API_URL = 'http://localhost:4000';

export const betterAuthBasePath = '/auth/api';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? FALLBACK_API_URL).replace(/\/+$/, '');
}
