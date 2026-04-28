const FALLBACK_API_URL = 'http://localhost:4000';
const PRODUCTION_PROXY_API_BASE_URL = '/api';

export const betterAuthBasePath = '/auth/api';

export function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return FALLBACK_API_URL;
  }

  return PRODUCTION_PROXY_API_BASE_URL;
}
