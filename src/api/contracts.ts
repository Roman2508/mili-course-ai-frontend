import type {
  AdminCourseFormValues,
  AdminUserDetails,
  AdminUserSummary,
  AdminUserUpdateValues,
} from '@/types/admin';
import type { DifficultyLevel } from '@/types/course';
import type { ModuleTestResult, MyLearningData, UserLearningCourse } from '@/types/learning';
import type {
  UpdateProfileValues,
  UserProfile,
} from '@/types/profile';
import type { RecommendationsBaseData } from '@/types/recommendations';

export interface PaginationMeta {
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
}

export interface SubmitTestPayload {
  courseId: string;
  answers: Record<string, number>;
}

export interface SubmitTestResponse {
  result: ModuleTestResult;
  learningEntry: UserLearningCourse;
  passingScore: number;
}

export type MyLearningResponse = MyLearningData;
export type RecommendationsResponse = RecommendationsBaseData;
export type AdminCoursePayload = AdminCourseFormValues;
export type AdminUsersResponse = AdminUserSummary[];
export type AdminUserResponse = AdminUserDetails;
export type AdminUserPayload = AdminUserUpdateValues;
export type UserProfileResponse = UserProfile;
export type UpdateProfilePayload = UpdateProfileValues;
