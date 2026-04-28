import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '@/api/auth.api';
import { getErrorMessage } from '@/api/api-error';
import { queryKeys } from '@/api/query-keys';
import { pushToast } from '@/lib/toast-store';
import type { RegisterValues } from '@/types/auth';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RegisterValues) => register(values),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session, session);
    },
    onError: (error) => {
      pushToast({
        title: 'Не вдалося створити акаунт',
        description: getErrorMessage(error),
        tone: 'error',
      });
    },
  });
}

