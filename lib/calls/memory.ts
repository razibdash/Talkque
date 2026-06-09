export type CallerMemory = {
  callerId: string;
  summary: string;
  updatedAt: string;
};

export async function buildCallerMemory(_callerId: string): Promise<CallerMemory | null> {
  void _callerId;
  return null;
}
