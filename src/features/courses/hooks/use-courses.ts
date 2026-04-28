import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCourses } from '@/api/courses.api';
import type { CourseFilters } from '@/api/contracts';
import { queryKeys } from '@/api/query-keys';

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => getCourses(filters),
    placeholderData: keepPreviousData,
  });
}

export const useCoursesQuery = useCourses;
