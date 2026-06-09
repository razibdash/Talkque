import type { VoiceProvider } from './types';

export const livekitProvider: VoiceProvider = {
  name: 'livekit',
  async createSession() {
    throw new Error('LiveKit session creation is not implemented.');
  },
  async verifyWebhook() {
    return false;
  },
};
