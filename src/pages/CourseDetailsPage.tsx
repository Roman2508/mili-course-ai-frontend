import { ArrowRight, BookOpenCheck, Layers3, PlayCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CourseModuleTimeline } from '@/features/courses/components/course-module-timeline';
import { useCourseQuery } from '@/features/courses/hooks/use-course';
import { getFirstIncompleteLesson, getFirstLesson, getLessonHref } from '@/features/learning/lib/course-progress';
import { useStartCourseMutation } from '@/features/learning/hooks/use-learning-actions';
import { useMyLearningQuery } from '@/features/learning/hooks/use-my-learning';

export default function CourseDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseQuery = useCourseQuery(id);
  const myLearningQuery = useMyLearningQuery();
  const startCourseMutation = useStartCourseMutation(id ?? '');

  if (courseQuery.isPending || myLearningQuery.isPending) {
    return <LoadingState title="Завантажуємо курс" description="Підтягуємо структуру курсу і прогрес користувача." />;
  }

  if (courseQuery.isError || myLearningQuery.isError || !courseQuery.data) {
    return <ErrorState onRetry={() => void Promise.all([courseQuery.refetch(), myLearningQuery.refetch()])} />;
  }

  const course = courseQuery.data;
  const learningEntry = myLearningQuery.data?.courses.find((item) => item.courseId === course.id);
  const nextLesson = getFirstIncompleteLesson(course, learningEntry) ?? getFirstLesson(course);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Деталі курсу"
        title={course.title}
        description={course.description}
        actions={
          <Button
            onClick={async () => {
              await startCourseMutation.mutateAsync();

              if (nextLesson) {
                navigate(getLessonHref(course.id, nextLesson.module.id, nextLesson.lesson.id));
              }
            }}
            disabled={startCourseMutation.isPending || !nextLesson}
          >
            <PlayCircle className="size-4" />
            {learningEntry?.status === 'not_started' || !learningEntry ? 'Розпочати курс' : 'Продовжити курс'}
          </Button>
        }
        meta={
          <div className="flex flex-wrap gap-2">
            <Badge tone="field">
              {course.difficulty === 'beginner'
                ? 'Початковий'
                : course.difficulty === 'intermediate'
                  ? 'Середній'
                  : 'Просунутий'}
            </Badge>
            {course.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          <img src={course.coverImage} alt={course.title} className="h-[360px] w-full object-cover" />
        </Card>

        <Card className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-ink px-4 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Модулі</p>
              <p className="mt-3 text-3xl font-semibold">{course.modules.length}</p>
            </div>
            <div className="rounded-3xl bg-field/10 px-4 py-5">
              <p className="text-xs uppercase tracking-[0.16em] text-field">Години</p>
              <p className="mt-3 text-3xl font-semibold text-field">{course.estimatedHours}</p>
            </div>
            <div className="rounded-3xl bg-brass/10 px-4 py-5">
              <p className="text-xs uppercase tracking-[0.16em] text-brass">Статус</p>
              <p className="mt-3 text-lg font-semibold text-brass">
                {learningEntry?.status === 'in_progress'
                  ? 'У процесі'
                  : learningEntry?.status === 'completed'
                    ? 'Завершено'
                    : 'Не розпочато'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-ink">
              <BookOpenCheck className="size-5" />
              <h2 className="text-lg font-semibold">Навчальний прогрес</h2>
            </div>
            <ProgressBar value={learningEntry?.progressPercent ?? 0} />
          </div>

          <div className="rounded-[28px] bg-ink/5 p-5">
            <div className="mb-3 flex items-center gap-3">
              <Layers3 className="size-5 text-field" />
              <p className="text-lg font-semibold text-ink">Що всередині</p>
            </div>
            <ul className="space-y-2 text-sm">
              {course.modules.map((courseModule) => (
                <li key={courseModule.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <span className="font-medium text-ink">{courseModule.title}</span>
                  <span className="text-slate">{courseModule.lessons.length} уроків + тест</span>
                </li>
              ))}
            </ul>
          </div>

          {nextLesson ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(getLessonHref(course.id, nextLesson.module.id, nextLesson.lesson.id))}
            >
              До активного уроку
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
        </Card>
      </div>

      <CourseModuleTimeline course={course} learningEntry={learningEntry} />
    </div>
  );
}
