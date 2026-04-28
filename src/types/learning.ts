export type LearningCourseStatus = 'not_started' | 'in_progress' | 'completed';

export interface WeakTopic {
  id: string;
  label: string;
  confidenceGap: number;
  relatedCourseIds: string[];
}

export interface ModuleTestResult {
  moduleId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  submittedAt: string;
  answers: Record<string, number>;
}

export interface UserLearningCourse {
  courseId: string;
  status: LearningCourseStatus;
  progressPercent: number;
  completedLessonIds: string[];
  testResults: ModuleTestResult[];
  startedAt?: string;
  completedAt?: string;
  lastLessonId?: string;
}

export interface MyLearningData {
  courses: UserLearningCourse[];
  weakTopics: WeakTopic[];
  interests: string[];
  profileSummary: string;
}
