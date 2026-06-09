import { cohereEmbeddingProvider } from './cohere';
import { openaiEmbeddingProvider } from './openai';
import type { EmbeddingProvider, EmbeddingProviderName } from './types';

const providers: Record<EmbeddingProviderName, EmbeddingProvider> = {
  openai: openaiEmbeddingProvider,
  cohere: cohereEmbeddingProvider,
};

export function getEmbeddingProvider(name: EmbeddingProviderName): EmbeddingProvider {
  return providers[name];
}

export type { EmbeddingProvider, EmbeddingProviderName } from './types';
