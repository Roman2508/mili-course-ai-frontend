export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonContentType = 'text' | 'video';

export interface CourseLesson {
  id: string;
  title: string;
  summary: string;
  contentType: LessonContentType;
  durationMinutes: number;
  videoUrl?: string;
  contentBlocks: string[];
}

export interface CourseTestQuestion {
  id: string;
  prompt: string;
  topic: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CourseModuleTest {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: CourseTestQuestion[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  test: CourseModuleTest;
}

export interface GeneratedEmbedding {
  model: string;
  vector: number[];
  dimension: number;
  generatedAt: string;
}

export interface Course {
  id: string;
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
