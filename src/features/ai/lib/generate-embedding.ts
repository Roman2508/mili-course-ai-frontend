import { loadEmbeddingModel } from '@/features/ai/lib/model-loader';

export async function generateEmbedding(text: string) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  const model = await loadEmbeddingModel();
  const output = await model(normalizedText, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}

