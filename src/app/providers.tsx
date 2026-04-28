import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/query-client';
import { ToastViewport } from '@/components/ui/toast-viewport';
import { AuthProvider } from '@/features/auth/hooks/use-auth';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastViewport />
      </AuthProvider>
    </QueryClientProvider>
  );
}
