import type { CourseFilters } from '@/api/contracts';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: ['auth', 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    me: ['users', 'me'] as const,
  },
  courses: {
    all: ['courses'] as const,
    list: (filters: CourseFilters = {}) => ['courses', 'list', filters] as const,
    detail: (courseId: string) => ['courses', 'detail', courseId] as const,
  },
  learning: {
    all: ['learning'] as const,
    summary: ['learning', 'summary'] as const,
    course: (courseId: string) => ['learning', 'course', courseId] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    context: ['recommendations', 'context'] as const,
    ranked: (userProfileText: string) =>
      ['recommendations', 'ranked', userProfileText] as const,
  },
  admin: {
    all: ['admin'] as const,
    courses: (filters: CourseFilters = {}) => ['admin', 'courses', filters] as const,
    course: (courseId: string) => ['admin', 'course', courseId] as const,
    users: ['admin', 'users'] as const,
    user: (userId: string) => ['admin', 'user', userId] as const,
  },
} as const;
