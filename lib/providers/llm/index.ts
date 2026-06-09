import { groqProvider } from './groq';
import { openaiLlmProvider } from './openai';
import type { LlmProvider, LlmProviderName } from './types';

const providers: Record<LlmProviderName, LlmProvider> = {
  groq: groqProvider,
  openai: openaiLlmProvider,
};

export function getLlmProvider(name: LlmProviderName): LlmProvider {
  return providers[name];
}

export type { LlmMessage, LlmProvider, LlmProviderName } from './types';
