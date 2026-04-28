import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import {
  getEmbeddingModelLoadState,
  resetEmbeddingModelLoadState,
  subscribeToEmbeddingModelLoad,
} from '@/features/ai';
import { useRecommendationsBaseDataQuery } from '@/features/recommendations/hooks/use-recommendations-base-data';
import type { RecommendationResult } from '@/types/recommendations';

const MODEL_LOAD_ERROR_MESSAGE = 'Не вдалося завантажити AI-модель.';

export function useRecommendations() {
  const baseDataQuery = useRecommendationsBaseDataQuery();
  const [modelLoadState, setModelLoadState] = useState(getEmbeddingModelLoadState);
  const courseEmbeddingCacheRef = useRef(new Map<string, number[]>());

  useEffect(() => {
    return subscribeToEmbeddingModelLoad((nextState) => {
      setModelLoadState(nextState);
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function prepareModel() {
      if (!baseDataQuery.data || modelLoadState.stage === 'loading' || modelLoadState.stage === 'ready') {
        return;
      }

      if (modelLoadState.stage === 'error') {
        return;
      }

      try {
        const { loadEmbeddingModel } = await import('@/features/ai');
        await loadEmbeddingModel();
      } catch (error) {
        if (!active) {
          return;
        }

        setModelLoadState((current) => ({
          ...current,
          stage: 'error',
          message:
            error instanceof Error ? error.message : MODEL_LOAD_ERROR_MESSAGE,
        }));
      }
    }

    void prepareModel();

    return () => {
      active = false;
    };
  }, [baseDataQuery.data, modelLoadState.stage]);

  const isModelLoading = modelLoadState.stage === 'loading';
  const isAiReady = modelLoadState.stage === 'ready';
  const modelError =
    modelLoadState.stage === 'error'
      ? modelLoadState.message ?? MODEL_LOAD_ERROR_MESSAGE
      : null;

  const recommendationsQuery = useQuery<RecommendationResult[]>({
    queryKey: queryKeys.recommendations.ranked(
      baseDataQuery.data?.userProfileText ?? 'idle',
    ),
    queryFn: async () => {
      const { rankCoursesByProfile } = await import('@/features/ai');

      return rankCoursesByProfile({
        baseData: baseDataQuery.data!,
        limit: 5,
        courseEmbeddingCache: courseEmbeddingCacheRef.current,
      });
    },
    enabled: Boolean(baseDataQuery.data && isAiReady),
  });

  return {
    baseDataQuery,
    recommendationsQuery,
    isModelLoading,
    isGeneratingRecommendations: recommendationsQuery.fetchStatus === 'fetching',
    isAiReady,
    modelError,
    modelLoadState,
    retryModelLoad: () => {
      resetEmbeddingModelLoadState();
    },
  };
}

export const useCourseRecommendations = useRecommendations;
