export const APP_NAME = 'Talkque';
export const APP_DESCRIPTION = 'Global multilingual AI phone agents';

export const DEFAULT_PROVIDERS = {
  voice: 'livekit',
  llm: 'groq',
  embeddings: 'openai',
  stt: 'deepgram',
  tts: 'elevenlabs',
} as const;
