import { useQuery } from '@tanstack/react-query';
import { getCourse } from '@/api/courses.api';
import { queryKeys } from '@/api/query-keys';

export function useCourse(courseId?: string) {
  return useQuery({
    queryKey: courseId
      ? queryKeys.courses.detail(courseId)
      : ['courses', 'detail', 'missing'],
    queryFn: () => getCourse(courseId ?? ''),
    enabled: Boolean(courseId),
  });
}

export const useCourseQuery = useCourse;
