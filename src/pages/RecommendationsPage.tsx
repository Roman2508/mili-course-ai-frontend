import { BrainCircuit, Radar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/page-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { RecommendationCard } from "@/features/recommendations/components/recommendation-card";
import { useCourseRecommendations } from "@/features/recommendations/hooks/use-course-recommendations";

export default function RecommendationsPage() {
  const {
    baseDataQuery,
    recommendationsQuery,
    isModelLoading,
    isGeneratingRecommendations,
    isAiReady,
    modelError,
    modelLoadState,
    retryModelLoad,
  } = useCourseRecommendations();

  const recommendations = recommendationsQuery.data ?? [];
  const hasRecommendations = recommendations.length > 0;
  const isWaitingForModel = !modelError && !isAiReady;
  const isWaitingForRecommendations =
    !modelError &&
    !hasRecommendations &&
    (isWaitingForModel || isGeneratingRecommendations);

  const generationStatusLabel = modelError
    ? "Рекомендації недоступні"
    : hasRecommendations
      ? "Рекомендації підготовлено"
      : isGeneratingRecommendations
        ? "Ранжуємо рекомендації..."
        : isWaitingForModel
          ? "Очікуємо модель"
          : "Очікуємо результат";

  if (baseDataQuery.isPending) {
    return (
      <LoadingState
        title="Готуємо контекст рекомендацій"
        description="Завантажуємо курси, інтереси та навчальний профіль."
      />
    );
  }

  if (baseDataQuery.isError || !baseDataQuery.data) {
    return <ErrorState onRetry={() => void baseDataQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI-рекомендації"
        title="Семантичне ранжування курсів"
        description="Топ-5 рекомендацій на основі результатів вашого навчання"
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden bg-ink p-0 text-white">
          <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <Radar className="size-4" />
                Модуль рекомендацій
              </div>
              <div className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/55">
                {hasRecommendations
                  ? "рекомендації готові"
                  : isAiReady
                    ? "модель активна"
                    : modelError
                      ? "помилка моделі"
                      : "модель не активна"}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white/90">
                AI-модуль рекомендацій
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70">
                Тут ви можете отримати список найбільш релевантних курсів,
                сформований на основі ваших інтересів та рівня підготовки.
                Система аналізує ваші навчальні вподобання та результати
                проходження курсів, після чого пропонує персоналізовані
                рекомендації.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Слабкі теми
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {baseDataQuery.data.weakTopics.map((topic) => (
                    <Badge
                      key={topic.id}
                      tone="signal"
                      className="bg-white/10 text-white"
                    >
                      {topic.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Інтереси
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {baseDataQuery.data.interests.map((interest) => (
                    <Badge
                      key={interest}
                      tone="field"
                      className="bg-white/10 text-white"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-field/10 p-3 text-field">
                <BrainCircuit className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate">
                  Стан моделі
                </p>
                <p className="text-lg font-semibold">
                  {isModelLoading
                    ? "Завантажуємо embedding-модель"
                    : modelError
                      ? "Завантаження моделі завершилось помилкою"
                      : isAiReady
                        ? "Готова до ранжування"
                        : "Очікування"}
                </p>
              </div>
            </div>

            {isModelLoading ? (
              <div className="space-y-4 rounded-2xl bg-ink/5 px-4 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <Spinner />
                  <span>Завантаження АІ моделі</span>
                </div>
                <ProgressBar value={modelLoadState.progress} />
                <div className="space-y-1 text-xs text-slate">
                  <p>
                    {modelLoadState.message ?? "Готуємо завантаження моделі."}
                  </p>
                  {modelLoadState.activeFile ? (
                    <p>Поточний файл: {modelLoadState.activeFile}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {modelError ? (
              <div className="rounded-2xl border border-signal/30 bg-signal/10 px-4 py-4 text-sm text-signal">
                {modelError}
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brass/10 p-3 text-brass">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate">
                  Стан генерації
                </p>
                <p className="text-lg font-semibold">{generationStatusLabel}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {modelError ? (
        <ErrorState
          title="Не вдалося завантажити AI-модель"
          description="Оновіть сторінку або повторіть спробу пізніше."
          onRetry={retryModelLoad}
        />
      ) : null}

      {recommendationsQuery.isError ? (
        <ErrorState
          title="Не вдалося виконати AI-ранжування"
          description="Модель завантажилась, але розрахунок рекомендацій завершився помилкою."
          onRetry={() => void recommendationsQuery.refetch()}
        />
      ) : null}

      {isWaitingForRecommendations ? (
        <LoadingState
          title={
            isWaitingForModel ? "Завантажуємо модель" : "Готуємо рекомендації"
          }
          description={
            isWaitingForModel
              ? "Після завершення ініціалізації моделі тут з’являться картки рекомендованих курсів."
              : "Формуємо список рекомендацій."
          }
        />
      ) : null}

      {!isWaitingForRecommendations &&
      !modelError &&
      recommendationsQuery.isSuccess &&
      recommendations.length === 0 ? (
        <EmptyState
          title="Рекомендації поки не готові"
          description="Семантичне ранжування повернуло порожній список. Перевірте вхідний контекст користувача або стан AI."
        />
      ) : null}

      {hasRecommendations ? (
        <div className="grid gap-5">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.course.id}
              recommendation={recommendation}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
