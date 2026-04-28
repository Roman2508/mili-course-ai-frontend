import { createContext, useContext, type PropsWithChildren } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentSession, logout as logoutRequest } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import type { AuthSession } from '@/types/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReady: boolean;
  isLoggingOut: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getCurrentSession,
    retry: false,
  });
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.auth.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.courses.all });
      queryClient.removeQueries({ queryKey: queryKeys.learning.all });
      queryClient.removeQueries({ queryKey: queryKeys.recommendations.all });
      queryClient.removeQueries({ queryKey: queryKeys.admin.all });
      queryClient.removeQueries({ queryKey: queryKeys.users.all });
    },
  });
  const session = sessionQuery.data ?? null;
  const value: AuthContextValue = {
    session,
    isAuthenticated: Boolean(session),
    isAdmin: session?.role === 'admin',
    isReady: !sessionQuery.isPending,
    isLoggingOut: logoutMutation.isPending,
    error:
      (sessionQuery.error as Error | null) ??
      (logoutMutation.error as Error | null) ??
      null,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refetchSession: async () => {
      await sessionQuery.refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
}
