-- Talkque production schema
-- Global multilingual AI phone-agent SaaS on Supabase/PostgreSQL.

begin;

create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type public.org_status as enum ('trialing', 'active', 'past_due', 'suspended', 'cancelled');
create type public.member_role as enum ('owner', 'admin', 'manager', 'operator', 'viewer');
create type public.agent_status as enum ('draft', 'active', 'paused', 'archived');
create type public.conversation_channel as enum ('voice', 'whatsapp', 'sms', 'web_chat', 'email');
create type public.conversation_status as enum (
  'queued',
  'ringing',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
  'no_answer',
  'busy'
);
create type public.call_direction as enum ('inbound', 'outbound');
create type public.sentiment_label as enum ('positive', 'neutral', 'negative', 'frustrated', 'mixed');
create type public.kb_document_status as enum ('uploaded', 'processing', 'ready', 'failed', 'archived');
create type public.gap_status as enum ('open', 'in_review', 'resolved', 'ignored');
create type public.outbox_status as enum ('pending', 'processing', 'completed', 'failed', 'dead_letter');

-- ---------------------------------------------------------------------------
-- Tenant core
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 200),
  slug extensions.citext not null unique,
  status public.org_status not null default 'trialing',
  industry text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  default_timezone text not null default 'UTC',
  default_locale text not null default 'en',
  default_currency text not null default 'USD' check (default_currency ~ '^[A-Z]{3}$'),
  billing_email extensions.citext,
  data_region text,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, status)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email extensions.citext,
  role public.member_role not null default 'viewer',
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or invited_email is not null),
  unique (organization_id, id)
);

create unique index organization_members_org_user_uidx
  on public.organization_members (organization_id, user_id)
  where user_id is not null;

create unique index organization_members_org_email_uidx
  on public.organization_members (organization_id, invited_email)
  where invited_email is not null and status = 'invited';

create table public.organization_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code extensions.citext,
  phone text,
  email extensions.citext,
  address_line1 text,
  address_line2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'UTC',
  locale text,
  business_hours jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, code)
);

-- ---------------------------------------------------------------------------
-- Provider abstraction and voice agents
-- ---------------------------------------------------------------------------

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider_type text not null check (
    provider_type in ('voice', 'llm', 'embeddings', 'stt', 'tts', 'telephony', 'messaging', 'billing')
  ),
  provider_name text not null,
  display_name text,
  credentials_ref text,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'disabled', 'error')),
  is_default boolean not null default false,
  last_verified_at timestamptz,
  last_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, provider_type, provider_name)
);

create unique index provider_connections_one_default_uidx
  on public.provider_connections (organization_id, provider_type)
  where is_default and status = 'active';

create table public.voice_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid,
  name text not null,
  slug extensions.citext not null,
  description text,
  status public.agent_status not null default 'draft',
  default_language_code text not null default 'en',
  default_dialect_code text,
  active_version_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, id),
  unique (organization_id, slug),
  foreign key (organization_id, location_id)
    references public.organization_locations (organization_id, id) on delete set null (location_id)
);

create table public.agent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null,
  version_number integer not null check (version_number > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  system_prompt text not null,
  first_message jsonb not null default '{}'::jsonb,
  llm_provider text not null default 'groq',
  llm_model text not null default 'llama-3.3-70b-versatile',
  voice_provider text not null default 'livekit',
  stt_provider text not null default 'deepgram',
  tts_provider text not null default 'elevenlabs',
  embedding_provider text not null default 'openai',
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dimensions integer not null default 1536 check (embedding_dimensions = 1536),
  temperature numeric(4,3) not null default 0.2 check (temperature between 0 and 2),
  max_response_tokens integer check (max_response_tokens is null or max_response_tokens > 0),
  tools_config jsonb not null default '[]'::jsonb,
  rag_config jsonb not null default '{"enabled":true,"match_threshold":0.72,"match_count":5}'::jsonb,
  safety_config jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, agent_id, version_number),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade
);

alter table public.voice_agents
  add constraint voice_agents_active_version_fk
  foreign key (organization_id, active_version_id)
  references public.agent_versions (organization_id, id)
  on delete set null (active_version_id);

create table public.agent_language_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null,
  agent_version_id uuid not null,
  language_code text not null,
  dialect_code text,
  locale text,
  display_name text,
  first_message text,
  system_prompt_addendum text,
  voice_id text,
  voice_settings jsonb not null default '{}'::jsonb,
  pronunciation_dictionary jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique nulls not distinct (agent_version_id, language_code, dialect_code),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade,
  foreign key (organization_id, agent_version_id)
    references public.agent_versions (organization_id, id) on delete cascade
);

create unique index agent_language_configs_default_uidx
  on public.agent_language_configs (agent_version_id)
  where is_default and is_enabled;

create table public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid,
  agent_id uuid,
  telephony_connection_id uuid,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  phone_hash text not null,
  display_name text,
  provider_name text not null,
  provider_number_id text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  capabilities jsonb not null default '{"voice":true,"sms":false}'::jsonb,
  status text not null default 'active' check (status in ('provisioning', 'active', 'disabled', 'released', 'error')),
  inbound_enabled boolean not null default true,
  outbound_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (phone_e164),
  unique (organization_id, phone_hash),
  foreign key (organization_id, location_id)
    references public.organization_locations (organization_id, id) on delete set null (location_id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete set null (agent_id),
  foreign key (organization_id, telephony_connection_id)
    references public.provider_connections (organization_id, id) on delete set null (telephony_connection_id)
);

-- ---------------------------------------------------------------------------
-- Knowledge base and RAG
-- ---------------------------------------------------------------------------

create table public.kb_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  source_type text not null check (source_type in ('upload', 'url', 'sitemap', 'text', 'api', 'database')),
  source_uri text,
  base_language_code text,
  sync_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'error', 'archived')),
  last_synced_at timestamptz,
  next_sync_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_id uuid,
  title text not null,
  external_id text,
  canonical_uri text,
  original_filename text,
  mime_type text,
  base_language_code text,
  status public.kb_document_status not null default 'uploaded',
  current_version_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, id),
  unique (organization_id, source_id, external_id),
  foreign key (organization_id, source_id)
    references public.kb_sources (organization_id, id) on delete set null (source_id)
);

create table public.kb_document_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null,
  version_number integer not null check (version_number > 0),
  storage_bucket text,
  storage_path text,
  content_hash text not null,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  extracted_text text,
  parser_name text,
  parser_version text,
  processing_status public.kb_document_status not null default 'processing',
  processing_error text,
  processed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (document_id, version_number),
  unique (organization_id, document_id, content_hash),
  foreign key (organization_id, document_id)
    references public.kb_documents (organization_id, id) on delete cascade
);

alter table public.kb_documents
  add constraint kb_documents_current_version_fk
  foreign key (organization_id, current_version_id)
  references public.kb_document_versions (organization_id, id)
  on delete set null (current_version_id);

create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null,
  document_version_id uuid not null,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null check (length(content) > 0),
  content_hash text not null,
  language_code text,
  token_count integer check (token_count is null or token_count >= 0),
  heading_path text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (document_version_id, chunk_index),
  foreign key (organization_id, document_id)
    references public.kb_documents (organization_id, id) on delete cascade,
  foreign key (organization_id, document_version_id)
    references public.kb_document_versions (organization_id, id) on delete cascade
);

create table public.kb_chunk_translations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  chunk_id uuid not null,
  language_code text not null,
  dialect_code text,
  translated_content text not null,
  translation_provider text,
  translation_model text,
  source_content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (chunk_id, language_code, dialect_code),
  foreign key (organization_id, chunk_id)
    references public.kb_chunks (organization_id, id) on delete cascade
);

create table public.kb_chunk_embeddings_1536 (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  chunk_id uuid not null,
  embedding_provider text not null default 'openai',
  embedding_model text not null default 'text-embedding-3-small',
  embedded_content_hash text not null,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (chunk_id, embedding_provider, embedding_model),
  foreign key (organization_id, chunk_id)
    references public.kb_chunks (organization_id, id) on delete cascade
);

create table public.kb_gaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid,
  question text not null,
  normalized_question text not null,
  language_code text,
  dialect_code text,
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  status public.gap_status not null default 'open',
  resolution_notes text,
  resolved_document_id uuid,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete set null (agent_id),
  foreign key (organization_id, resolved_document_id)
    references public.kb_documents (organization_id, id) on delete set null (resolved_document_id)
);

-- ---------------------------------------------------------------------------
-- Callers and conversations
-- ---------------------------------------------------------------------------

create table public.callers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  phone_e164 text,
  phone_hash text not null,
  display_name text,
  email extensions.citext,
  preferred_language_code text,
  preferred_dialect_code text,
  timezone text,
  consent_status text not null default 'unknown' check (consent_status in ('unknown', 'granted', 'denied', 'withdrawn')),
  call_count integer not null default 0 check (call_count >= 0),
  first_contacted_at timestamptz,
  last_contacted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, phone_hash)
);

create table public.caller_memories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caller_id uuid not null,
  agent_id uuid,
  memory_type text not null default 'summary' check (memory_type in ('summary', 'preference', 'fact', 'instruction')),
  content text not null,
  content_hash text,
  importance numeric(4,3) not null default 0.5 check (importance between 0 and 1),
  expires_at timestamptz,
  source_conversation_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, caller_id)
    references public.callers (organization_id, id) on delete cascade,
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid,
  agent_id uuid,
  agent_version_id uuid,
  caller_id uuid,
  channel public.conversation_channel not null default 'voice',
  status public.conversation_status not null default 'queued',
  direction public.call_direction,
  external_provider text,
  external_conversation_id text,
  primary_language_code text,
  primary_dialect_code text,
  started_at timestamptz,
  answered_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  summary text,
  outcome text,
  resolution_status text check (resolution_status is null or resolution_status in ('resolved', 'unresolved', 'escalated', 'unknown')),
  overall_sentiment public.sentiment_label,
  recording_consent boolean,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (external_provider, external_conversation_id),
  foreign key (organization_id, location_id)
    references public.organization_locations (organization_id, id) on delete set null (location_id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete set null (agent_id),
  foreign key (organization_id, agent_version_id)
    references public.agent_versions (organization_id, id) on delete set null (agent_version_id),
  foreign key (organization_id, caller_id)
    references public.callers (organization_id, id) on delete set null (caller_id)
);

alter table public.caller_memories
  add constraint caller_memories_source_conversation_fk
  foreign key (organization_id, source_conversation_id)
  references public.conversations (organization_id, id)
  on delete set null (source_conversation_id);

create table public.voice_call_details (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  phone_number_id uuid,
  provider_connection_id uuid,
  direction public.call_direction not null,
  from_number_hash text,
  to_number_hash text,
  provider_call_id text,
  sip_call_id text,
  recording_storage_path text,
  recording_duration_seconds integer check (recording_duration_seconds is null or recording_duration_seconds >= 0),
  audio_codec text,
  hangup_party text check (hangup_party is null or hangup_party in ('caller', 'agent', 'provider', 'system', 'unknown')),
  hangup_reason text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (conversation_id),
  unique (provider_connection_id, provider_call_id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, phone_number_id)
    references public.phone_numbers (organization_id, id) on delete set null (phone_number_id),
  foreign key (organization_id, provider_connection_id)
    references public.provider_connections (organization_id, id) on delete set null (provider_connection_id)
);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  sequence_number integer not null check (sequence_number >= 0),
  role text not null check (role in ('system', 'caller', 'assistant', 'tool', 'staff')),
  content text,
  content_redacted text,
  language_code text,
  started_at timestamptz,
  ended_at timestamptz,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  token_usage jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (conversation_id, sequence_number),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade
);

create table public.tool_calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  message_id uuid,
  tool_name text not null,
  external_call_id text,
  arguments jsonb not null default '{}'::jsonb,
  result jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'cancelled')),
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, message_id)
    references public.conversation_messages (organization_id, id) on delete set null (message_id)
);

-- ---------------------------------------------------------------------------
-- Answer trust, analytics, escalation, and follow-up
-- ---------------------------------------------------------------------------

create table public.answer_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  message_id uuid,
  agent_id uuid,
  agent_version_id uuid,
  query text not null,
  answer text,
  language_code text,
  retrieved_chunk_ids uuid[] not null default '{}'::uuid[],
  retrieval_scores jsonb not null default '[]'::jsonb,
  confidence_score numeric(5,4) check (confidence_score is null or confidence_score between 0 and 1),
  trust_decision text check (trust_decision is null or trust_decision in ('answer', 'clarify', 'fallback', 'escalate')),
  used_fallback boolean not null default false,
  fallback_reason text,
  llm_provider text,
  llm_model text,
  embedding_provider text,
  embedding_model text,
  prompt_tokens integer check (prompt_tokens is null or prompt_tokens >= 0),
  completion_tokens integer check (completion_tokens is null or completion_tokens >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, message_id)
    references public.conversation_messages (organization_id, id) on delete set null (message_id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete set null (agent_id),
  foreign key (organization_id, agent_version_id)
    references public.agent_versions (organization_id, id) on delete set null (agent_version_id)
);

create table public.sentiment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  message_id uuid,
  label public.sentiment_label not null,
  score numeric(5,4) check (score is null or score between -1 and 1),
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  detected_by text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, message_id)
    references public.conversation_messages (organization_id, id) on delete set null (message_id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  description text,
  language_code text,
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique nulls not distinct (organization_id, normalized_name, language_code)
);

create table public.conversation_topics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  topic_id uuid not null,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  source text not null default 'automatic' check (source in ('automatic', 'manual', 'rule')),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (conversation_id, topic_id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, topic_id)
    references public.topics (organization_id, id) on delete cascade
);

create table public.staff_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid,
  name text not null,
  role_title text,
  phone_e164 text,
  phone_hash text,
  email extensions.citext,
  channels jsonb not null default '["voice"]'::jsonb,
  languages text[] not null default '{}'::text[],
  availability jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, location_id)
    references public.organization_locations (organization_id, id) on delete set null (location_id)
);

create table public.handoff_routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid,
  location_id uuid,
  name text not null,
  trigger_type text not null check (trigger_type in ('intent', 'sentiment', 'keyword', 'tool', 'fallback', 'manual')),
  conditions jsonb not null default '{}'::jsonb,
  target_type text not null check (target_type in ('staff', 'queue', 'phone_number', 'webhook')),
  target_config jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade,
  foreign key (organization_id, location_id)
    references public.organization_locations (organization_id, id) on delete set null (location_id)
);

create table public.escalations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null,
  route_id uuid,
  staff_contact_id uuid,
  status text not null default 'requested' check (
    status in ('requested', 'routing', 'connected', 'completed', 'failed', 'cancelled')
  ),
  reason text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  requested_at timestamptz not null default now(),
  connected_at timestamptz,
  completed_at timestamptz,
  outcome text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete cascade,
  foreign key (organization_id, route_id)
    references public.handoff_routes (organization_id, id) on delete set null (route_id),
  foreign key (organization_id, staff_contact_id)
    references public.staff_contacts (organization_id, id) on delete set null (staff_contact_id)
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  aggregate_type text,
  aggregate_id uuid,
  event_type text not null,
  idempotency_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'pending',
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 10 check (max_attempts > 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, idempotency_key)
);

create table public.followup_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid,
  caller_id uuid,
  outbox_event_id uuid,
  channel public.conversation_channel not null,
  destination_hash text not null,
  template_key text,
  body_redacted text,
  provider_name text,
  provider_message_id text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (provider_name, provider_message_id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete set null (conversation_id),
  foreign key (organization_id, caller_id)
    references public.callers (organization_id, id) on delete set null (caller_id),
  foreign key (organization_id, outbox_event_id)
    references public.outbox_events (organization_id, id) on delete set null (outbox_event_id)
);

-- ---------------------------------------------------------------------------
-- Billing and usage
-- ---------------------------------------------------------------------------

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null unique,
  name text not null,
  description text,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  base_price_minor integer not null default 0 check (base_price_minor >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'custom')),
  included_minutes integer not null default 0 check (included_minutes >= 0),
  overage_price_per_minute_minor integer not null default 0 check (overage_price_per_minute_minor >= 0),
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  billing_provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null check (
    status in ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'incomplete')
  ),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (billing_provider, provider_subscription_id)
);

create unique index subscriptions_one_current_uidx
  on public.subscriptions (organization_id)
  where status in ('trialing', 'active', 'past_due', 'paused');

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid,
  agent_id uuid,
  usage_type text not null,
  provider_name text,
  provider_event_id text,
  quantity numeric(18,6) not null check (quantity >= 0),
  unit text not null,
  unit_cost_usd numeric(18,8),
  cost_usd numeric(18,8),
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, idempotency_key),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete set null (conversation_id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete set null (agent_id)
);

create table public.usage_daily_rollups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  usage_date date not null,
  usage_type text not null,
  provider_name text not null default '',
  quantity numeric(20,6) not null default 0,
  cost_usd numeric(20,8) not null default 0,
  event_count integer not null default 0 check (event_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, usage_date, usage_type, provider_name)
);

-- ---------------------------------------------------------------------------
-- Agent evaluations
-- ---------------------------------------------------------------------------

create table public.agent_test_sets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade
);

create table public.agent_test_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  test_set_id uuid not null,
  name text not null,
  input jsonb not null,
  expected_output jsonb not null default '{}'::jsonb,
  evaluation_criteria jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, test_set_id)
    references public.agent_test_sets (organization_id, id) on delete cascade
);

create table public.agent_eval_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null,
  agent_version_id uuid not null,
  test_set_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  evaluator_provider text,
  evaluator_model text,
  total_cases integer not null default 0 check (total_cases >= 0),
  passed_cases integer not null default 0 check (passed_cases >= 0),
  aggregate_score numeric(6,5) check (aggregate_score is null or aggregate_score between 0 and 1),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  triggered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, agent_id)
    references public.voice_agents (organization_id, id) on delete cascade,
  foreign key (organization_id, agent_version_id)
    references public.agent_versions (organization_id, id) on delete cascade,
  foreign key (organization_id, test_set_id)
    references public.agent_test_sets (organization_id, id) on delete cascade
);

create table public.agent_eval_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  eval_run_id uuid not null,
  test_case_id uuid not null,
  status text not null check (status in ('passed', 'failed', 'error', 'skipped')),
  score numeric(6,5) check (score is null or score between 0 and 1),
  actual_output jsonb,
  evaluator_feedback text,
  metric_scores jsonb not null default '{}'::jsonb,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  token_usage jsonb not null default '{}'::jsonb,
  cost_usd numeric(18,8),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (eval_run_id, test_case_id),
  foreign key (organization_id, eval_run_id)
    references public.agent_eval_runs (organization_id, id) on delete cascade,
  foreign key (organization_id, test_case_id)
    references public.agent_test_cases (organization_id, id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Security and compliance
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user', 'service', 'system', 'api_key')),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  request_id text,
  ip_hash text,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caller_id uuid,
  conversation_id uuid,
  consent_type text not null check (consent_type in ('recording', 'contact', 'marketing', 'data_processing')),
  action text not null check (action in ('granted', 'denied', 'withdrawn')),
  policy_version text,
  capture_method text,
  evidence jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, caller_id)
    references public.callers (organization_id, id) on delete set null (caller_id),
  foreign key (organization_id, conversation_id)
    references public.conversations (organization_id, id) on delete set null (conversation_id)
);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  last_used_at timestamptz,
  last_used_ip_hash text,
  created_by uuid references auth.users(id) on delete set null,
  revoked_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (key_prefix),
  unique (key_hash)
);

comment on column public.provider_connections.credentials_ref is
  'Reference to an external secret manager entry. Never store raw provider credentials here.';
comment on column public.api_keys.key_hash is
  'One-way hash of the API key. The raw key must only be shown once at creation time.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index organizations_status_idx on public.organizations (status) where deleted_at is null;
create index organization_members_user_idx on public.organization_members (user_id, status);
create index organization_locations_org_active_idx on public.organization_locations (organization_id, is_active);
create index provider_connections_org_status_idx on public.provider_connections (organization_id, status);
create index voice_agents_org_status_idx on public.voice_agents (organization_id, status, created_at desc);
create index agent_versions_agent_created_idx on public.agent_versions (organization_id, agent_id, created_at desc);
create index phone_numbers_org_status_idx on public.phone_numbers (organization_id, status);
create index phone_numbers_hash_idx on public.phone_numbers (organization_id, phone_hash);

create index kb_sources_org_status_idx on public.kb_sources (organization_id, status);
create index kb_documents_org_status_created_idx on public.kb_documents (organization_id, status, created_at desc);
create index kb_document_versions_document_idx on public.kb_document_versions (organization_id, document_id, version_number desc);
create index kb_chunks_document_idx on public.kb_chunks (organization_id, document_id, chunk_index);
create index kb_chunks_content_trgm_idx on public.kb_chunks using gin (content extensions.gin_trgm_ops);
create index kb_translations_content_trgm_idx
  on public.kb_chunk_translations using gin (translated_content extensions.gin_trgm_ops);
create index kb_embeddings_org_chunk_idx on public.kb_chunk_embeddings_1536 (organization_id, chunk_id);
create index kb_embeddings_hnsw_idx
  on public.kb_chunk_embeddings_1536
  using hnsw (embedding extensions.vector_cosine_ops)
  with (m = 16, ef_construction = 64);
-- IVFFlat fallback for older pgvector versions:
-- create index kb_embeddings_ivfflat_idx on public.kb_chunk_embeddings_1536
-- using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);
create index kb_gaps_org_status_last_seen_idx on public.kb_gaps (organization_id, status, last_seen_at desc);
create index kb_gaps_question_trgm_idx on public.kb_gaps using gin (normalized_question extensions.gin_trgm_ops);

create index callers_phone_hash_idx on public.callers (organization_id, phone_hash);
create index callers_last_contacted_idx on public.callers (organization_id, last_contacted_at desc);
create index caller_memories_caller_idx on public.caller_memories (organization_id, caller_id, updated_at desc);
create index conversations_org_created_idx on public.conversations (organization_id, created_at desc);
create index conversations_org_status_idx on public.conversations (organization_id, status, created_at desc);
create index conversations_org_started_idx on public.conversations (organization_id, started_at desc);
create index conversations_agent_idx on public.conversations (organization_id, agent_id, started_at desc);
create index conversations_caller_idx on public.conversations (organization_id, caller_id, started_at desc);
create index conversation_messages_conversation_idx on public.conversation_messages (organization_id, conversation_id, sequence_number);
create index tool_calls_conversation_status_idx on public.tool_calls (organization_id, conversation_id, status);
create index answer_events_conversation_idx on public.answer_events (organization_id, conversation_id, created_at);
create index sentiment_events_conversation_idx on public.sentiment_events (organization_id, conversation_id, occurred_at);
create index topics_name_trgm_idx on public.topics using gin (normalized_name extensions.gin_trgm_ops);
create index conversation_topics_topic_idx on public.conversation_topics (organization_id, topic_id, created_at desc);
create index escalations_org_status_idx on public.escalations (organization_id, status, requested_at desc);
create index outbox_dispatch_idx on public.outbox_events (status, available_at, created_at)
  where status in ('pending', 'failed');
create index followup_messages_org_status_idx on public.followup_messages (organization_id, status, scheduled_at);

create index subscriptions_org_status_idx on public.subscriptions (organization_id, status);
create index usage_events_org_occurred_idx on public.usage_events (organization_id, occurred_at desc);
create index usage_events_conversation_idx on public.usage_events (organization_id, conversation_id);
create index usage_daily_rollups_org_date_idx on public.usage_daily_rollups (organization_id, usage_date desc);
create index agent_eval_runs_org_status_idx on public.agent_eval_runs (organization_id, status, created_at desc);
create index audit_logs_org_occurred_idx on public.audit_logs (organization_id, occurred_at desc);
create index audit_logs_resource_idx on public.audit_logs (organization_id, resource_type, resource_id);
create index consent_events_org_caller_idx on public.consent_events (organization_id, caller_id, occurred_at desc);
create index api_keys_org_status_idx on public.api_keys (organization_id, status);

-- ---------------------------------------------------------------------------
-- Security helpers and RLS
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
  );
$$;

create or replace function public.has_org_role(
  p_organization_id uuid,
  p_roles public.member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
      and om.role = any(p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, public.member_role[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.member_role[]) to authenticated;
grant execute on function public.is_org_member(uuid) to service_role;
grant execute on function public.has_org_role(uuid, public.member_role[]) to service_role;

do $$
declare
  table_name text;
  tenant_tables text[] := array[
    'organization_members', 'organization_locations', 'provider_connections',
    'voice_agents', 'agent_versions', 'agent_language_configs', 'phone_numbers',
    'kb_sources', 'kb_documents', 'kb_document_versions', 'kb_chunks',
    'kb_chunk_translations', 'kb_chunk_embeddings_1536', 'kb_gaps',
    'callers', 'caller_memories', 'conversations', 'voice_call_details',
    'conversation_messages', 'tool_calls', 'answer_events', 'sentiment_events',
    'topics', 'conversation_topics', 'staff_contacts', 'handoff_routes',
    'escalations', 'outbox_events', 'followup_messages', 'subscriptions',
    'usage_events', 'usage_daily_rollups', 'agent_test_sets', 'agent_test_cases',
    'agent_eval_runs', 'agent_eval_results', 'audit_logs', 'consent_events', 'api_keys'
  ];
begin
  alter table public.organizations enable row level security;
  alter table public.organizations force row level security;

  foreach table_name in array tenant_tables loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))',
      table_name || '_member_read',
      table_name
    );
  end loop;
end;
$$;

create policy organizations_member_read
  on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy organizations_admin_update
  on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']::public.member_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.member_role[]));

-- Organization creation and first-owner membership are intentionally service-role workflows.
create policy organization_members_owner_manage
  on public.organization_members for all to authenticated
  using (public.has_org_role(organization_id, array['owner']::public.member_role[]))
  with check (public.has_org_role(organization_id, array['owner']::public.member_role[]));

create policy organization_members_admin_insert
  on public.organization_members for insert to authenticated
  with check (
    role <> 'owner'
    and public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  );

create policy organization_members_admin_update
  on public.organization_members for update to authenticated
  using (
    role <> 'owner'
    and public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  )
  with check (
    role <> 'owner'
    and public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  );

create policy organization_members_admin_delete
  on public.organization_members for delete to authenticated
  using (
    role <> 'owner'
    and public.has_org_role(organization_id, array['owner', 'admin']::public.member_role[])
  );

create policy organization_locations_manager_manage
  on public.organization_locations for all to authenticated
  using (public.has_org_role(organization_id, array['owner', 'admin', 'manager']::public.member_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'manager']::public.member_role[]));

do $$
declare
  table_name text;
  manager_tables text[] := array[
    'voice_agents', 'agent_versions', 'agent_language_configs',
    'kb_sources', 'kb_documents', 'kb_document_versions', 'kb_chunks',
    'kb_chunk_translations', 'kb_chunk_embeddings_1536', 'kb_gaps',
    'topics', 'staff_contacts', 'handoff_routes',
    'agent_test_sets', 'agent_test_cases', 'agent_eval_runs', 'agent_eval_results'
  ];
  operator_tables text[] := array[
    'callers', 'caller_memories', 'conversations', 'voice_call_details',
    'conversation_messages', 'tool_calls', 'answer_events', 'sentiment_events',
    'conversation_topics', 'escalations', 'outbox_events', 'followup_messages'
  ];
  admin_tables text[] := array[
    'provider_connections', 'phone_numbers', 'subscriptions', 'api_keys'
  ];
begin
  foreach table_name in array manager_tables loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_org_role(organization_id, array[''owner'', ''admin'', ''manager'']::public.member_role[])) with check (public.has_org_role(organization_id, array[''owner'', ''admin'', ''manager'']::public.member_role[]))',
      table_name || '_manager_manage',
      table_name
    );
  end loop;

  foreach table_name in array operator_tables loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_org_role(organization_id, array[''owner'', ''admin'', ''manager'', ''operator'']::public.member_role[])) with check (public.has_org_role(organization_id, array[''owner'', ''admin'', ''manager'', ''operator'']::public.member_role[]))',
      table_name || '_operator_manage',
      table_name
    );
  end loop;

  foreach table_name in array admin_tables loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_org_role(organization_id, array[''owner'', ''admin'']::public.member_role[])) with check (public.has_org_role(organization_id, array[''owner'', ''admin'']::public.member_role[]))',
      table_name || '_admin_manage',
      table_name
    );
  end loop;
end;
$$;

-- Usage, rollups, audit logs, and consent events are append-only from trusted server workers.
-- Members can read them through the policies above; service_role bypasses RLS for writes.

alter table public.plans enable row level security;
create policy plans_public_read
  on public.plans for select
  using (is_active and is_public);

grant usage on schema public to anon, authenticated;
grant select on public.plans to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
  updated_tables text[] := array[
    'organizations', 'organization_members', 'organization_locations',
    'provider_connections', 'voice_agents', 'agent_versions', 'agent_language_configs',
    'phone_numbers', 'kb_sources', 'kb_documents', 'kb_chunk_translations',
    'kb_chunk_embeddings_1536', 'kb_gaps', 'callers', 'caller_memories',
    'conversations', 'voice_call_details', 'topics', 'staff_contacts',
    'handoff_routes', 'escalations', 'outbox_events', 'followup_messages',
    'plans', 'subscriptions', 'usage_daily_rollups', 'agent_test_sets',
    'agent_test_cases', 'api_keys'
  ];
begin
  foreach table_name in array updated_tables loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'set_' || table_name || '_updated_at',
      table_name
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RAG RPC
-- ---------------------------------------------------------------------------

create or replace function public.match_kb_chunks(
  p_organization_id uuid,
  p_query_embedding extensions.vector(1536),
  p_match_threshold double precision default 0.72,
  p_match_count integer default 5,
  p_language_code text default null
)
returns table (
  chunk_id uuid,
  document_id uuid,
  document_version_id uuid,
  content text,
  language_code text,
  similarity double precision,
  metadata jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_match_count < 1 or p_match_count > 50 then
    raise exception 'p_match_count must be between 1 and 50';
  end if;

  if p_match_threshold < 0 or p_match_threshold > 1 then
    raise exception 'p_match_threshold must be between 0 and 1';
  end if;

  if not coalesce((select auth.role()) = 'service_role', false)
     and not public.is_org_member(p_organization_id) then
    raise exception 'access denied' using errcode = '42501';
  end if;

  return query
  select
    c.id,
    c.document_id,
    c.document_version_id,
    c.content,
    c.language_code,
    (1 - (e.embedding <=> p_query_embedding))::double precision,
    c.metadata
  from public.kb_chunk_embeddings_1536 e
  join public.kb_chunks c
    on c.organization_id = e.organization_id
   and c.id = e.chunk_id
  join public.kb_documents d
    on d.organization_id = c.organization_id
   and d.id = c.document_id
  where e.organization_id = p_organization_id
    and d.status = 'ready'
    and (p_language_code is null or c.language_code = p_language_code)
    and 1 - (e.embedding <=> p_query_embedding) >= p_match_threshold
  order by e.embedding <=> p_query_embedding
  limit p_match_count;
end;
$$;

revoke all on function public.match_kb_chunks(
  uuid,
  extensions.vector,
  double precision,
  integer,
  text
) from public;
grant execute on function public.match_kb_chunks(
  uuid,
  extensions.vector,
  double precision,
  integer,
  text
) to authenticated;
grant execute on function public.match_kb_chunks(
  uuid,
  extensions.vector,
  double precision,
  integer,
  text
) to service_role;

-- ---------------------------------------------------------------------------
-- Dashboard views. security_invoker keeps the underlying table RLS effective.
-- ---------------------------------------------------------------------------

create view public.v_dashboard_overview
with (security_invoker = true)
as
select
  o.id as organization_id,
  coalesce(call_metrics.calls_30d, 0) as calls_30d,
  coalesce(call_metrics.call_seconds_30d, 0) as call_seconds_30d,
  coalesce(call_metrics.resolved_calls_30d, 0) as resolved_calls_30d,
  coalesce(agent_metrics.active_agents, 0) as active_agents,
  coalesce(gap_metrics.open_knowledge_gaps, 0) as open_knowledge_gaps,
  coalesce(escalation_metrics.open_escalations, 0) as open_escalations
from public.organizations o
left join lateral (
  select
    count(*) as calls_30d,
    coalesce(sum(c.duration_seconds), 0) as call_seconds_30d,
    count(*) filter (where c.resolution_status = 'resolved') as resolved_calls_30d
  from public.conversations c
  where c.organization_id = o.id
    and c.created_at >= now() - interval '30 days'
) call_metrics on true
left join lateral (
  select count(*) as active_agents
  from public.voice_agents va
  where va.organization_id = o.id
    and va.status = 'active'
) agent_metrics on true
left join lateral (
  select count(*) as open_knowledge_gaps
  from public.kb_gaps kg
  where kg.organization_id = o.id
    and kg.status in ('open', 'in_review')
) gap_metrics on true
left join lateral (
  select count(*) as open_escalations
  from public.escalations e
  where e.organization_id = o.id
    and e.status in ('requested', 'routing', 'connected')
) escalation_metrics on true;

create view public.v_language_distribution_7d
with (security_invoker = true)
as
select
  organization_id,
  coalesce(primary_language_code, 'unknown') as language_code,
  count(*) as conversation_count,
  coalesce(sum(duration_seconds), 0) as duration_seconds
from public.conversations
where created_at >= now() - interval '7 days'
group by organization_id, coalesce(primary_language_code, 'unknown');

create view public.v_hot_topics_7d
with (security_invoker = true)
as
select
  ct.organization_id,
  t.id as topic_id,
  t.name,
  t.normalized_name,
  count(*) as conversation_count,
  avg(ct.confidence) as average_confidence
from public.conversation_topics ct
join public.topics t
  on t.organization_id = ct.organization_id
 and t.id = ct.topic_id
where ct.created_at >= now() - interval '7 days'
group by ct.organization_id, t.id, t.name, t.normalized_name;

grant select on public.v_dashboard_overview to authenticated;
grant select on public.v_language_distribution_7d to authenticated;
grant select on public.v_hot_topics_7d to authenticated;

commit;
