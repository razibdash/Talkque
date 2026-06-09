import { livekitProvider } from './livekit';
import { retellProvider } from './retell';
import type { VoiceProvider, VoiceProviderName } from './types';
import { vapiProvider } from './vapi';

const providers: Record<VoiceProviderName, VoiceProvider> = {
  livekit: livekitProvider,
  retell: retellProvider,
  vapi: vapiProvider,
};

export function getVoiceProvider(name: VoiceProviderName): VoiceProvider {
  return providers[name];
}

export type { VoiceProvider, VoiceProviderName, VoiceSession, VoiceSessionInput } from './types';
