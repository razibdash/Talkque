export type ProviderCategory =
  | 'voice'
  | 'llm'
  | 'embeddings'
  | 'stt'
  | 'tts'
  | 'telephony'
  | 'messaging'
  | 'billing';

export type ProviderConnectionSummary = {
  category: ProviderCategory;
  provider: string;
  enabled: boolean;
};
