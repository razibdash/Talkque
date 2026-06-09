# Database

The initial Supabase schema establishes organizations, memberships, provider connections, agents, immutable agent versions, knowledge documents and chunks, conversations, usage, and retrieval support through pgvector.

## Rules

- Use UUID primary keys and UTC timestamps.
- Scope tenant data by `organization_id`.
- Enable Row Level Security for all tenant tables.
- Keep provider credentials outside ordinary table columns; store references to a secret manager.
- Treat published agent versions as immutable.
- Record usage and external webhook IDs idempotently.

`types/database.ts` is a compact placeholder. Replace it with generated Supabase types after applying migrations:

```bash
npx supabase gen types typescript --local > types/database.ts
```
