import { PageHeader } from "@/components/layout/page-header";
import { ErrorState, LoadingState } from "@/components/ui/page-state";
import { AdminCourseTable } from "@/features/admin/components/admin-course-table";
import { useAdminCoursesQuery } from "@/features/admin/hooks/use-admin-courses";

export default function AdminCoursesPage() {
  const adminCoursesQuery = useAdminCoursesQuery();

  if (adminCoursesQuery.isPending) {
    return (
      <LoadingState
        title="Завантажуємо адмін-панель"
        description="Отримуємо список курсів для редагування."
      />
    );
  }

  if (adminCoursesQuery.isError || !adminCoursesQuery.data) {
    return <ErrorState onRetry={() => void adminCoursesQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Адміністрування"
        title="Керування курсами"
        description="Інтерфейс для створення, редагування та видалення навчальних курсів."
      />
      <AdminCourseTable courses={adminCoursesQuery.data.items} />
    </div>
  );
}
