import { Navigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/ui/page-state';
import { LessonContent } from '@/features/learning/components/lesson-content';
import {
  findLesson,
  findModule,
  getFirstIncompleteLesson,
  getFirstLesson,
  getLessonHref,
  getNextLesson,
  getPreviousLesson,
  getTestHref,
  isLessonCompleted,
  isLessonUnlocked,
  isModuleTestUnlocked,
} from '@/features/learning/lib/course-progress';
import { useMarkLessonCompletedMutation } from '@/features/learning/hooks/use-learning-actions';
import { useMyLearningQuery } from '@/features/learning/hooks/use-my-learning';
import { useCourseQuery } from '@/features/courses/hooks/use-course';

export default function LearningLessonPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const courseQuery = useCourseQuery(courseId);
  const myLearningQuery = useMyLearningQuery();
  const markLessonCompletedMutation = useMarkLessonCompletedMutation(courseId ?? '');

  if (courseQuery.isPending || myLearningQuery.isPending) {
    return <LoadingState title="Завантажуємо урок" description="Готуємо контент уроку і перевіряємо стан розблокування." />;
  }

  if (courseQuery.isError || myLearningQuery.isError || !courseQuery.data || !moduleId || !lessonId) {
    return <ErrorState onRetry={() => void Promise.all([courseQuery.refetch(), myLearningQuery.refetch()])} />;
  }

  const course = courseQuery.data;
  const learningEntry = myLearningQuery.data?.courses.find((item) => item.courseId === course.id);
  const courseModule = findModule(course, moduleId);
  const lesson = courseModule ? findLesson(courseModule, lessonId) : undefined;

  if (!courseModule || !lesson) {
    return <ErrorState title="Урок не знайдено" description="Перевірте маршрут або структуру курсу." />;
  }

  if (!isLessonUnlocked(course, learningEntry, moduleId, lessonId)) {
    const fallback = getFirstIncompleteLesson(course, learningEntry) ?? getFirstLesson(course);

    return fallback ? (
      <Navigate to={getLessonHref(course.id, fallback.module.id, fallback.lesson.id)} replace />
    ) : (
      <Navigate to={`/courses/${course.id}`} replace />
    );
  }

  const previousLesson = getPreviousLesson(course, moduleId, lessonId);
  const nextLesson = getNextLesson(course, moduleId, lessonId);
  const completed = isLessonCompleted(learningEntry, lesson.id);
  const previousHref = previousLesson
    ? getLessonHref(course.id, previousLesson.module.id, previousLesson.lesson.id)
    : undefined;
  const nextHref = nextLesson
    ? getLessonHref(course.id, nextLesson.module.id, nextLesson.lesson.id)
    : completed && isModuleTestUnlocked(courseModule, learningEntry)
      ? getTestHref(course.id, courseModule.id)
      : undefined;

  return (
    <LessonContent
      lesson={lesson}
      previousHref={previousHref}
      nextHref={nextHref}
      isCompleted={completed}
      isSaving={markLessonCompletedMutation.isPending}
      onMarkCompleted={() => {
        void markLessonCompletedMutation.mutateAsync(lesson.id);
      }}
    />
  );
}
