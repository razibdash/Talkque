export type VoiceProvider = 'livekit' | 'retell' | 'vapi' | 'bland' | 'custom';
export type LlmProvider = 'groq' | 'openai' | 'anthropic';
export type EmbeddingProvider = 'openai' | 'cohere' | 'voyage' | 'jina';
export type SttProvider = 'deepgram' | 'assemblyai' | 'openai';
export type TtsProvider = 'elevenlabs' | 'deepgram' | 'openai';

export const defaultProviders = {
  voice: process.env.DEFAULT_VOICE_PROVIDER ?? 'livekit',
  llm: process.env.DEFAULT_LLM_PROVIDER ?? 'groq',
  embedding: process.env.DEFAULT_EMBEDDING_PROVIDER ?? 'openai',
  stt: process.env.DEFAULT_STT_PROVIDER ?? 'deepgram',
  tts: process.env.DEFAULT_TTS_PROVIDER ?? 'elevenlabs',
};
