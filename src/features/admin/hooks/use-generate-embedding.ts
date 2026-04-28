import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getEmbeddingModelLoadState, subscribeToEmbeddingModelLoad } from '@/features/ai';
import type { GeneratedEmbedding } from '@/types/course';

export function useGenerateEmbeddingMutation() {
  const [modelLoadState, setModelLoadState] = useState(getEmbeddingModelLoadState);
  const mutation = useMutation({
    mutationFn: async (text: string): Promise<GeneratedEmbedding> => {
      const { generateEmbedding } = await import('@/features/ai');
      const rawVector = await generateEmbedding(text);
      const vector = Array.from(rawVector, (value) =>
        Number(Number(value).toFixed(10)),
      );

      return {
        model: 'Xenova/all-MiniLM-L6-v2',
        vector,
        dimension: vector.length,
        generatedAt: new Date().toISOString(),
      };
    },
  });

  useEffect(() => {
    return subscribeToEmbeddingModelLoad((nextState) => {
      setModelLoadState(nextState);
    });
  }, []);

  return {
    ...mutation,
    modelLoadState,
  };
}

