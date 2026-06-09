import type { EmbeddingProvider } from './types';

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';

export const openaiEmbeddingProvider: EmbeddingProvider = {
  name: 'openai',
  model: OPENAI_EMBEDDING_MODEL,
  dimensions: 1536,
  async embed(input) {
    if (!input.length) return [];

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OpenAI embeddings are not configured. Add OPENAI_API_KEY to .env.local.');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        model: OPENAI_EMBEDDING_MODEL,
        dimensions: 1536,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI embedding request failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    const payload = (await response.json()) as {
      data?: { index: number; embedding: number[] }[];
    };
    const embeddings = [...(payload.data ?? [])]
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    if (embeddings.length !== input.length || embeddings.some((item) => item.length !== 1536)) {
      throw new Error('OpenAI returned an unexpected embedding response.');
    }

    return embeddings;
  },
};
