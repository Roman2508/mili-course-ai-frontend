import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { useCourseQuery } from '@/features/courses/hooks/use-course';
import { ModuleTestForm } from '@/features/learning/components/module-test-form';
import {
  findModule,
  getFirstIncompleteLesson,
  getLessonHref,
  getModuleTestResult,
  isModuleTestUnlocked,
} from '@/features/learning/lib/course-progress';
import { useMyLearningQuery } from '@/features/learning/hooks/use-my-learning';
import { useSubmitModuleTestMutation } from '@/features/learning/hooks/use-learning-actions';

export default function CourseTestPage() {
  const { courseId, moduleId } = useParams();
  const courseQuery = useCourseQuery(courseId);
  const myLearningQuery = useMyLearningQuery();
  const submitTestMutation = useSubmitModuleTestMutation(courseId ?? '');

  if (courseQuery.isPending || myLearningQuery.isPending) {
    return <LoadingState title="Завантажуємо тест" description="Підтягуємо модуль, питання та попередні результати." />;
  }

  if (courseQuery.isError || myLearningQuery.isError || !courseQuery.data || !moduleId) {
    return <ErrorState onRetry={() => void Promise.all([courseQuery.refetch(), myLearningQuery.refetch()])} />;
  }

  const course = courseQuery.data;
  const learningEntry = myLearningQuery.data?.courses.find((item) => item.courseId === course.id);
  const courseModule = findModule(course, moduleId);

  if (!courseModule) {
    return <ErrorState title="Модуль не знайдено" description="Перевірте route params." />;
  }

  const existingResult = getModuleTestResult(learningEntry, courseModule.id);

  if (!isModuleTestUnlocked(courseModule, learningEntry) && !existingResult) {
    const fallback = getFirstIncompleteLesson(course, learningEntry);

    return fallback ? (
      <Navigate to={getLessonHref(course.id, fallback.module.id, fallback.lesson.id)} replace />
    ) : (
      <Navigate to={`/courses/${course.id}`} replace />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge tone="field">Assessment</Badge>
          <div>
            <h1 className="text-3xl font-semibold">{course.title}</h1>
            <p className="mt-2 text-sm">
              Модуль: <span className="font-semibold text-ink">{courseModule.title}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" asChild>
          <Link to={`/courses/${course.id}`}>Повернутися до курсу</Link>
        </Button>
      </Card>

      <ModuleTestForm
        courseModule={courseModule}
        existingResult={existingResult}
        isSubmitting={submitTestMutation.isPending}
        onSubmit={async (answers) => {
          await submitTestMutation.mutateAsync({
            moduleId: courseModule.id,
            answers,
          });
        }}
      />
    </div>
  );
}
