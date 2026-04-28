import type { Course } from '@/types/course';
import { apiClient, parsePaginationHeaders } from '@/api/apiClient';
import type { CourseFilters, PaginatedResponse } from '@/api/contracts';

function toCourseQueryParams(filters: CourseFilters = {}) {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search?.trim() || undefined,
    difficulty: filters.difficulty,
    tags: filters.tags && filters.tags.length > 0 ? filters.tags.join(',') : undefined,
  };
}

export async function getCourses(filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> {
  const response = await apiClient.get<Course[]>('/courses', {
    params: toCourseQueryParams(filters),
  });

  return {
    items: response.data,
    meta: parsePaginationHeaders(response.headers),
  };
}

export async function getCourse(courseId: string) {
  const response = await apiClient.get<Course>(`/courses/${courseId}`);
  return response.data;
}
