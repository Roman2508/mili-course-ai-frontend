import { apiClient } from '@/api/apiClient';
import type { RecommendationsResponse } from '@/api/contracts';

export async function getRecommendations() {
  const response = await apiClient.get<RecommendationsResponse>('/recommendations');
  return response.data;
}
