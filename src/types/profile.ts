import type { AuthRole } from '@/types/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  interests: string[];
  profileSummary: string;
}

export interface UpdateProfileValues {
  name: string;
  interests: string[];
  profileSummary: string;
}
