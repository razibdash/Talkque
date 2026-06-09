export type ProviderCategory =
  | 'voice'
  | 'llm'
  | 'embeddings'
  | 'stt'
  | 'tts'
  | 'telephony'
  | 'messaging'
  | 'billing';

export type ProviderConnection = {
  category: ProviderCategory;
  provider: string;
  enabled: boolean;
};
