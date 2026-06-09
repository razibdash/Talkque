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

export function getConfiguredEmbeddingProvider() {
  const configured = (process.env.EMBEDDING_PROVIDER ?? 'openai').toLowerCase();

  if (configured === 'groq') {
    throw new Error('Groq is not an embedding provider. Configure OpenAI embeddings instead.');
  }

  if (configured !== 'openai' && configured !== 'cohere') {
    throw new Error(`Unsupported embedding provider: ${configured}`);
  }

  const provider = getEmbeddingProvider(configured);
  if (provider.dimensions !== 1536) {
    throw new Error(
      `${provider.name} produces ${provider.dimensions}-dimension vectors; this KB requires 1536.`,
    );
  }

  return provider;
}

export type { EmbeddingProvider, EmbeddingProviderName } from './types';
