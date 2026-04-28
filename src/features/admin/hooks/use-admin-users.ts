import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminUser,
  getAdminUsers,
  updateAdminUser,
} from '@/api/admin.api';
import type { AdminUserPayload } from '@/api/contracts';
import { queryKeys } from '@/api/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { pushToast } from '@/lib/toast-store';

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: getAdminUsers,
  });
}

export function useAdminUser(userId?: string) {
  return useQuery({
    queryKey: userId
      ? queryKeys.admin.user(userId)
      : ['admin', 'user', 'missing'],
    queryFn: () => getAdminUser(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useUpdateAdminUser(userId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: (values: AdminUserPayload) => updateAdminUser(userId, values),
    onSuccess: async (user) => {
      queryClient.setQueryData(queryKeys.admin.user(userId), user);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session }),
        session?.id === userId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.learning.all,
            })
          : Promise.resolve(),
        session?.id === userId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.recommendations.all,
            })
          : Promise.resolve(),
      ]);

      pushToast({
        title: 'Користувача оновлено',
        description:
          'Зміни в профілі, ролі, пошті та паролі збережено.',
        tone: 'success',
      });
    },
  });
}

export const useAdminUsersQuery = useAdminUsers;
