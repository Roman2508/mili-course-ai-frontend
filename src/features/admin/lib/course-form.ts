import type { AdminCourseFormValues } from '@/types/admin';
import type { Course, CourseLesson, CourseModule, CourseModuleTest, CourseTestQuestion } from '@/types/course';

export function buildEmbeddingText(title: string, description: string) {
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();

  if (normalizedTitle && normalizedDescription) {
    return `${normalizedTitle}. ${normalizedDescription}`;
  }

  return normalizedTitle || normalizedDescription;
}

export function createEmptyQuestion(index = 1): CourseTestQuestion {
  return {
    id: `question-${crypto.randomUUID()}`,
    prompt: `Нове питання ${index}`,
    topic: 'загальні знання',
    options: ['Варіант A', 'Варіант B', 'Варіант C', 'Варіант D'],
    correctOptionIndex: 0,
    explanation: 'Коротке пояснення правильної відповіді.',
  };
}

export function createEmptyLesson(): CourseLesson {
  return {
    id: `lesson-${crypto.randomUUID()}`,
    title: 'Новий урок',
    summary: 'Короткий опис уроку.',
    contentType: 'text',
    durationMinutes: 10,
    contentBlocks: ['Вміст уроку.'],
  };
}

export function createEmptyTest(): CourseModuleTest {
  return {
    id: `test-${crypto.randomUUID()}`,
    title: 'Підсумковий тест модуля',
    description: 'Перевірка засвоєння матеріалу модуля.',
    passingScore: 70,
    questions: [createEmptyQuestion()],
  };
}

export function createEmptyModule(index = 1): CourseModule {
  return {
    id: `module-${crypto.randomUUID()}`,
    title: `Новий модуль ${index}`,
    description: 'Короткий опис модуля.',
    order: index,
    lessons: [createEmptyLesson()],
    test: createEmptyTest(),
  };
}

export function createEmptyCourseFormValues(): AdminCourseFormValues {
  return {
    title: '',
    description: '',
    shortDescription: '',
    tags: [],
    difficulty: 'beginner',
    coverImage: '',
    estimatedHours: 4,
    modules: [createEmptyModule()],
    embeddingText: buildEmbeddingText('', ''),
    generatedEmbedding: null,
  };
}

export function courseToFormValues(course: Course): AdminCourseFormValues {
  return {
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription,
    tags: course.tags,
    difficulty: course.difficulty,
    coverImage: course.coverImage,
    estimatedHours: course.estimatedHours,
    modules: course.modules,
    embeddingText: course.embeddingText || buildEmbeddingText(course.title, course.description),
    generatedEmbedding: course.generatedEmbedding,
  };
}

export function normalizeTags(input: string) {
  return input
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}
