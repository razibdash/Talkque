# Architecture

Talkque uses the Next.js App Router as its web and API boundary. Route groups separate marketing, authentication, onboarding, and authenticated SaaS surfaces without changing public URLs.

The application is multi-tenant. Every durable business record should carry an `organization_id`, and authorization must be enforced in Supabase Row Level Security as well as server-side application checks.

## Layers

1. `app/`: routes, layouts, route handlers, and request boundaries.
2. `components/`: domain UI and shadcn-compatible primitives.
3. `lib/`: orchestration, provider adapters, Supabase clients, and domain services.
4. `types/`: shared contracts and generated database types.
5. `supabase/`: database migrations, RLS policies, functions, and seed data.

Server Components should load initial data. Client Components should be limited to interactive UI. Provider SDKs and service-role credentials must remain server-only.

Long-running or retryable work belongs behind the outbox boundary rather than in request-response handlers.
