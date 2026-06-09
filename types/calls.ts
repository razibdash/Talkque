export type CallStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type Conversation = {
  id: string;
  organizationId: string;
  agentId: string | null;
  status: CallStatus;
  language: string | null;
  durationSeconds: number | null;
};
