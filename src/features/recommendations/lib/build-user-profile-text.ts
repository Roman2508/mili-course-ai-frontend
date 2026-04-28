import type { RecommendationsBaseData } from '@/types/recommendations';

export function buildUserProfileText(baseData: RecommendationsBaseData) {
  if (baseData.userProfileText.trim().length > 0) {
    return baseData.userProfileText;
  }

  const learningSnapshot = baseData.myLearning
    .map((course) => `${course.courseId}:${course.status}:${course.progressPercent}%`)
    .join('; ');
  const weakTopics = baseData.weakTopics.map((topic) => `${topic.label}:${topic.confidenceGap}`).join('; ');
  const interests = baseData.interests.join(', ');

  return [
    `Опис профілю: ${baseData.profileSummary}`,
    `Навчальні інтереси: ${interests}`,
    `Слабкі теми: ${weakTopics}`,
    `Поточний прогрес: ${learningSnapshot}`,
  ].join('. ');
}
