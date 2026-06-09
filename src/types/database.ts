export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: { Row: { id: string; name: string; slug: string; status: string; created_at: string } };
      organization_members: { Row: { id: string; organization_id: string; user_id: string; role: string } };
      voice_agents: { Row: { id: string; organization_id: string; name: string; status: string } };
      agent_versions: { Row: { id: string; organization_id: string; agent_id: string; version_number: number } };
      conversations: { Row: { id: string; organization_id: string; channel: string; status: string; created_at: string } };
      kb_documents: { Row: { id: string; organization_id: string; title: string; status: string } };
      kb_chunks: { Row: { id: string; organization_id: string; document_id: string; content: string } };
      usage_events: { Row: { id: string; organization_id: string; usage_type: string; quantity: number } };
    };
  };
};
