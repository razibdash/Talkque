export type VoiceProviderName = 'livekit' | 'retell' | 'vapi';

export type VoiceSessionInput = {
  agentId: string;
  phoneNumber?: string;
  metadata?: Record<string, unknown>;
};

export type VoiceSession = {
  provider: VoiceProviderName;
  sessionId: string;
  joinUrl?: string;
};

export interface VoiceProvider {
  name: VoiceProviderName;
  createSession(input: VoiceSessionInput): Promise<VoiceSession>;
  verifyWebhook(payload: string, signature: string | null): Promise<boolean>;
}
