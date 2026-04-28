import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { AdminUserEditorForm } from '@/features/admin/components/admin-user-editor-form';
import {
  useAdminUser,
  useUpdateAdminUser,
} from '@/features/admin/hooks/use-admin-users';

export default function AdminUserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userQuery = useAdminUser(id);
  const updateUserMutation = useUpdateAdminUser(id ?? '');

  if (!id) {
    return <ErrorState />;
  }

  if (userQuery.isPending) {
    return (
      <LoadingState
        title="Завантажуємо профіль користувача"
        description="Готуємо форму, щоб адміністратор міг оновити основні дані."
      />
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return <ErrorState onRetry={() => void userQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Адміністрування"
        title="Редагування користувача"
        description="Оновіть базову інформацію про користувача."
        actions={
          <Button variant="ghost" asChild>
            <Link className="inline-flex items-center gap-2" to="/admin/users">
              <ArrowLeft className="size-4" />
              До таблиці користувачів
            </Link>
          </Button>
        }
      />

      <AdminUserEditorForm
        initialValues={userQuery.data}
        submitLabel="Зберегти зміни"
        isSubmitting={updateUserMutation.isPending}
        error={(updateUserMutation.error as Error | null) ?? null}
        onSubmit={async (values) => {
          await updateUserMutation.mutateAsync(values);
          navigate('/admin/users');
        }}
      />
    </div>
  );
}
