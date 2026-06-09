# Database

The initial Supabase migration is the production schema foundation for Talkque. It covers tenant
management, provider abstraction, versioned multilingual agents, RAG, calls, answer trust, analytics,
escalation, follow-up, billing, evaluations, and compliance.

## Apply

Run the migration against a fresh Supabase project:

```bash
npx supabase db reset
```

For a linked remote project:

```bash
npx supabase db push
```

The migration can also be pasted into the Supabase SQL editor and executed once.

## Production Adjustments

- Confirm the project runs PostgreSQL 15 or newer. The RLS-safe views use `security_invoker`, and
  composite foreign keys use column-specific `ON DELETE SET NULL`.
- Decide whether raw caller phone numbers may be stored. For stricter privacy, keep only encrypted
  E.164 values in a vault and retain deterministic hashes for lookup.
- Connect `credentials_ref` to Supabase Vault or an external secret manager. Never place provider
  secrets in `provider_connections.config`.
- Generate API keys with cryptographically secure randomness, store only `key_hash`, and show the raw
  key once.
- Create organizations and their first owner in one trusted service-role transaction. Client-side
  organization bootstrap is intentionally blocked by RLS.
- Add immutable-version enforcement before publishing agents if edits to published versions must be
  prohibited at the database layer.
- Tune HNSW parameters after measuring the corpus. At very large tenant counts, consider partitioning
  embeddings or maintaining per-tenant indexes to improve filtered vector search.
- Add retention and redaction jobs for transcripts, recordings, tool payloads, audit data, and caller
  memory according to each deployment region.
- Keep usage, audit, consent, and outbox writes behind trusted server workers with idempotency keys.
- Regenerate TypeScript database types after every migration:

```bash
npx supabase gen types typescript --local > types/database.ts
```

## Verification Queries

Confirm required extensions:

```sql
select extname, extversion
from pg_extension
where extname in ('pgcrypto', 'vector', 'citext', 'pg_trgm')
order by extname;
```

Confirm tables and views:

```sql
select table_type, table_name
from information_schema.tables
where table_schema = 'public'
order by table_type, table_name;
```

Confirm RLS is enabled and forced on tenant tables:

```sql
select relname, relrowsecurity, relforcerowsecurity
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
  and relkind = 'r'
order by relname;
```

Inspect policies:

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Confirm vector and trigram indexes:

```sql
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and (
    indexdef ilike '%hnsw%'
    or indexdef ilike '%gin_trgm_ops%'
  )
order by tablename, indexname;
```

Test tenant isolation using an existing Auth user and organization membership:

```sql
begin;
select set_config(
  'request.jwt.claims',
  '{"sub":"REPLACE_WITH_AUTH_USER_UUID","role":"authenticated"}',
  true
);
set local role authenticated;

select public.is_org_member('REPLACE_WITH_ORGANIZATION_UUID');
select * from public.v_dashboard_overview;

rollback;
```

Test vector search after inserting a ready document, chunk, and embedding:

```sql
select *
from public.match_kb_chunks(
  'REPLACE_WITH_ORGANIZATION_UUID',
  array_fill(0.001::real, array[1536])::extensions.vector,
  0.0,
  5,
  null
);
```

Check cross-tenant foreign-key protection by attempting to associate an agent from one organization
with a location from another. The statement must fail:

```sql
update public.voice_agents
set location_id = 'LOCATION_UUID_FROM_ANOTHER_ORG'
where id = 'AGENT_UUID';
```
