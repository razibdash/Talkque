export type OrganizationStatus = 'active' | 'trialing' | 'suspended' | 'cancelled';
export type MemberRole = 'owner' | 'admin' | 'manager' | 'agent_operator' | 'viewer';
export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived';
export type ConversationChannel = 'voice' | 'whatsapp' | 'sms' | 'web_chat' | 'email';
export type ConversationStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type SentimentLabel = 'positive' | 'neutral' | 'frustrated';

export type ProviderConnection = {
  id: string;
  organization_id: string;
  provider_type: string;
  provider_name: string;
  credentials_ref?: string;
  is_default: boolean;
  status: string;
};

export type VoiceAgent = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: AgentStatus;
  active_version_id?: string | null;
};
