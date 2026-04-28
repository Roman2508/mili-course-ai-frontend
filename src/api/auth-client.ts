import { createAuthClient } from 'better-auth/react';
import { betterAuthBasePath, getApiBaseUrl } from '@/api/config';

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  basePath: betterAuthBasePath,
  fetchOptions: {
    credentials: 'include',
  },
});
