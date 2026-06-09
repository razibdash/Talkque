export type LlmProviderName = 'groq' | 'openai';

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
};

export interface LlmProvider {
  name: LlmProviderName;
  complete(messages: LlmMessage[]): Promise<string>;
}
