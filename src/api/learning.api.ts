import { apiClient } from '@/api/apiClient';
import type { MyLearningResponse } from '@/api/contracts';
import type { UserLearningCourse } from '@/types/learning';

export async function getMyLearning() {
  const response = await apiClient.get<MyLearningResponse>('/learning');
  return response.data;
}

export async function startCourse(courseId: string) {
  const response = await apiClient.post<UserLearningCourse>(`/learning/courses/${courseId}/start`);
  return response.data;
}

export async function completeLesson(courseId: string, lessonId: string) {
  const response = await apiClient.post<UserLearningCourse>(`/lessons/${lessonId}/complete`, {
    courseId,
  });

  return response.data;
}
