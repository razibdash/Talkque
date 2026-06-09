export type TtsProviderName = 'elevenlabs';

export interface TtsProvider {
  name: TtsProviderName;
  synthesize(text: string, voiceId: string): Promise<ArrayBuffer>;
}
