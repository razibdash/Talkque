export type LiveKitAgentConfig = {
  organizationId: string;
  agentId: string;
  languageCodes: string[];
  llmProvider: 'groq' | 'openai' | 'anthropic';
  sttProvider: 'deepgram' | 'openai';
  ttsProvider: 'elevenlabs' | 'openai';
};

export function buildLiveKitAgentConfig(config: LiveKitAgentConfig) {
  return {
    provider: 'livekit',
    roomMetadata: {
      organizationId: config.organizationId,
      agentId: config.agentId,
      languageCodes: config.languageCodes,
    },
    providers: {
      llm: config.llmProvider,
      stt: config.sttProvider,
      tts: config.ttsProvider,
    },
  };
}
