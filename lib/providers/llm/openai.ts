import type { LlmProvider } from './types';

export const openaiLlmProvider: LlmProvider = {
  name: 'openai',
  async complete() {
    throw new Error('OpenAI completion is not implemented.');
  },
};
