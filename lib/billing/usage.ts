export type UsageRecord = {
  organizationId: string;
  type: 'voice_minute' | 'llm_token' | 'embedding';
  quantity: number;
  provider?: string;
};

export async function recordUsage(_usage: UsageRecord): Promise<void> {
  void _usage;
  throw new Error('Usage recording is not implemented.');
}
