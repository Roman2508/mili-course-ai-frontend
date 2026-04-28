import { apiClient } from '@/api/apiClient';
import type {
  UpdateProfilePayload,
  UserProfileResponse,
} from '@/api/contracts';

export async function getMyProfile() {
  const response = await apiClient.get<UserProfileResponse>('/users/me');
  return response.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch<UserProfileResponse>(
    '/users/me',
    payload,
  );

  return response.data;
}
