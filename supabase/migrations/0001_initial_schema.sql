-- Talkque initial multi-tenant SaaS schema.

create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists citext;

create type public.organization_status as enum ('trialing', 'active', 'suspended', 'cancelled');
create type public.member_role as enum ('owner', 'admin', 'manager', 'operator', 'viewer');
create type public.agent_status as enum ('draft', 'active', 'paused', 'archived');
create type public.conversation_status as enum ('queued', 'in_progress', 'completed', 'failed', 'cancelled');
create type public.document_status as enum ('uploaded', 'processing', 'ready', 'failed', 'archived');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  country_code char(2),
  default_timezone text not null default 'UTC',
  default_locale text not null default 'en',
  status public.organization_status not null default 'trialing',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category text not null,
  provider text not null,
  credentials_ref text,
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, category, provider)
);

create table public.voice_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug citext not null,
  status public.agent_status not null default 'draft',
  default_language text not null default 'en',
  active_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.agent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.voice_agents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  system_prompt text not null,
  first_message jsonb not null default '{}'::jsonb,
  provider_config jsonb not null default '{}'::jsonb,
  rag_config jsonb not null default '{"enabled":true,"threshold":0.72,"limit":5}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (agent_id, version_number)
);

alter table public.voice_agents
  add constraint voice_agents_active_version_fk
  foreign key (active_version_id) references public.agent_versions(id);

create table public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  source_type text not null default 'upload',
  storage_path text,
  language text,
  status public.document_status not null default 'uploaded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  content_hash text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index kb_chunks_embedding_hnsw
  on public.kb_chunks using hnsw (embedding vector_cosine_ops);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.voice_agents(id) on delete set null,
  agent_version_id uuid references public.agent_versions(id) on delete set null,
  provider text,
  external_id text,
  status public.conversation_status not null default 'queued',
  language text,
  duration_seconds integer,
  summary text,
  sentiment text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  usage_type text not null,
  provider text,
  quantity numeric(14,4) not null,
  unit text not null,
  cost_usd numeric(14,6),
  occurred_at timestamptz not null default now()
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.provider_connections enable row level security;
alter table public.voice_agents enable row level security;
alter table public.agent_versions enable row level security;
alter table public.kb_documents enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.usage_events enable row level security;
alter table public.outbox_events enable row level security;

create policy "members can view organizations"
  on public.organizations for select
  using (public.is_organization_member(id));

create policy "members can view memberships"
  on public.organization_members for select
  using (public.is_organization_member(organization_id));

create policy "members can access providers"
  on public.provider_connections for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "members can access agents"
  on public.voice_agents for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "members can access agent versions"
  on public.agent_versions for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "members can access documents"
  on public.kb_documents for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "members can access chunks"
  on public.kb_chunks for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create policy "members can view conversations"
  on public.conversations for select
  using (public.is_organization_member(organization_id));

create policy "members can view usage"
  on public.usage_events for select
  using (public.is_organization_member(organization_id));

create policy "members can view outbox"
  on public.outbox_events for select
  using (public.is_organization_member(organization_id));
