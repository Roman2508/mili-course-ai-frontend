import { useQuery } from '@tanstack/react-query';
import { getMyLearning } from '@/api/learning.api';
import { queryKeys } from '@/api/query-keys';

export function useMyLearning() {
  return useQuery({
    queryKey: queryKeys.learning.summary,
    queryFn: getMyLearning,
  });
}

export const useMyLearningQuery = useMyLearning;
  