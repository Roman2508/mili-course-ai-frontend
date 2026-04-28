import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/page-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LearningOverviewPanel } from '@/features/learning/components/learning-overview-panel';
import { useCoursesQuery } from '@/features/courses/hooks/use-courses';
import { useMyLearningQuery } from '@/features/learning/hooks/use-my-learning';

export default function MyLearningPage() {
  const coursesQuery = useCoursesQuery();
  const myLearningQuery = useMyLearningQuery();

  if (coursesQuery.isPending || myLearningQuery.isPending) {
    return <LoadingState title="Завантажуємо кабінет" description="Підтягуємо прогрес, слабкі теми й активні курси." />;
  }

  if (coursesQuery.isError || myLearningQuery.isError || !myLearningQuery.data) {
    return <ErrorState onRetry={() => void Promise.all([coursesQuery.refetch(), myLearningQuery.refetch()])} />;
  }

  const mappedCourses = myLearningQuery.data.courses
    .map((learningEntry) => ({
      learningEntry,
      course: coursesQuery.data?.items.find((course) => course.id === learningEntry.courseId),
    }))
    .filter((item) => Boolean(item.course));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Кабінет користувача"
        title="Моє навчання"
        description="Прогрес по курсах, профіль навчальних інтересів і теми, які варто посилити."
      />

      <LearningOverviewPanel learning={myLearningQuery.data} />

      {mappedCourses.length === 0 ? (
        <EmptyState
          title="Навчання ще не почалося"
          description="Після старту першого курсу тут з'явиться прогрес по уроках і тестах."
          action={
            <Button asChild>
              <Link className="inline-flex items-center" to="/courses">
                До каталогу
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {mappedCourses.map(({ course, learningEntry }) =>
            course ? (
              <Card key={course.id} className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="field">{learningEntry.status}</Badge>
                      <Badge>
                        {course.difficulty === 'beginner'
                          ? 'Початковий'
                          : course.difficulty === 'intermediate'
                            ? 'Середній'
                            : 'Просунутий'}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">{course.title}</h3>
                    <p className="mt-2 text-sm">{course.shortDescription}</p>
                  </div>
                  <Button variant="ghost" asChild>
                    <Link to={`/courses/${course.id}`}>Відкрити</Link>
                  </Button>
                </div>

                <ProgressBar value={learningEntry.progressPercent} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-ink/5 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">Завершено уроків</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{learningEntry.completedLessonIds.length}</p>
                  </div>
                  <div className="rounded-2xl bg-field/5 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-field">Складено тестів</p>
                    <p className="mt-2 text-2xl font-semibold text-field">{learningEntry.testResults.length}</p>
                  </div>
                </div>
              </Card>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
