export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived';

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  status: AgentStatus;
  defaultLanguage: string;
};

export type AgentVersion = {
  id: string;
  agentId: string;
  versionNumber: number;
  systemPrompt: string;
};
