export type EmbeddingProviderName = 'openai' | 'cohere';

export type EmbedOptions = {
  inputType?: 'document' | 'query';
};

export interface EmbeddingProvider {
  name: EmbeddingProviderName;
  model: string;
  dimensions: number;
  embed(input: string[], options?: EmbedOptions): Promise<number[][]>;
}
