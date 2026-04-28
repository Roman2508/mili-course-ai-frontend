import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  changeEmail,
  changePassword,
} from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import {
  getMyProfile,
  updateMyProfile,
} from '@/api/users.api';
import { pushToast } from '@/lib/toast-store';
import type { AuthSession } from '@/types/auth';

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: getMyProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(queryKeys.users.me, profile);
      queryClient.setQueryData(
        queryKeys.auth.session,
        (current: AuthSession | null | undefined) =>
          current
            ? {
                ...current,
                name: profile.name,
                email: profile.email,
                role: profile.role,
              }
            : current,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.session,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.learning.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.recommendations.all,
        }),
      ]);

      pushToast({
        title: 'Профіль оновлено',
        description:
          'Зміни збережено. Контекст навчання та рекомендацій буде оновлено автоматично.',
        tone: 'success',
      });
    },
  });
}

export function useChangeEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeEmail,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.session,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.me,
        }),
      ]);

      pushToast({
        title: 'Email оновлено',
        description:
          result.message ??
          'Нова адреса збережена в акаунті.',
        tone: 'success',
      });
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session,
      });

      pushToast({
        title: 'Пароль оновлено',
        description:
          'Новий пароль збережено. Використовуйте його для наступних входів.',
        tone: 'success',
      });
    },
  });
}
