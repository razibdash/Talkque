import type { EmbeddingProvider } from './types';

export const cohereEmbeddingProvider: EmbeddingProvider = {
  name: 'cohere',
  dimensions: 1024,
  async embed() {
    throw new Error('Cohere embedding generation is not implemented.');
  },
};
