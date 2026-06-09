import type { LlmProvider } from './types';

export const groqProvider: LlmProvider = {
  name: 'groq',
  async complete() {
    throw new Error('Groq completion is not implemented.');
  },
};
