import { generateEmbedding } from '@/features/ai/lib/generate-embedding';
import { cosineSimilarity } from '@/features/ai/lib/cosine-similarity';
import { buildUserProfileText } from '@/features/recommendations/lib/build-user-profile-text';
import type { Course } from '@/types/course';
import type { RecommendationResult, RecommendationsBaseData } from '@/types/recommendations';

interface RankCoursesOptions {
  baseData: RecommendationsBaseData;
  limit?: number;
  courseEmbeddingCache?: Map<string, number[]>;
}

function buildMatchSummary(course: Course, similarityScore: number) {
  const scorePercent = Math.round(similarityScore * 100);
  return `${course.tags.slice(0, 2).join(' • ')} · схожість ${scorePercent}%`;
}

export async function rankCoursesByProfile({
  baseData,
  limit = 5,
  courseEmbeddingCache,
}: RankCoursesOptions): Promise<RecommendationResult[]> {
  const cache = courseEmbeddingCache ?? new Map<string, number[]>();
  const userProfileText = buildUserProfileText(baseData);
  const userEmbedding = await generateEmbedding(userProfileText);
  const backendEmbeddingMap = new Map(
    baseData.courseEmbeddings.map((entry) => [
      entry.courseId,
      entry.generatedEmbedding?.vector ?? null,
    ]),
  );
  const completedCourseIds = new Set(
    baseData.myLearning.filter((course) => course.status === 'completed').map((course) => course.courseId),
  );
  const rankedCourses = await Promise.all(
    baseData.courses.map(async (course) => {
      const cachedEmbedding = cache.get(course.id);
      const courseEmbedding =
        backendEmbeddingMap.get(course.id) ??
        course.generatedEmbedding?.vector ??
        cachedEmbedding ??
        (await generateEmbedding(course.embeddingText));

      if (courseEmbedding) {
        cache.set(course.id, courseEmbedding);
      }

      const rawScore = cosineSimilarity(userEmbedding, courseEmbedding);
      const completionPenalty = completedCourseIds.has(course.id) ? 0.06 : 0;
      const similarityScore = Math.max(0, rawScore - completionPenalty);

      return {
        course,
        similarityScore,
        rank: 0,
        matchSummary: buildMatchSummary(course, similarityScore),
      };
    }),
  );

  return rankedCourses
    .sort((left, right) => right.similarityScore - left.similarityScore)
    .slice(0, limit)
    .map((course, index) => ({
      ...course,
      rank: index + 1,
    }));
}
