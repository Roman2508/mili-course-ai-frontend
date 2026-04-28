import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { AdminUserTable } from '@/features/admin/components/admin-user-table';
import { useAdminUsersQuery } from '@/features/admin/hooks/use-admin-users';

export default function AdminUsersPage() {
  const adminUsersQuery = useAdminUsersQuery();

  if (adminUsersQuery.isPending) {
    return (
      <LoadingState
        title="Завантажуємо користувачів"
        description="Отримуємо список акаунтів для адміністрування."
      />
    );
  }

  if (adminUsersQuery.isError || !adminUsersQuery.data) {
    return <ErrorState onRetry={() => void adminUsersQuery.refetch()} />;
  }

  const adminCount = adminUsersQuery.data.filter(
    (user) => user.role === 'admin',
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Адміністрування"
        title="Керування користувачами"
        description="Переглядайте всі акаунти в таблиці та переходьте до окремої сторінки редагування для зміни профілю, ролі, пошти та пароля."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="field">{adminCount} адмінів</Badge>
            <Badge tone="neutral">
              {adminUsersQuery.data.length} всього користувачів
            </Badge>
          </div>
        }
      />

      <AdminUserTable users={adminUsersQuery.data} />
    </div>
  );
}
