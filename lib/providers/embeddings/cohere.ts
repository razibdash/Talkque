import type { EmbeddingProvider } from './types';

export const cohereEmbeddingProvider: EmbeddingProvider = {
  name: 'cohere',
  model: 'embed-multilingual-v3.0',
  dimensions: 1024,
  async embed() {
    throw new Error(
      'Cohere embeddings are a placeholder and cannot be used with the 1536-dimension KB index.',
    );
  },
};
