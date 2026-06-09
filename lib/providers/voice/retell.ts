import type { VoiceProvider } from './types';

export const retellProvider: VoiceProvider = {
  name: 'retell',
  async createSession() {
    throw new Error('Retell session creation is not implemented.');
  },
  async verifyWebhook() {
    return false;
  },
};
