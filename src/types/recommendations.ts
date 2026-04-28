import type { Course } from '@/types/course';
import type { MyLearningData, UserLearningCourse, WeakTopic } from '@/types/learning';
import type { GeneratedEmbedding } from '@/types/course';

export interface CourseEmbeddingRecord {
  courseId: string;
  generatedEmbedding: GeneratedEmbedding | null;
}

export interface RecommendationsBaseData {
  courses: Course[];
  myLearning: UserLearningCourse[];
  weakTopics: WeakTopic[];
  interests: string[];
  profileSummary: MyLearningData['profileSummary'];
  courseEmbeddings: CourseEmbeddingRecord[];
  userProfileText: string;
}

export interface RecommendationResult {
  course: Course;
  similarityScore: number;
  rank: number;
  matchSummary: string;
}
