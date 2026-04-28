import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '@/api/recommendations.api';
import { queryKeys } from '@/api/query-keys';

export function useRecommendationsBaseData() {
  return useQuery({
    queryKey: queryKeys.recommendations.context,
    queryFn: getRecommendations,
  });
}

export const useRecommendationsBaseDataQuery = useRecommendationsBaseData;
