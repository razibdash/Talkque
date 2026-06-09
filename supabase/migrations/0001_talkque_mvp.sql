-- Talkque MVP database skeleton based on Production Database Design v1.
-- Expand this with the full production schema when moving beyond MVP.

create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists citext;
create extension if not exists pg_trgm;

create type org_status as enum ('active', 'trialing', 'suspended', 'cancelled');
create type member_role as enum ('owner', 'admin', 'manager', 'agent_operator', 'viewer');
create type agent_status as enum ('draft', 'active', 'paused', 'archived');
create type conversation_channel as enum ('voice', 'whatsapp', 'sms', 'web_chat', 'email');
create type conversation_status as enum ('queued', 'in_progress', 'completed', 'failed', 'cancelled');
create type sentiment_label as enum ('positive', 'neutral', 'frustrated');
create type kb_document_status as enum ('uploaded', 'processing', 'ready', 'failed', 'archived');
create type gap_status as enum ('open', 'in_review', 'resolved', 'ignored');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  org_type text not null default 'business',
  industry text,
  country_code char(2),
  default_timezone text not null default 'UTC',
  default_locale text not null default 'en',
  default_currency char(3) not null default 'USD',
  status org_status not null default 'trialing',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider_type text not null,
  provider_name text not null,
  credentials_ref text,
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table voice_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug citext not null,
  status agent_status not null default 'draft',
  default_language_code text not null default 'en',
  default_dialect_code text,
  active_version_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table agent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_id uuid not null references voice_agents(id) on delete cascade,
  version_number int not null,
  status text not null default 'draft',
  voice_provider text not null default 'livekit',
  stt_provider text not null default 'deepgram',
  tts_provider text not null default 'elevenlabs',
  llm_provider text not null default 'groq',
  llm_model text not null default 'llama-3.3-70b-versatile',
  embedding_provider text not null default 'openai',
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dimensions int not null default 1536,
  system_prompt text not null,
  first_message jsonb not null default '{}'::jsonb,
  rag_config jsonb not null default '{"enabled": true, "match_threshold": 0.72, "match_count": 5}'::jsonb,
  created_at timestamptz not null default now(),
  unique (agent_id, version_number)
);

alter table voice_agents add constraint fk_voice_agents_active_version foreign key (active_version_id) references agent_versions(id);

create table kb_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  original_filename text,
  mime_type text,
  file_hash text,
  base_language_code text,
  status kb_document_status not null default 'uploaded',
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table kb_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  document_id uuid not null references kb_documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  content_hash text not null,
  language_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table kb_chunk_embeddings_1536 (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  chunk_id uuid not null references kb_chunks(id) on delete cascade,
  embedding_provider text not null default 'openai',
  embedding_model text not null default 'text-embedding-3-small',
  embedding vector(1536) not null,
  embedded_content_hash text not null,
  created_at timestamptz not null default now(),
  unique (chunk_id, embedding_provider, embedding_model)
);

create index idx_kb_embeddings_hnsw on kb_chunk_embeddings_1536 using hnsw (embedding vector_cosine_ops);

create table callers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  phone_e164 text,
  phone_hash text not null,
  preferred_language_code text,
  preferred_dialect_code text,
  call_count int not null default 0,
  consent_status text not null default 'unknown',
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, phone_hash)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_id uuid references voice_agents(id) on delete set null,
  agent_version_id uuid references agent_versions(id) on delete set null,
  caller_id uuid references callers(id) on delete set null,
  channel conversation_channel not null default 'voice',
  status conversation_status not null default 'queued',
  external_provider text,
  external_conversation_id text,
  primary_language_code text,
  primary_dialect_code text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_sec int,
  summary text,
  overall_sentiment sentiment_label,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (external_provider, external_conversation_id)
);

create table answer_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  query text not null,
  answer text,
  retrieved_chunk_ids uuid[] not null default array[]::uuid[],
  retrieval_scores jsonb not null default '[]'::jsonb,
  used_fallback boolean not null default false,
  confidence_score numeric(4,3),
  llm_provider text,
  embedding_provider text,
  created_at timestamptz not null default now()
);

create table kb_gaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_id uuid references voice_agents(id) on delete set null,
  question text not null,
  normalized_question text not null,
  language_code text,
  dialect_code text,
  frequency int not null default 1,
  status gap_status not null default 'open',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  agent_id uuid references voice_agents(id) on delete set null,
  usage_type text not null,
  provider_name text,
  quantity numeric(12,4) not null,
  unit text not null,
  cost_usd numeric(12,6),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create or replace function match_kb_chunks(
  p_organization_id uuid,
  p_query_embedding vector(1536),
  p_match_threshold float default 0.72,
  p_match_count int default 5
)
returns table (chunk_id uuid, document_id uuid, content text, similarity float, metadata jsonb)
language sql stable security definer set search_path = public as $$
  select c.id, c.document_id, c.content, 1 - (e.embedding <=> p_query_embedding) as similarity, c.metadata
  from kb_chunk_embeddings_1536 e
  join kb_chunks c on c.id = e.chunk_id
  where e.organization_id = p_organization_id
    and 1 - (e.embedding <=> p_query_embedding) >= p_match_threshold
  order by e.embedding <=> p_query_embedding
  limit p_match_count;
$$;

create or replace function is_org_member(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table provider_connections enable row level security;
alter table voice_agents enable row level security;
alter table agent_versions enable row level security;
alter table kb_documents enable row level security;
alter table kb_chunks enable row level security;
alter table kb_chunk_embeddings_1536 enable row level security;
alter table callers enable row level security;
alter table conversations enable row level security;
alter table answer_events enable row level security;
alter table kb_gaps enable row level security;
alter table usage_events enable row level security;
