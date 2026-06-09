export type SttProviderName = 'deepgram';

export interface SttProvider {
  name: SttProviderName;
  transcribe(audio: ArrayBuffer, language?: string): Promise<string>;
}
