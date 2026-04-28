const EMBEDDING_MODEL_ID = 'Xenova/all-MiniLM-L6-v2' as const;

type EmbeddingOutput = {
  data: Float32Array | number[];
};

type EmbeddingModel = (
  text: string,
  options: {
    pooling: 'mean';
    normalize: boolean;
  },
) => Promise<EmbeddingOutput>;

type TransformersProgressInfo =
  | {
      status: 'initiate' | 'download' | 'done';
      name: string;
      file: string;
    }
  | {
      status: 'progress';
      name: string;
      file: string;
      progress: number;
      loaded: number;
      total: number;
    }
  | {
      status: 'ready';
      task: string;
      model: string;
    };

export interface EmbeddingModelLoadState {
  stage: 'idle' | 'loading' | 'ready' | 'error';
  model: typeof EMBEDDING_MODEL_ID;
  progress: number;
  activeFile: string | null;
  loadedBytes: number | null;
  totalBytes: number | null;
  message: string | null;
}

type ModelLoadListener = (state: EmbeddingModelLoadState) => void;

let embeddingModelInstance: EmbeddingModel | null = null;
let embeddingModelPromise: Promise<EmbeddingModel> | null = null;
let modelLoadState: EmbeddingModelLoadState = {
  stage: 'idle',
  model: EMBEDDING_MODEL_ID,
  progress: 0,
  activeFile: null,
  loadedBytes: null,
  totalBytes: null,
  message: null,
};

const modelLoadListeners = new Set<ModelLoadListener>();
const fileProgress = new Map<string, number>();

function emitModelLoadState(partial: Partial<EmbeddingModelLoadState>) {
  modelLoadState = {
    ...modelLoadState,
    ...partial,
  };

  modelLoadListeners.forEach((listener) => listener(modelLoadState));
}

function calculateAggregateProgress() {
  if (fileProgress.size === 0) {
    return 0;
  }

  const totalProgress = Array.from(fileProgress.values()).reduce((sum, value) => sum + value, 0);
  return Math.round(totalProgress / fileProgress.size);
}

function handleProgress(progressInfo: TransformersProgressInfo) {
  switch (progressInfo.status) {
    case 'initiate':
      fileProgress.set(progressInfo.file, 0);
      emitModelLoadState({
        stage: 'loading',
        progress: calculateAggregateProgress(),
        activeFile: progressInfo.file,
        loadedBytes: null,
        totalBytes: null,
        message: `Готуємо файл ${progressInfo.file}`,
      });
      return;
    case 'download':
      emitModelLoadState({
        stage: 'loading',
        progress: calculateAggregateProgress(),
        activeFile: progressInfo.file,
        loadedBytes: null,
        totalBytes: null,
        message: `Завантажуємо ${progressInfo.file}`,
      });
      return;
    case 'progress':
      fileProgress.set(progressInfo.file, progressInfo.progress);
      emitModelLoadState({
        stage: 'loading',
        progress: calculateAggregateProgress(),
        activeFile: progressInfo.file,
        loadedBytes: progressInfo.loaded,
        totalBytes: progressInfo.total,
        message: `Завантажуємо ${progressInfo.file}`,
      });
      return;
    case 'done':
      fileProgress.set(progressInfo.file, 100);
      emitModelLoadState({
        stage: 'loading',
        progress: calculateAggregateProgress(),
        activeFile: progressInfo.file,
        loadedBytes: null,
        totalBytes: null,
        message: `Файл ${progressInfo.file} готовий`,
      });
      return;
    case 'ready':
      emitModelLoadState({
        stage: 'ready',
        progress: 100,
        activeFile: null,
        loadedBytes: null,
        totalBytes: null,
        message: 'Embedding-модель готова до використання',
      });
      return;
  }
}

export function getEmbeddingModelLoadState() {
  return modelLoadState;
}

export function resetEmbeddingModelLoadState() {
  fileProgress.clear();
  emitModelLoadState({
    stage: 'idle',
    progress: 0,
    activeFile: null,
    loadedBytes: null,
    totalBytes: null,
    message: null,
  });
}

export function subscribeToEmbeddingModelLoad(listener: ModelLoadListener) {
  modelLoadListeners.add(listener);
  listener(modelLoadState);

  return () => {
    modelLoadListeners.delete(listener);
  };
}

export async function loadEmbeddingModel() {
  if (embeddingModelInstance) {
    emitModelLoadState({
      stage: 'ready',
      progress: 100,
      activeFile: null,
      loadedBytes: null,
      totalBytes: null,
      message: 'Embedding-модель взято з кешу браузерної сесії',
    });
    return embeddingModelInstance;
  }

  if (embeddingModelPromise) {
    return embeddingModelPromise;
  }

  fileProgress.clear();
  emitModelLoadState({
    stage: 'loading',
    progress: 0,
    activeFile: null,
    loadedBytes: null,
    totalBytes: null,
    message: 'Починаємо ініціалізацію embedding-моделі',
  });

  embeddingModelPromise = (async () => {
    const { env, pipeline } = await import('@huggingface/transformers');

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }

    const extractor = (await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
      progress_callback: (progressInfo) => handleProgress(progressInfo as TransformersProgressInfo),
    })) as unknown as EmbeddingModel;

    embeddingModelInstance = extractor;

    return extractor;
  })();

  try {
    return await embeddingModelPromise;
  } catch (error) {
    emitModelLoadState({
      stage: 'error',
      progress: 0,
      activeFile: null,
      loadedBytes: null,
      totalBytes: null,
      message: error instanceof Error ? error.message : 'Не вдалося завантажити embedding-модель.',
    });
    embeddingModelPromise = null;
    throw error;
  }
}
