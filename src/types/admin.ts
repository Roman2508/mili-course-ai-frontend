import type { AuthRole } from '@/types/auth';
import type {
  CourseModule,
  DifficultyLevel,
  GeneratedEmbedding,
} from '@/types/course';

export interface AdminCourseFormValues {
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  difficulty: DifficultyLevel;
  coverImage: string;
  estimatedHours: number;
  modules: CourseModule[];
  embeddingText: string;
  generatedEmbedding: GeneratedEmbedding | null;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: AuthRole;
  interests: string[];
  profileSummary: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminUserDetails = AdminUserSummary;

export interface AdminUserUpdateValues {
  name: string;
  email: string;
  role: AuthRole;
  interests: string[];
  profileSummary: string;
  password?: string;
}
