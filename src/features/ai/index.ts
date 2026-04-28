export {
  getEmbeddingModelLoadState,
  loadEmbeddingModel,
  resetEmbeddingModelLoadState,
  subscribeToEmbeddingModelLoad,
} from '@/features/ai/lib/model-loader';
export { generateEmbedding } from '@/features/ai/lib/generate-embedding';
export { cosineSimilarity } from '@/features/ai/lib/cosine-similarity';
export { rankCoursesByProfile } from '@/features/ai/lib/rank-courses';
