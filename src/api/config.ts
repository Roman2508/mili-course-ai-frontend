const FALLBACK_API_URL = 'http://localhost:4000';
const PRODUCTION_PROXY_API_BASE_URL = '/api';

export const betterAuthBasePath = '/auth/api';

function normalizeApiUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function isLocalAbsoluteUrl(value: string) {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '0.0.0.0'
    );
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    const normalizedApiUrl = normalizeApiUrl(configuredApiUrl);

    // Prevent production builds from accidentally baking in a local API URL.
    if (!import.meta.env.DEV && isLocalAbsoluteUrl(normalizedApiUrl)) {
      return PRODUCTION_PROXY_API_BASE_URL;
    }

    return normalizedApiUrl;
  }

  if (import.meta.env.DEV) {
    return FALLBACK_API_URL;
  }

  return PRODUCTION_PROXY_API_BASE_URL;
}
