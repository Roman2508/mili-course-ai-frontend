import { createAuthClient } from 'better-auth/react';
import { betterAuthBasePath, getApiBaseUrl } from '@/api/config';

const apiBaseUrl = getApiBaseUrl();
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(apiBaseUrl);

export const authClient = createAuthClient({
  ...(isAbsoluteApiBaseUrl
    ? {
        baseURL: apiBaseUrl,
        basePath: betterAuthBasePath,
      }
    : {
        basePath: `${apiBaseUrl}${betterAuthBasePath}`,
      }),
  fetchOptions: {
    credentials: 'include',
  },
});
