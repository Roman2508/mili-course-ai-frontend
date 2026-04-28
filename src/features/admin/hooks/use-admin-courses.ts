import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  getAdminCourse,
  getAdminCourses,
  updateCourse,
} from '@/api/admin.api';
import type { AdminCoursePayload, CourseFilters } from '@/api/contracts';
import { queryKeys } from '@/api/query-keys';

export function useAdminCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.courses(filters),
    queryFn: () => getAdminCourses(filters),
  });
}

export function useAdminCourse(courseId?: string) {
  return useQuery({
    queryKey: courseId
      ? queryKeys.admin.course(courseId)
      : ['admin', 'course', 'missing'],
    queryFn: () => getAdminCourse(courseId ?? ''),
    enabled: Boolean(courseId),
  });
}

async function invalidateAdminData(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.context }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all }),
    courseId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.courses.detail(courseId),
        })
      : Promise.resolve(),
    courseId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.admin.course(courseId),
        })
      : Promise.resolve(),
  ]);
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AdminCoursePayload) => createCourse(values),
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AdminCoursePayload) => updateCourse(courseId, values),
    onSuccess: async () => {
      await invalidateAdminData(queryClient, courseId);
    },
  });
}

export const useAdminCoursesQuery = useAdminCourses;
export const useCreateCourseMutation = useCreateCourse;
export const useUpdateCourseMutation = useUpdateCourse;
