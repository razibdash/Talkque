import type { EmbeddingProvider } from './types';

export const openaiEmbeddingProvider: EmbeddingProvider = {
  name: 'openai',
  dimensions: 1536,
  async embed() {
    throw new Error('OpenAI embedding generation is not implemented.');
  },
};
