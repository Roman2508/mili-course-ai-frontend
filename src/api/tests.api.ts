import { apiClient } from '@/api/apiClient';
import type { SubmitTestPayload, SubmitTestResponse } from '@/api/contracts';

export async function submitTest(testId: string, payload: SubmitTestPayload) {
  const response = await apiClient.post<SubmitTestResponse>(`/tests/${testId}/submit`, payload);
  return response.data;
}
