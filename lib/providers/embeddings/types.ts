export type EmbeddingProviderName = 'openai' | 'cohere';

export interface EmbeddingProvider {
  name: EmbeddingProviderName;
  dimensions: number;
  embed(input: string[]): Promise<number[][]>;
}
