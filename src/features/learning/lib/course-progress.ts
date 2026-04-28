import type { Course, CourseLesson, CourseModule } from '@/types/course';
import type { ModuleTestResult, UserLearningCourse } from '@/types/learning';

export function getLearningEntry(
  learningCourses: UserLearningCourse[] | undefined,
  courseId: string,
): UserLearningCourse | undefined {
  return learningCourses?.find((item) => item.courseId === courseId);
}

export function isLessonCompleted(learningEntry: UserLearningCourse | undefined, lessonId: string) {
  return Boolean(learningEntry?.completedLessonIds.includes(lessonId));
}

export function getModuleTestResult(
  learningEntry: UserLearningCourse | undefined,
  moduleId: string,
): ModuleTestResult | undefined {
  return learningEntry?.testResults.find((result) => result.moduleId === moduleId);
}

export function isModuleTestPassed(courseModule: CourseModule, learningEntry: UserLearningCourse | undefined) {
  const result = getModuleTestResult(learningEntry, courseModule.id);
  return Boolean(result && result.score >= courseModule.test.passingScore);
}

export function getAllLessons(course: Course) {
  return course.modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => ({
      module: courseModule,
      lesson,
    })),
  );
}

export function getPreviousLesson(course: Course, moduleId: string, lessonId: string) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((item) => item.module.id === moduleId && item.lesson.id === lessonId);

  if (index <= 0) {
    return undefined;
  }

  return lessons[index - 1];
}

export function getNextLesson(course: Course, moduleId: string, lessonId: string) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((item) => item.module.id === moduleId && item.lesson.id === lessonId);

  if (index === -1 || index >= lessons.length - 1) {
    return undefined;
  }

  return lessons[index + 1];
}

export function isLessonUnlocked(
  course: Course,
  learningEntry: UserLearningCourse | undefined,
  moduleId: string,
  lessonId: string,
) {
  const lessons = getAllLessons(course);
  const currentIndex = lessons.findIndex((item) => item.module.id === moduleId && item.lesson.id === lessonId);

  if (currentIndex <= 0) {
    return true;
  }

  const previousLesson = lessons[currentIndex - 1];
  return isLessonCompleted(learningEntry, previousLesson.lesson.id);
}

export function areAllModuleLessonsCompleted(courseModule: CourseModule, learningEntry: UserLearningCourse | undefined) {
  return courseModule.lessons.every((lesson) => isLessonCompleted(learningEntry, lesson.id));
}

export function isModuleTestUnlocked(courseModule: CourseModule, learningEntry: UserLearningCourse | undefined) {
  return areAllModuleLessonsCompleted(courseModule, learningEntry);
}

export function findModule(course: Course, moduleId: string) {
  return course.modules.find((item) => item.id === moduleId);
}

export function findLesson(courseModule: CourseModule, lessonId: string) {
  return courseModule.lessons.find((lesson) => lesson.id === lessonId);
}

export function getFirstLesson(course: Course): { module: CourseModule; lesson: CourseLesson } | undefined {
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];

  if (!firstModule || !firstLesson) {
    return undefined;
  }

  return {
    module: firstModule,
    lesson: firstLesson,
  };
}

export function getFirstIncompleteLesson(course: Course, learningEntry: UserLearningCourse | undefined) {
  return getAllLessons(course).find((item) => !isLessonCompleted(learningEntry, item.lesson.id));
}

export function getLessonHref(courseId: string, moduleId: string, lessonId: string) {
  return `/courses/${courseId}/learn/${moduleId}/${lessonId}`;
}

export function getTestHref(courseId: string, moduleId: string) {
  return `/courses/${courseId}/test/${moduleId}`;
}
