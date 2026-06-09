import type { VoiceProvider } from './types';

export const vapiProvider: VoiceProvider = {
  name: 'vapi',
  async createSession() {
    throw new Error('Vapi session creation is not implemented.');
  },
  async verifyWebhook() {
    return false;
  },
};
