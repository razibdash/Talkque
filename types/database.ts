export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: Table<{
        id: string;
        name: string;
        slug: string;
        status: string;
        created_at: string;
      }>;
      organization_members: Table<{
        id: string;
        organization_id: string;
        user_id: string;
        role: string;
      }>;
      voice_agents: Table<{
        id: string;
        organization_id: string;
        name: string;
        status: string;
        created_at: string;
      }>;
      agent_versions: Table<{
        id: string;
        organization_id: string;
        agent_id: string;
        version_number: number;
      }>;
      conversations: Table<{
        id: string;
        organization_id: string;
        channel: string;
        status: string;
        created_at: string;
      }>;
      kb_documents: Table<{
        id: string;
        organization_id: string;
        title: string;
        status: string;
      }>;
      kb_chunks: Table<{
        id: string;
        organization_id: string;
        document_id: string;
        content: string;
      }>;
      outbox_events: Table<{
        id: string;
        organization_id: string;
        event_type: string;
        status: string;
        payload: Json;
      }>;
      usage_events: Table<{
        id: string;
        organization_id: string;
        usage_type: string;
        quantity: number;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
