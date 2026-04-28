import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api/auth.api';
import { getErrorMessage } from '@/api/api-error';
import { queryKeys } from '@/api/query-keys';
import { pushToast } from '@/lib/toast-store';
import type { AuthCredentials } from '@/types/auth';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AuthCredentials) => login(values),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.session, session);
    },
    onError: (error) => {
      pushToast({
        title: 'Не вдалося виконати вхід',
        description: getErrorMessage(error),
        tone: 'error',
      });
    },
  });
}
