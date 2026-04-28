import type { Course } from '@/types/course';
import { apiClient, parsePaginationHeaders } from '@/api/apiClient';
import type {
  AdminCoursePayload,
  AdminUserPayload,
  AdminUserResponse,
  AdminUsersResponse,
  CourseFilters,
  PaginatedResponse,
} from '@/api/contracts';

function toCourseQueryParams(filters: CourseFilters = {}) {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search?.trim() || undefined,
    difficulty: filters.difficulty,
    tags: filters.tags && filters.tags.length > 0 ? filters.tags.join(',') : undefined,
  };
}

export async function getAdminCourses(filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> {
  const response = await apiClient.get<Course[]>('/admin/courses', {
    params: toCourseQueryParams(filters),
  });

  return {
    items: response.data,
    meta: parsePaginationHeaders(response.headers),
  };
}

export async function getAdminCourse(courseId: string) {
  const response = await apiClient.get<Course>(`/admin/courses/${courseId}`);
  return response.data;
}

export async function createCourse(payload: AdminCoursePayload) {
  const response = await apiClient.post<Course>('/admin/courses', payload);
  return response.data;
}

export async function updateCourse(courseId: string, payload: AdminCoursePayload) {
  const response = await apiClient.patch<Course>(`/admin/courses/${courseId}`, payload);
  return response.data;
}

export async function getAdminUsers() {
  const response = await apiClient.get<AdminUsersResponse>('/admin/users');
  return response.data;
}

export async function getAdminUser(userId: string) {
  const response = await apiClient.get<AdminUserResponse>(`/admin/users/${userId}`);
  return response.data;
}

export async function updateAdminUser(userId: string, payload: AdminUserPayload) {
  const response = await apiClient.patch<AdminUserResponse>(`/admin/users/${userId}`, payload);
  return response.data;
}
