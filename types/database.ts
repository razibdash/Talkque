export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrgStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled';
export type MemberRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer';
export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived';
export type ConversationChannel = 'voice' | 'whatsapp' | 'sms' | 'web_chat' | 'email';
export type ConversationStatus =
  | 'queued'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'no_answer'
  | 'busy';
export type CallDirection = 'inbound' | 'outbound';
export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'frustrated' | 'mixed';
export type KbDocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'archived';
export type GapStatus = 'open' | 'in_review' | 'resolved' | 'ignored';
export type OutboxStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type TableDefinition<
  Row,
  Insert,
  Update = Partial<Insert>,
  Relationships extends Relationship[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          status: OrgStatus;
          industry: string | null;
          country_code: string | null;
          default_timezone: string;
          default_locale: string;
          default_currency: string;
          billing_email: string | null;
          data_region: string | null;
          settings: Json;
          metadata: Json;
          created_by: string | null;
          deleted_at: string | null;
        } & Timestamps,
        {
          id?: string;
          name: string;
          slug: string;
          status?: OrgStatus;
          industry?: string | null;
          country_code?: string | null;
          default_timezone?: string;
          default_locale?: string;
          default_currency?: string;
          billing_email?: string | null;
          data_region?: string | null;
          settings?: Json;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          status?: OrgStatus;
          industry?: string | null;
          country_code?: string | null;
          default_timezone?: string;
          default_locale?: string;
          default_currency?: string;
          billing_email?: string | null;
          data_region?: string | null;
          settings?: Json;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
      >;
      organization_members: TableDefinition<
        {
          id: string;
          organization_id: string;
          user_id: string | null;
          invited_email: string | null;
          role: MemberRole;
          status: 'invited' | 'active' | 'suspended';
          invited_by: string | null;
          invited_at: string | null;
          joined_at: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          invited_email?: string | null;
          role?: MemberRole;
          status?: 'invited' | 'active' | 'suspended';
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          invited_email?: string | null;
          role?: MemberRole;
          status?: 'invited' | 'active' | 'suspended';
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      provider_connections: TableDefinition<
        {
          id: string;
          organization_id: string;
          provider_type:
            | 'voice'
            | 'llm'
            | 'embeddings'
            | 'stt'
            | 'tts'
            | 'telephony'
            | 'messaging'
            | 'billing';
          provider_name: string;
          display_name: string | null;
          credentials_ref: string | null;
          config: Json;
          status: 'active' | 'disabled' | 'error';
          is_default: boolean;
          last_verified_at: string | null;
          last_error: string | null;
          created_by: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          provider_type:
            | 'voice'
            | 'llm'
            | 'embeddings'
            | 'stt'
            | 'tts'
            | 'telephony'
            | 'messaging'
            | 'billing';
          provider_name: string;
          display_name?: string | null;
          credentials_ref?: string | null;
          config?: Json;
          status?: 'active' | 'disabled' | 'error';
          is_default?: boolean;
          last_verified_at?: string | null;
          last_error?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      voice_agents: TableDefinition<
        {
          id: string;
          organization_id: string;
          location_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          status: AgentStatus;
          default_language_code: string;
          default_dialect_code: string | null;
          active_version_id: string | null;
          metadata: Json;
          created_by: string | null;
          archived_at: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          location_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          status?: AgentStatus;
          default_language_code?: string;
          default_dialect_code?: string | null;
          active_version_id?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        },
        {
          id?: string;
          organization_id?: string;
          location_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: AgentStatus;
          default_language_code?: string;
          default_dialect_code?: string | null;
          active_version_id?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        }
      >;
      agent_versions: TableDefinition<
        {
          id: string;
          organization_id: string;
          agent_id: string;
          version_number: number;
          status: 'draft' | 'published' | 'retired';
          system_prompt: string;
          first_message: Json;
          llm_provider: string;
          llm_model: string;
          voice_provider: string;
          stt_provider: string;
          tts_provider: string;
          embedding_provider: string;
          embedding_model: string;
          embedding_dimensions: number;
          temperature: number;
          max_response_tokens: number | null;
          tools_config: Json;
          rag_config: Json;
          safety_config: Json;
          published_at: string | null;
          published_by: string | null;
          created_by: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          agent_id: string;
          version_number: number;
          status?: 'draft' | 'published' | 'retired';
          system_prompt: string;
          first_message?: Json;
          llm_provider?: string;
          llm_model?: string;
          voice_provider?: string;
          stt_provider?: string;
          tts_provider?: string;
          embedding_provider?: string;
          embedding_model?: string;
          embedding_dimensions?: number;
          temperature?: number;
          max_response_tokens?: number | null;
          tools_config?: Json;
          rag_config?: Json;
          safety_config?: Json;
          published_at?: string | null;
          published_by?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      agent_language_configs: TableDefinition<
        {
          id: string;
          organization_id: string;
          agent_id: string;
          agent_version_id: string;
          language_code: string;
          dialect_code: string | null;
          locale: string | null;
          display_name: string | null;
          first_message: string | null;
          system_prompt_addendum: string | null;
          voice_id: string | null;
          voice_settings: Json;
          pronunciation_dictionary: Json;
          is_default: boolean;
          is_enabled: boolean;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          agent_id: string;
          agent_version_id: string;
          language_code: string;
          dialect_code?: string | null;
          locale?: string | null;
          display_name?: string | null;
          first_message?: string | null;
          system_prompt_addendum?: string | null;
          voice_id?: string | null;
          voice_settings?: Json;
          pronunciation_dictionary?: Json;
          is_default?: boolean;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      phone_numbers: TableDefinition<
        {
          id: string;
          organization_id: string;
          location_id: string | null;
          agent_id: string | null;
          telephony_connection_id: string | null;
          phone_e164: string;
          phone_hash: string;
          display_name: string | null;
          provider_name: string;
          provider_number_id: string | null;
          country_code: string | null;
          capabilities: Json;
          status: 'provisioning' | 'active' | 'disabled' | 'released' | 'error';
          inbound_enabled: boolean;
          outbound_enabled: boolean;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          location_id?: string | null;
          agent_id?: string | null;
          telephony_connection_id?: string | null;
          phone_e164: string;
          phone_hash: string;
          display_name?: string | null;
          provider_name: string;
          provider_number_id?: string | null;
          country_code?: string | null;
          capabilities?: Json;
          status?: 'provisioning' | 'active' | 'disabled' | 'released' | 'error';
          inbound_enabled?: boolean;
          outbound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      kb_sources: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          source_type: 'upload' | 'url' | 'sitemap' | 'text' | 'api' | 'database';
          source_uri: string | null;
          base_language_code: string | null;
          sync_config: Json;
          status: 'active' | 'paused' | 'error' | 'archived';
          last_synced_at: string | null;
          next_sync_at: string | null;
          last_error: string | null;
          metadata: Json;
          created_by: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          name: string;
          source_type: 'upload' | 'url' | 'sitemap' | 'text' | 'api' | 'database';
          source_uri?: string | null;
          base_language_code?: string | null;
          sync_config?: Json;
          status?: 'active' | 'paused' | 'error' | 'archived';
          last_synced_at?: string | null;
          next_sync_at?: string | null;
          last_error?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      kb_documents: TableDefinition<
        {
          id: string;
          organization_id: string;
          source_id: string | null;
          title: string;
          external_id: string | null;
          canonical_uri: string | null;
          original_filename: string | null;
          mime_type: string | null;
          base_language_code: string | null;
          status: KbDocumentStatus;
          current_version_id: string | null;
          metadata: Json;
          created_by: string | null;
          archived_at: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          source_id?: string | null;
          title: string;
          external_id?: string | null;
          canonical_uri?: string | null;
          original_filename?: string | null;
          mime_type?: string | null;
          base_language_code?: string | null;
          status?: KbDocumentStatus;
          current_version_id?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        }
      >;
      kb_document_versions: TableDefinition<
        {
          id: string;
          organization_id: string;
          document_id: string;
          version_number: number;
          storage_bucket: string | null;
          storage_path: string | null;
          content_hash: string;
          byte_size: number | null;
          extracted_text: string | null;
          parser_name: string | null;
          parser_version: string | null;
          processing_status: KbDocumentStatus;
          processing_error: string | null;
          processed_at: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          document_id: string;
          version_number: number;
          storage_bucket?: string | null;
          storage_path?: string | null;
          content_hash: string;
          byte_size?: number | null;
          extracted_text?: string | null;
          parser_name?: string | null;
          parser_version?: string | null;
          processing_status?: KbDocumentStatus;
          processing_error?: string | null;
          processed_at?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      kb_chunks: TableDefinition<
        {
          id: string;
          organization_id: string;
          document_id: string;
          document_version_id: string;
          chunk_index: number;
          content: string;
          content_hash: string;
          language_code: string | null;
          token_count: number | null;
          heading_path: string[] | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          document_id: string;
          document_version_id: string;
          chunk_index: number;
          content: string;
          content_hash: string;
          language_code?: string | null;
          token_count?: number | null;
          heading_path?: string[] | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      kb_gaps: TableDefinition<
        {
          id: string;
          organization_id: string;
          agent_id: string | null;
          question: string;
          normalized_question: string;
          language_code: string | null;
          dialect_code: string | null;
          occurrence_count: number;
          status: GapStatus;
          resolution_notes: string | null;
          resolved_document_id: string | null;
          first_seen_at: string;
          last_seen_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          agent_id?: string | null;
          question: string;
          normalized_question: string;
          language_code?: string | null;
          dialect_code?: string | null;
          occurrence_count?: number;
          status?: GapStatus;
          resolution_notes?: string | null;
          resolved_document_id?: string | null;
          first_seen_at?: string;
          last_seen_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      callers: TableDefinition<
        {
          id: string;
          organization_id: string;
          phone_e164: string | null;
          phone_hash: string;
          display_name: string | null;
          email: string | null;
          preferred_language_code: string | null;
          preferred_dialect_code: string | null;
          timezone: string | null;
          consent_status: 'unknown' | 'granted' | 'denied' | 'withdrawn';
          call_count: number;
          first_contacted_at: string | null;
          last_contacted_at: string | null;
          metadata: Json;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          phone_e164?: string | null;
          phone_hash: string;
          display_name?: string | null;
          email?: string | null;
          preferred_language_code?: string | null;
          preferred_dialect_code?: string | null;
          timezone?: string | null;
          consent_status?: 'unknown' | 'granted' | 'denied' | 'withdrawn';
          call_count?: number;
          first_contacted_at?: string | null;
          last_contacted_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      conversations: TableDefinition<
        {
          id: string;
          organization_id: string;
          location_id: string | null;
          agent_id: string | null;
          agent_version_id: string | null;
          caller_id: string | null;
          channel: ConversationChannel;
          status: ConversationStatus;
          direction: CallDirection | null;
          external_provider: string | null;
          external_conversation_id: string | null;
          primary_language_code: string | null;
          primary_dialect_code: string | null;
          started_at: string | null;
          answered_at: string | null;
          ended_at: string | null;
          duration_seconds: number | null;
          summary: string | null;
          outcome: string | null;
          resolution_status: 'resolved' | 'unresolved' | 'escalated' | 'unknown' | null;
          overall_sentiment: SentimentLabel | null;
          recording_consent: boolean | null;
          metadata: Json;
        } & Timestamps,
        {
          id?: string;
          organization_id: string;
          location_id?: string | null;
          agent_id?: string | null;
          agent_version_id?: string | null;
          caller_id?: string | null;
          channel?: ConversationChannel;
          status?: ConversationStatus;
          direction?: CallDirection | null;
          external_provider?: string | null;
          external_conversation_id?: string | null;
          primary_language_code?: string | null;
          primary_dialect_code?: string | null;
          started_at?: string | null;
          answered_at?: string | null;
          ended_at?: string | null;
          duration_seconds?: number | null;
          summary?: string | null;
          outcome?: string | null;
          resolution_status?: 'resolved' | 'unresolved' | 'escalated' | 'unknown' | null;
          overall_sentiment?: SentimentLabel | null;
          recording_consent?: boolean | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      conversation_messages: TableDefinition<
        {
          id: string;
          organization_id: string;
          conversation_id: string;
          sequence_number: number;
          role: 'system' | 'caller' | 'assistant' | 'tool' | 'staff';
          content: string | null;
          content_redacted: string | null;
          language_code: string | null;
          started_at: string | null;
          ended_at: string | null;
          latency_ms: number | null;
          token_usage: Json;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          conversation_id: string;
          sequence_number: number;
          role: 'system' | 'caller' | 'assistant' | 'tool' | 'staff';
          content?: string | null;
          content_redacted?: string | null;
          language_code?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          latency_ms?: number | null;
          token_usage?: Json;
          metadata?: Json;
          created_at?: string;
        }
      >;
      answer_events: TableDefinition<
        {
          id: string;
          organization_id: string;
          conversation_id: string;
          message_id: string | null;
          agent_id: string | null;
          agent_version_id: string | null;
          query: string;
          answer: string | null;
          language_code: string | null;
          retrieved_chunk_ids: string[];
          retrieval_scores: Json;
          confidence_score: number | null;
          trust_decision: 'answer' | 'clarify' | 'fallback' | 'escalate' | null;
          used_fallback: boolean;
          fallback_reason: string | null;
          llm_provider: string | null;
          llm_model: string | null;
          embedding_provider: string | null;
          embedding_model: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          latency_ms: number | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          conversation_id: string;
          message_id?: string | null;
          agent_id?: string | null;
          agent_version_id?: string | null;
          query: string;
          answer?: string | null;
          language_code?: string | null;
          retrieved_chunk_ids?: string[];
          retrieval_scores?: Json;
          confidence_score?: number | null;
          trust_decision?: 'answer' | 'clarify' | 'fallback' | 'escalate' | null;
          used_fallback?: boolean;
          fallback_reason?: string | null;
          llm_provider?: string | null;
          llm_model?: string | null;
          embedding_provider?: string | null;
          embedding_model?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          latency_ms?: number | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      usage_events: TableDefinition<
        {
          id: string;
          organization_id: string;
          conversation_id: string | null;
          agent_id: string | null;
          usage_type: string;
          provider_name: string | null;
          provider_event_id: string | null;
          quantity: number;
          unit: string;
          unit_cost_usd: number | null;
          cost_usd: number | null;
          idempotency_key: string;
          metadata: Json;
          occurred_at: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          conversation_id?: string | null;
          agent_id?: string | null;
          usage_type: string;
          provider_name?: string | null;
          provider_event_id?: string | null;
          quantity: number;
          unit: string;
          unit_cost_usd?: number | null;
          cost_usd?: number | null;
          idempotency_key: string;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
        }
      >;
    };
    Views: {
      v_dashboard_overview: {
        Row: {
          organization_id: string | null;
          calls_30d: number | null;
          call_seconds_30d: number | null;
          resolved_calls_30d: number | null;
          active_agents: number | null;
          open_knowledge_gaps: number | null;
          open_escalations: number | null;
        };
        Relationships: [];
      };
      v_language_distribution_7d: {
        Row: {
          organization_id: string | null;
          language_code: string | null;
          conversation_count: number | null;
          duration_seconds: number | null;
        };
        Relationships: [];
      };
      v_hot_topics_7d: {
        Row: {
          organization_id: string | null;
          topic_id: string | null;
          name: string | null;
          normalized_name: string | null;
          conversation_count: number | null;
          average_confidence: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      has_org_role: {
        Args: { p_organization_id: string; p_roles: MemberRole[] };
        Returns: boolean;
      };
      is_org_member: {
        Args: { p_organization_id: string };
        Returns: boolean;
      };
      match_kb_chunks: {
        Args: {
          p_organization_id: string;
          p_query_embedding: string;
          p_match_threshold?: number;
          p_match_count?: number;
          p_language_code?: string | null;
        };
        Returns: {
          chunk_id: string;
          document_id: string;
          document_version_id: string;
          content: string;
          language_code: string | null;
          similarity: number;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      org_status: OrgStatus;
      member_role: MemberRole;
      agent_status: AgentStatus;
      conversation_channel: ConversationChannel;
      conversation_status: ConversationStatus;
      call_direction: CallDirection;
      sentiment_label: SentimentLabel;
      kb_document_status: KbDocumentStatus;
      gap_status: GapStatus;
      outbox_status: OutboxStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Row'];

export type TablesInsert<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Insert'];

export type TablesUpdate<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Update'];

export type Enums<EnumName extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][EnumName];

export type Organization = Tables<'organizations'>;
export type OrganizationInsert = TablesInsert<'organizations'>;
export type OrganizationMember = Tables<'organization_members'>;
export type ProviderConnection = Tables<'provider_connections'>;
export type VoiceAgent = Tables<'voice_agents'>;
export type AgentVersion = Tables<'agent_versions'>;
export type AgentLanguageConfig = Tables<'agent_language_configs'>;
export type PhoneNumber = Tables<'phone_numbers'>;
export type KbDocument = Tables<'kb_documents'>;
export type KbChunk = Tables<'kb_chunks'>;
export type KbGap = Tables<'kb_gaps'>;
export type Caller = Tables<'callers'>;
export type Conversation = Tables<'conversations'>;
export type ConversationMessage = Tables<'conversation_messages'>;
export type AnswerEvent = Tables<'answer_events'>;
export type UsageEvent = Tables<'usage_events'>;
