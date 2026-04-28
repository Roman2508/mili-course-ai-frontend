import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { ErrorState, LoadingState } from '@/components/ui/page-state'
import { CourseEditorForm } from '@/features/admin/components/course-editor-form'
import { useAdminCourse, useCreateCourse, useUpdateCourse } from '@/features/admin/hooks/use-admin-courses'
import { useGenerateEmbeddingMutation } from '@/features/admin/hooks/use-generate-embedding'
import { courseToFormValues } from '@/features/admin/lib/course-form'
import { dismissToast, pushToast } from '@/lib/toast-store'
import type { AdminCourseFormValues } from '@/types/admin'

async function withGeneratedEmbedding(
  values: AdminCourseFormValues,
  generateEmbedding: (text: string) => Promise<AdminCourseFormValues['generatedEmbedding']>,
) {
  if (!values.embeddingText.trim()) {
    return values
  }

  return {
    ...values,
    generatedEmbedding: await generateEmbedding(values.embeddingText),
  }
}

export default function AdminCourseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse(id ?? '')
  const courseQuery = useAdminCourse(id)
  const generateEmbeddingMutation = useGenerateEmbeddingMutation()

  if (isEditMode && courseQuery.isPending) {
    return <LoadingState title="Завантажуємо курс" description="Готуємо форму редагування курсу." />
  }

  if (isEditMode && (courseQuery.isError || !courseQuery.data)) {
    return <ErrorState onRetry={() => void courseQuery.refetch()} />
  }

  const initialValues = courseQuery.data ? courseToFormValues(courseQuery.data) : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Адміністрування"
        title={isEditMode ? 'Редагування курсу' : 'Створення курсу'}
        description="Редактор навчальних курсів, їх модулів та уроків."
      />

      <CourseEditorForm
        initialValues={initialValues}
        submitLabel={isEditMode ? 'Оновити курс' : 'Створити курс'}
        onSubmit={async (values) => {
          const savingToastId = pushToast({
            title: isEditMode ? 'Оновлюємо курс' : 'Створюємо курс',
            description: isEditMode
              ? 'Зберігаємо зміни та перевіряємо embedding.'
              : 'Зберігаємо курс і генеруємо embedding.',
            tone: 'loading',
            durationMs: 0,
          })

          try {
            const nextValues =
              isEditMode && initialValues && initialValues.embeddingText === values.embeddingText
                ? values
                : await withGeneratedEmbedding(values, generateEmbeddingMutation.mutateAsync)

            if (isEditMode && id) {
              await updateCourseMutation.mutateAsync(nextValues)
            } else {
              await createCourseMutation.mutateAsync(nextValues)
            }

            dismissToast(savingToastId)
            pushToast({
              title: isEditMode ? 'Курс оновлено' : 'Курс створено',
              description: isEditMode
                ? 'Зміни успішно збережено.'
                : 'Новий курс успішно створено.',
              tone: 'success',
            })
            navigate('/admin/courses')
          } catch (error) {
            dismissToast(savingToastId)
            throw error
          }
        }}
      />
    </div>
  )
}
