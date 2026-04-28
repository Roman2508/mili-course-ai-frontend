import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeLesson, startCourse } from '@/api/learning.api';
import { queryKeys } from '@/api/query-keys';
import { submitTest } from '@/api/tests.api';

function invalidateLearningData(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.learning.summary }),
    queryClient.invalidateQueries({ queryKey: queryKeys.learning.course(courseId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.context }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all }),
  ]);
}

export function useStartCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startCourse(courseId),
    onSuccess: async () => {
      await invalidateLearningData(queryClient, courseId);
    },
  });
}

export function useCompleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => completeLesson(courseId, lessonId),
    onSuccess: async () => {
      await invalidateLearningData(queryClient, courseId);
    },
  });
}

export function useSubmitTest(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      answers,
    }: {
      moduleId: string;
      answers: Record<string, number>;
    }) =>
      submitTest(moduleId, {
        courseId,
        answers,
      }),
    onSuccess: async () => {
      await invalidateLearningData(queryClient, courseId);
    },
  });
}

export const useStartCourseMutation = useStartCourse;
export const useMarkLessonCompletedMutation = useCompleteLesson;
export const useSubmitModuleTestMutation = useSubmitTest;
