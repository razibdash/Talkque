export type Sentiment = 'positive' | 'neutral' | 'frustrated';

export async function analyzeSentiment(_transcript: string): Promise<Sentiment> {
  void _transcript;
  return 'neutral';
}
