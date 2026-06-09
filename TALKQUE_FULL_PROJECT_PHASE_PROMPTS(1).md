# Talkque — Full Project Phase-by-Phase Prompt Pack

**Role:** Senior Prompt Engineer + SaaS System Architect  
**Project:** Talkque — Global Multilingual AI Phone-Agent SaaS  
**Stack:** Next.js App Router, Tailwind CSS, Supabase, pgvector, Groq, LiveKit/Retell/Vapi-compatible voice abstraction, Deepgram, ElevenLabs, OpenAI/Cohere embeddings, WhatsApp/SMS follow-up.

---

## How to Use This Prompt Pack

Use these prompts phase by phase in Cursor, Windsurf, Claude, ChatGPT, or any coding agent. Do not run all prompts at once. Complete one phase, test it, commit it, then move to the next phase.

Recommended workflow:

1. Start with **Phase 0** for product context.
2. Run **Phase 1** to create the SaaS-ready Next.js structure.
3. Run **Phase 2** to create Supabase database migrations.
4. Continue phase by phase.
5. After each phase, run lint/build/test.
6. Commit after every successful phase.

Project principles:

- Talkque is global-first, not Bangladesh-only.
- Bangla, Sylheti, and English are the launch wedge.
- The platform must support multiple organizations, multiple agents, multiple providers, and multiple countries.
- Provider abstraction is mandatory: do not hard-code Vapi, Groq, Twilio, ElevenLabs, or OpenAI into core business logic.
- Supabase RLS is mandatory.
- RAG answers must be auditable with retrieved chunks and similarity scores.
- Usage tracking must be append-only for billing.
- Agent versions must be preserved.

---

# PHASE 0 — Product Context and Ground Rules

## Prompt

You are a senior full-stack SaaS architect and production-grade Next.js engineer.

We are building **Talkque**, a global multilingual AI phone-agent SaaS.

Talkque lets organizations create AI agents that:

- answer phone calls 24/7,
- understand multiple languages and dialects,
- search the organization’s own knowledge base,
- summarize calls,
- detect unresolved questions,
- escalate to human staff,
- send WhatsApp/SMS/email follow-ups,
- track usage and billing,
- provide analytics and trust/audit logs.

Initial launch wedge:

- Bangla,
- Sylheti dialect,
- English.

Long-term global support:

- Arabic,
- Hindi/Urdu,
- Spanish,
- French,
- other regional dialects.

Technical principles:

1. Multi-tenant SaaS from day one.
2. Every tenant-scoped table must use `organization_id`.
3. Use provider abstraction:
   - voice orchestration: LiveKit / Retell / Vapi / Bland / custom,
   - LLM: Groq / OpenAI / Anthropic,
   - embeddings: OpenAI / Cohere / Voyage / Jina,
   - STT: Deepgram / OpenAI / AssemblyAI,
   - TTS: ElevenLabs / Deepgram / OpenAI,
   - telephony: Twilio / LiveKit SIP / Telnyx.
4. Groq is used for LLM tasks, not embeddings.
5. Embeddings should default to OpenAI `text-embedding-3-small` with 1536 dimensions.
6. Supabase Postgres + pgvector is the main database.
7. RLS must be enabled for production tenant isolation.
8. Agent configuration must be versioned.
9. RAG answers must store retrieved chunks, scores, model, fallback status, and confidence.
10. Usage must be tracked through append-only `usage_events`.
11. WhatsApp/SMS/email follow-up must use an outbox pattern.
12. The dashboard should be modern SaaS style using Next.js App Router and Tailwind CSS.

When generating code:

- Use TypeScript.
- Use App Router.
- Use Tailwind CSS.
- Use server components by default.
- Use client components only when interactivity is required.
- Keep code modular.
- Use clear file names.
- Add placeholder/mock data only where real integrations are not ready.
- Do not expose secrets in frontend code.
- Avoid overengineering UI, but keep architecture scalable.

First, confirm the architecture assumptions and then wait for the next phase prompt.

---

# PHASE 1 — SaaS Next.js + Tailwind File Structure

## Prompt

You are a senior Next.js SaaS engineer.

Create the project foundation for **Talkque**, a global multilingual AI phone-agent SaaS.

Use:

- Next.js 15 App Router,
- TypeScript,
- Tailwind CSS,
- Supabase,
- shadcn/ui-compatible structure,
- provider abstraction folders,
- SaaS dashboard architecture.

Create or update this file structure:

```txt
talkque/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (onboarding)/
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── agents/[agentId]/page.tsx
│   │   ├── agents/[agentId]/versions/page.tsx
│   │   ├── calls/page.tsx
│   │   ├── calls/[conversationId]/page.tsx
│   │   ├── knowledge-base/page.tsx
│   │   ├── knowledge-base/upload/page.tsx
│   │   ├── knowledge-base/gaps/page.tsx
│   │   ├── automations/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── team/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── voice/webhook/route.ts
│   │   ├── voice/livekit/route.ts
│   │   ├── voice/retell/route.ts
│   │   ├── kb/upload/route.ts
│   │   ├── kb/search/route.ts
│   │   ├── agents/route.ts
│   │   ├── organizations/route.ts
│   │   ├── outbox/process/route.ts
│   │   ├── billing/webhook/route.ts
│   │   └── evals/run/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── marketing/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── agents/
│   ├── calls/
│   ├── knowledge-base/
│   ├── analytics/
│   ├── billing/
│   ├── settings/
│   ├── shared/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── middleware.ts
│   ├── providers/
│   │   ├── voice/
│   │   │   ├── index.ts
│   │   │   ├── livekit.ts
│   │   │   ├── retell.ts
│   │   │   ├── vapi.ts
│   │   │   └── types.ts
│   │   ├── llm/
│   │   │   ├── index.ts
│   │   │   ├── groq.ts
│   │   │   ├── openai.ts
│   │   │   └── types.ts
│   │   ├── embeddings/
│   │   │   ├── index.ts
│   │   │   ├── openai.ts
│   │   │   ├── cohere.ts
│   │   │   └── types.ts
│   │   ├── stt/
│   │   ├── tts/
│   │   ├── telephony/
│   │   └── messaging/
│   ├── rag/
│   │   ├── chunker.ts
│   │   ├── search.ts
│   │   ├── ingest.ts
│   │   └── trust.ts
│   ├── agents/
│   │   ├── prompt-builder.ts
│   │   ├── language.ts
│   │   ├── versions.ts
│   │   └── evals.ts
│   ├── calls/
│   │   ├── normalize.ts
│   │   ├── sentiment.ts
│   │   ├── topics.ts
│   │   └── memory.ts
│   ├── billing/
│   │   ├── usage.ts
│   │   └── plans.ts
│   ├── outbox/
│   │   ├── create-event.ts
│   │   └── process-event.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
│   ├── database.ts
│   ├── agents.ts
│   ├── calls.ts
│   ├── knowledge-base.ts
│   ├── providers.ts
│   └── index.ts
├── supabase/
│   ├── migrations/
│   │   └── 0001_initial_schema.sql
│   └── seed.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── PROVIDERS.md
│   ├── RAG.md
│   └── DEPLOYMENT.md
├── middleware.ts
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

Requirements:

1. Generate all folders and placeholder files.
2. Create clean `README.md` explaining Talkque.
3. Create `.env.local.example` with all required environment variable names:
   - Supabase,
   - Groq,
   - OpenAI embedding,
   - Cohere optional,
   - Deepgram,
   - ElevenLabs,
   - LiveKit,
   - Retell,
   - Vapi optional,
   - Twilio,
   - Telnyx optional,
   - WhatsApp,
   - billing provider.
4. Create a SaaS-style root layout.
5. Create placeholder dashboard pages with consistent layout.
6. Create a clean Tailwind theme:
   - dark navy/sidebar,
   - green accent,
   - neutral SaaS background,
   - responsive layout.
7. Do not implement full business logic yet.
8. Ensure `npm run build` can pass with placeholder pages.

Return:

- complete file tree,
- key files,
- commands to install dependencies,
- next steps.

---

# PHASE 2 — Supabase Production Schema Migration

## Prompt

You are a senior PostgreSQL/Supabase database architect.

Create the production-ready Supabase migration for **Talkque** based on this database design.

Talkque is a global multilingual AI phone-agent SaaS with:

- organizations,
- members,
- locations,
- provider connections,
- voice agents,
- agent versions,
- language configs,
- phone numbers,
- knowledge base/RAG,
- conversations/calls,
- caller memory,
- answer audit layer,
- sentiment/topics,
- human escalation,
- outbox/follow-up,
- billing/usage,
- agent evaluations,
- audit logs,
- consent events,
- API keys.

Create `supabase/migrations/0001_initial_schema.sql`.

Required schema components:

1. Extensions:
   - `pgcrypto`,
   - `vector`,
   - `citext`,
   - `pg_trgm`.

2. Enums:
   - `org_status`,
   - `member_role`,
   - `agent_status`,
   - `conversation_channel`,
   - `conversation_status`,
   - `call_direction`,
   - `sentiment_label`,
   - `kb_document_status`,
   - `gap_status`,
   - `outbox_status`.

3. Tenant core tables:
   - `organizations`,
   - `organization_members`,
   - `organization_locations`.

4. Provider abstraction:
   - `provider_connections`.

5. Voice agent system:
   - `voice_agents`,
   - `agent_versions`,
   - `agent_language_configs`,
   - `phone_numbers`.

6. Knowledge base/RAG:
   - `kb_sources`,
   - `kb_documents`,
   - `kb_document_versions`,
   - `kb_chunks`,
   - `kb_chunk_translations`,
   - `kb_chunk_embeddings_1536`,
   - `kb_gaps`,
   - `match_kb_chunks` RPC.

7. Caller/conversation system:
   - `callers`,
   - `caller_memories`,
   - `conversations`,
   - `voice_call_details`,
   - `conversation_messages`,
   - `tool_calls`.

8. Trust/audit answer layer:
   - `answer_events`.

9. Analytics:
   - `sentiment_events`,
   - `topics`,
   - `conversation_topics`.

10. Human escalation:
    - `staff_contacts`,
    - `handoff_routes`,
    - `escalations`.

11. Outbox/follow-up:
    - `outbox_events`,
    - `followup_messages`.

12. Billing:
    - `plans`,
    - `subscriptions`,
    - `usage_events`,
    - `usage_daily_rollups`.

13. Evaluation:
    - `agent_test_sets`,
    - `agent_test_cases`,
    - `agent_eval_runs`,
    - `agent_eval_results`.

14. Security:
    - `audit_logs`,
    - `consent_events`,
    - `api_keys`.

15. RLS helper functions:
    - `is_org_member(p_organization_id uuid)`,
    - `has_org_role(p_organization_id uuid, p_roles member_role[])`.

16. Enable RLS on all tenant-scoped tables.

17. Create practical policies:
    - org members can read tenant data,
    - owners/admins/managers can manage most org resources,
    - operators can manage conversations,
    - owners/admins can manage billing/team/settings.

18. Add `set_updated_at()` trigger function and triggers.

19. Add useful dashboard views:
    - `v_dashboard_overview`,
    - `v_language_distribution_7d`,
    - `v_hot_topics_7d`.

20. Add indexes for:
    - tenant filtering,
    - created_at queries,
    - status queries,
    - phone hashes,
    - text search via trigram,
    - vector search via HNSW.

Important:

- Use `organization_id` everywhere needed.
- Use `security definer` carefully for RPC functions.
- Use `vector(1536)` for embeddings.
- Do not store raw API keys.
- Use `credentials_ref` in provider connections.
- Prefer HNSW vector index. Include IVFFlat fallback comment.
- SQL must be runnable in Supabase SQL editor.

Return:

- complete SQL migration,
- notes about what should be adjusted before production,
- testing SQL queries to verify the schema.

---

# PHASE 3 — TypeScript Database Types and Supabase Clients

## Prompt

You are a senior TypeScript/Supabase engineer.

Implement database typing and Supabase clients for Talkque.

Files to create/update:

```txt
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
lib/supabase/middleware.ts
types/database.ts
types/index.ts
middleware.ts
```

Requirements:

1. `client.ts`
   - browser Supabase client,
   - safe for client components,
   - uses public anon key only.

2. `server.ts`
   - server component / route handler Supabase client,
   - reads cookies,
   - supports authenticated user session.

3. `admin.ts`
   - service role client,
   - server-only,
   - must throw if used in browser,
   - used for webhooks/background jobs.

4. `middleware.ts`
   - refresh Supabase session,
   - protect dashboard routes,
   - redirect unauthenticated users to `/login`,
   - redirect authenticated users away from login/signup where appropriate.

5. `types/database.ts`
   - create strong TypeScript types for key tables:
     - organizations,
     - organization_members,
     - voice_agents,
     - agent_versions,
     - agent_language_configs,
     - phone_numbers,
     - kb_documents,
     - kb_chunks,
     - kb_gaps,
     - callers,
     - conversations,
     - conversation_messages,
     - answer_events,
     - usage_events.
   - include enum types.
   - export helper aliases like `Organization`, `VoiceAgent`, `Conversation`.

6. `types/index.ts`
   - re-export all project types.

7. Add helper function:
   - `getCurrentOrganization()` placeholder,
   - `requireUser()` helper,
   - `requireOrganizationAccess()` helper.

8. Keep code production-safe:
   - no service role in frontend,
   - no secret leakage,
   - clear errors.

Return complete code for all files.

---

# PHASE 4 — SaaS Auth and Onboarding Flow

## Prompt

You are a senior SaaS product engineer.

Implement Talkque authentication and onboarding.

Pages:

```txt
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(auth)/forgot-password/page.tsx
app/(onboarding)/onboarding/page.tsx
app/api/organizations/route.ts
```

Product context:

Talkque is a global multilingual AI phone-agent SaaS. New users create an organization and configure their first AI phone agent.

Auth requirements:

1. Login page:
   - email/password login,
   - magic link optional placeholder,
   - link to signup,
   - redirect to `/dashboard` after login.

2. Signup page:
   - email/password signup,
   - collect name if needed,
   - redirect to `/onboarding`.

3. Forgot password:
   - email input,
   - send reset email using Supabase.

4. Onboarding wizard:
   - 4 steps:
     1. Organization details:
        - organization name,
        - organization type,
        - industry,
        - country,
        - timezone,
        - website.
     2. First voice agent:
        - agent name,
        - default language,
        - supported languages,
        - dialect support checkbox for Sylheti,
        - greeting message.
     3. Provider setup:
        - voice orchestration choice: LiveKit / Retell / Vapi / Custom,
        - LLM provider: Groq default,
        - embedding provider: OpenAI default,
        - STT provider: Deepgram default,
        - TTS provider: ElevenLabs default.
        - Store only provider names/config references, not raw secrets.
     4. Knowledge base starter:
        - upload later option,
        - add 3 manual FAQ fields,
        - finish setup.

5. API route `/api/organizations`:
   - create organization,
   - create organization member as owner,
   - create first voice agent,
   - create first agent version,
   - create language config rows,
   - create default provider connection records,
   - return organization and agent IDs.

6. UI style:
   - modern SaaS,
   - green accent,
   - clean cards,
   - responsive,
   - use Tailwind CSS.

7. Validation:
   - use simple TypeScript validation or zod if already installed,
   - show friendly errors.

Return complete code.

---

# PHASE 5 — Dashboard Layout and Core Navigation

## Prompt

You are a senior frontend engineer and SaaS UX designer.

Build the Talkque dashboard shell.

Files:

```txt
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
components/dashboard/sidebar.tsx
components/dashboard/topbar.tsx
components/dashboard/mobile-nav.tsx
components/dashboard/stat-card.tsx
components/dashboard/empty-state.tsx
components/shared/logo.tsx
```

Dashboard navigation:

- Overview,
- Agents,
- Calls,
- Knowledge Base,
- Automations,
- Analytics,
- Billing,
- Team,
- Settings.

Layout requirements:

1. Auth-protected dashboard.
2. Organization-aware layout.
3. Sidebar on desktop.
4. Mobile navigation for small screens.
5. Topbar showing:
   - organization name,
   - environment badge,
   - user menu placeholder.
6. Use green accent `#0d7a57`.
7. Use dark sidebar.
8. White/neutral content background.
9. Keep design SaaS-focused and global, not Bangladesh-only.

Overview page widgets:

- Calls today,
- Minutes this month,
- Active agents,
- Knowledge gaps this week,
- Recent conversations,
- Language distribution,
- Agent health,
- Setup checklist.

Use mock data for now if database queries are not implemented, but structure code so DB data can replace it later.

Return complete code.

---

# PHASE 6 — Agent Management and Versioning

## Prompt

You are a senior AI SaaS product engineer.

Implement Talkque agent management.

Pages/components:

```txt
app/(dashboard)/agents/page.tsx
app/(dashboard)/agents/[agentId]/page.tsx
app/(dashboard)/agents/[agentId]/versions/page.tsx
components/agents/agent-card.tsx
components/agents/agent-form.tsx
components/agents/language-config-editor.tsx
components/agents/provider-config-panel.tsx
components/agents/prompt-editor.tsx
components/agents/version-history.tsx
lib/agents/prompt-builder.ts
lib/agents/language.ts
lib/agents/versions.ts
app/api/agents/route.ts
```

Requirements:

1. Agents list page:
   - list voice agents,
   - status badges: draft/active/paused/archived,
   - default language,
   - provider summary,
   - create new agent button.

2. Agent detail page:
   - edit agent name/description,
   - status controls,
   - language support,
   - active version summary,
   - linked phone numbers,
   - recent calls.

3. Version page:
   - list versions,
   - show model/provider config,
   - show prompt diff placeholder,
   - publish version action,
   - create draft from active version.

4. Prompt builder:
   - function `buildAgentSystemPrompt(params)`.
   - must include:
     - organization identity,
     - agent role,
     - language/dialect instructions,
     - RAG rules,
     - no hallucination policy,
     - escalation rules,
     - caller memory rules,
     - answer style.

5. Language handler:
   - support `bn`, `en`, `ar`, `hi`, etc.
   - dialect support: `sylheti` launch wedge.
   - `detectDialectFromText()` with Sylheti markers.
   - `buildLanguageInstruction()`.

6. Provider config panel:
   - voice orchestration: LiveKit / Retell / Vapi / Bland / Custom,
   - LLM: Groq default,
   - embeddings: OpenAI default,
   - STT: Deepgram,
   - TTS: ElevenLabs.

7. API route:
   - create agent,
   - update agent,
   - create agent version,
   - publish version,
   - enforce organization access.

Use placeholder database calls if needed, but code structure should be production-ready.

Return complete code.

---

# PHASE 7 — Knowledge Base and RAG Ingestion

## Prompt

You are a senior RAG engineer.

Implement Talkque knowledge base upload, ingestion, chunking, embeddings, search, and knowledge gaps.

Files/pages:

```txt
app/(dashboard)/knowledge-base/page.tsx
app/(dashboard)/knowledge-base/upload/page.tsx
app/(dashboard)/knowledge-base/gaps/page.tsx
app/api/kb/upload/route.ts
app/api/kb/search/route.ts
lib/rag/chunker.ts
lib/rag/ingest.ts
lib/rag/search.ts
lib/rag/trust.ts
lib/providers/embeddings/index.ts
lib/providers/embeddings/openai.ts
lib/providers/embeddings/cohere.ts
lib/providers/embeddings/types.ts
components/knowledge-base/document-list.tsx
components/knowledge-base/upload-dropzone.tsx
components/knowledge-base/gap-table.tsx
components/knowledge-base/search-panel.tsx
```

Requirements:

1. Knowledge Base page:
   - list documents,
   - status: uploaded/processing/ready/failed/archived,
   - chunk count,
   - language,
   - upload button,
   - search test panel,
   - unresolved gaps banner.

2. Upload page:
   - drag/drop PDF, DOCX, TXT,
   - file validation,
   - progress UI,
   - upload to API route,
   - success state.

3. Gaps page:
   - list `kb_gaps`,
   - show frequency,
   - language/dialect,
   - confidence average,
   - status,
   - add answer action placeholder,
   - mark resolved.

4. `chunker.ts`:
   - `chunkText(text, options)`,
   - chunk by words/tokens approximation,
   - overlap support,
   - preserve source metadata.

5. `ingest.ts`:
   - create document,
   - create document version,
   - extract text,
   - chunk text,
   - hash chunks,
   - embed chunks,
   - insert into `kb_chunks` and `kb_chunk_embeddings_1536`,
   - optional translations into `kb_chunk_translations`.

6. Embedding provider abstraction:
   - interface `EmbeddingProvider`,
   - OpenAI implementation using `text-embedding-3-small`,
   - Cohere placeholder implementation,
   - never use Groq for embeddings.

7. `search.ts`:
   - embed query,
   - call Supabase RPC `match_kb_chunks`,
   - return chunks with score,
   - support language-specific translated content.

8. `trust.ts`:
   - create `answer_events`,
   - store retrieved chunk IDs,
   - scores,
   - used fallback,
   - confidence score.

9. API `/api/kb/upload`:
   - auth required,
   - organization access required,
   - file upload handling,
   - call ingestion pipeline,
   - return document and chunk count.

10. API `/api/kb/search`:
   - test search query,
   - organization access required,
   - return matching chunks and scores.

Return complete code.

---

# PHASE 8 — Voice Provider Abstraction and Webhook Handler

## Prompt

You are a senior voice AI infrastructure engineer.

Implement provider-agnostic voice orchestration for Talkque.

Files:

```txt
lib/providers/voice/types.ts
lib/providers/voice/index.ts
lib/providers/voice/livekit.ts
lib/providers/voice/retell.ts
lib/providers/voice/vapi.ts
app/api/voice/webhook/route.ts
app/api/voice/livekit/route.ts
app/api/voice/retell/route.ts
lib/calls/normalize.ts
lib/calls/sentiment.ts
lib/calls/topics.ts
lib/calls/memory.ts
```

Requirements:

1. Create provider abstraction:
   - `VoiceProviderAdapter`,
   - `createAgent()`,
   - `updateAgent()`,
   - `assignPhoneNumber()`,
   - `normalizeWebhookEvent()`,
   - `sendToolResult()` if needed.

2. Provider support:
   - LiveKit as preferred long-term provider,
   - Retell as managed alternative,
   - Vapi optional compatibility layer.

3. Webhook route `/api/voice/webhook`:
   - detect provider from headers/body/query,
   - verify webhook signature placeholder,
   - normalize event,
   - store raw payload,
   - handle event types:
     - call started,
     - transcript/message,
     - tool call,
     - call ended,
     - escalation requested.

4. Tool calls:
   - `ragLookup`:
     - detect language/dialect,
     - search KB,
     - log answer event,
     - if no answer, create/update knowledge gap,
     - return safe fallback.
   - `escalateToHuman`:
     - create escalation row,
     - create outbox notification event,
     - return transfer/handoff message.
   - `sendFollowup`:
     - create outbox event.

5. End-of-call:
   - create/update conversation,
   - create voice_call_details,
   - save transcript messages,
   - classify sentiment,
   - extract topics,
   - update caller memory if consent allows,
   - create usage events,
   - create follow-up outbox event if configured.

6. `normalize.ts`:
   - normalize provider-specific payloads into internal format.

7. `sentiment.ts`:
   - use Groq LLM provider abstraction,
   - return positive/neutral/frustrated,
   - store `sentiment_events`.

8. `topics.ts`:
   - extract top topics,
   - upsert into `topics`,
   - link to `conversation_topics`.

9. `memory.ts`:
   - caller lookup by phone hash,
   - update call_count,
   - store non-sensitive caller memory with consent check.

10. Must be safe:
    - no hallucinated answers,
    - no raw secrets,
    - idempotent webhook handling where possible,
    - log errors clearly.

Return complete code.

---

# PHASE 9 — Groq LLM Provider and AI Task Layer

## Prompt

You are a senior AI platform engineer.

Implement Talkque’s LLM provider abstraction with Groq as the default.

Files:

```txt
lib/providers/llm/types.ts
lib/providers/llm/index.ts
lib/providers/llm/groq.ts
lib/providers/llm/openai.ts
lib/calls/sentiment.ts
lib/calls/topics.ts
lib/agents/evals.ts
lib/rag/trust.ts
```

Requirements:

1. Define `LLMProvider` interface:
   - `generateText(params)`,
   - `generateJson(params)`,
   - `classify(params)`.

2. Groq provider:
   - use `GROQ_API_KEY`,
   - default model from `GROQ_MODEL`,
   - fast model from `GROQ_FAST_MODEL`,
   - support JSON-mode style output if available, otherwise robust parse fallback.

3. OpenAI provider optional fallback.

4. AI tasks:
   - sentiment classification,
   - topic extraction,
   - call summary,
   - language/dialect normalization,
   - agent eval grading.

5. Prompts must be production-safe:
   - concise,
   - deterministic,
   - low temperature,
   - no unsupported claims,
   - return strict JSON where required.

6. Implement prompt templates:
   - classify sentiment,
   - extract topics,
   - summarize call,
   - evaluate answer against expected answer,
   - normalize caller question.

7. Add error handling:
   - retry once on transient failure,
   - safe fallback on LLM failure,
   - log provider/model metadata.

8. Do not use Groq for embeddings.

Return complete code.

---

# PHASE 10 — Calls, Transcript, Trust Layer, and Caller Memory UI

## Prompt

You are a senior SaaS dashboard engineer.

Build Talkque calls and conversation UI.

Pages/components:

```txt
app/(dashboard)/calls/page.tsx
app/(dashboard)/calls/[conversationId]/page.tsx
components/calls/call-table.tsx
components/calls/call-filters.tsx
components/calls/transcript-viewer.tsx
components/calls/answer-trust-panel.tsx
components/calls/caller-memory-card.tsx
components/calls/sentiment-badge.tsx
components/calls/topic-list.tsx
```

Requirements:

1. Calls list page:
   - table of conversations,
   - filters:
     - date range,
     - agent,
     - language,
     - dialect,
     - sentiment,
     - escalated,
     - fallback used,
   - columns:
     - date/time,
     - caller,
     - agent,
     - duration,
     - language/dialect,
     - sentiment,
     - status,
     - actions.

2. Conversation detail page:
   - call metadata,
   - transcript timeline,
   - audio recording placeholder,
   - summary,
   - sentiment events,
   - detected topics,
   - caller memory,
   - escalation status,
   - follow-up messages.

3. Answer Trust Panel:
   - for each AI answer:
     - query,
     - final answer,
     - source chunks,
     - similarity scores,
     - fallback status,
     - model used,
     - confidence score.

4. Caller memory card:
   - display previous call count,
   - last contacted,
   - preferred language/dialect,
   - known interests,
   - consent status.

5. Use mock data if DB not ready, but type components correctly.

6. Design:
   - clean SaaS table,
   - badges,
   - responsive,
   - good empty states.

Return complete code.

---

# PHASE 11 — Automations, Escalations, and Outbox

## Prompt

You are a senior backend + SaaS automation engineer.

Implement Talkque automations, human escalation, and reliable outbox follow-up.

Files/pages:

```txt
app/(dashboard)/automations/page.tsx
components/automations/handoff-routes-table.tsx
components/automations/staff-contacts-table.tsx
components/automations/outbox-table.tsx
components/automations/followup-template-card.tsx
lib/outbox/create-event.ts
lib/outbox/process-event.ts
app/api/outbox/process/route.ts
lib/providers/messaging/whatsapp.ts
lib/providers/messaging/sms.ts
lib/providers/messaging/email.ts
```

Requirements:

1. Automations page sections:
   - staff contacts,
   - handoff routes,
   - escalation rules,
   - follow-up messages,
   - outbox queue health.

2. Staff contacts:
   - name,
   - role,
   - department,
   - phone,
   - WhatsApp,
   - email,
   - availability.

3. Handoff routes:
   - trigger type:
     - frustrated sentiment,
     - no answer found,
     - keyword,
     - topic,
     - VIP caller,
     - business hours,
   - route to staff contact or fallback phone.

4. Outbox pattern:
   - `createOutboxEvent()` inserts pending event.
   - `processOutboxEvent()` sends event through proper provider.
   - update status to sent/failed.
   - retry attempts.

5. Messaging providers:
   - WhatsApp Business API implementation,
   - SMS placeholder,
   - email placeholder.

6. API route `/api/outbox/process`:
   - protected with CRON secret,
   - processes pending events,
   - returns count.

7. Do not send WhatsApp directly inside voice webhook.

8. Add useful error logs.

Return complete code.

---

# PHASE 12 — Analytics Dashboard and Usage Billing

## Prompt

You are a senior SaaS analytics and billing engineer.

Implement Talkque analytics and billing views.

Pages/components:

```txt
app/(dashboard)/analytics/page.tsx
app/(dashboard)/billing/page.tsx
components/analytics/calls-chart.tsx
components/analytics/language-distribution.tsx
components/analytics/sentiment-breakdown.tsx
components/analytics/hot-topics.tsx
components/analytics/peak-hours-heatmap.tsx
components/billing/usage-summary.tsx
components/billing/plan-card.tsx
components/billing/invoice-list.tsx
lib/billing/usage.ts
lib/billing/plans.ts
```

Requirements:

1. Analytics page:
   - calls per day,
   - language/dialect distribution,
   - sentiment breakdown,
   - hot topics,
   - peak hours,
   - knowledge gaps trend,
   - fallback rate,
   - escalation rate.

2. Billing page:
   - current plan,
   - included minutes,
   - used minutes,
   - estimated cost,
   - usage breakdown by type,
   - upgrade plan cards,
   - invoice placeholder.

3. Usage logic:
   - use append-only `usage_events`,
   - aggregate daily/monthly usage,
   - do not rely only on counters.

4. Charts:
   - use lightweight chart components if installed,
   - otherwise create clean placeholder chart cards with data-ready props.

5. Plans:
   - Starter,
   - Growth,
   - Enterprise,
   - global pricing configurable by currency.

6. Keep the product global:
   - USD default,
   - support BDT/GBP/AED later through `default_currency`.

Return complete code.

---

# PHASE 13 — Agent Evaluation and Quality Gate

## Prompt

You are a senior AI evaluation engineer.

Implement Talkque’s agent testing and evaluation system.

Files/pages:

```txt
app/(dashboard)/agents/[agentId]/evals/page.tsx
components/agents/evals/test-set-list.tsx
components/agents/evals/test-case-table.tsx
components/agents/evals/eval-run-summary.tsx
components/agents/evals/eval-result-table.tsx
lib/agents/evals.ts
app/api/evals/run/route.ts
```

Requirements:

1. Eval page:
   - list test sets,
   - create test cases,
   - run evaluation,
   - show score,
   - show pass/fail cases,
   - show retrieved chunks and actual answer.

2. Test case fields:
   - question,
   - expected answer,
   - language,
   - dialect,
   - expected source keywords,
   - must-not-contain terms.

3. Eval run:
   - use active or selected agent version,
   - run RAG search,
   - generate answer using provider abstraction,
   - grade answer with Groq fast model,
   - store `agent_eval_runs`,
   - store `agent_eval_results`.

4. Quality gate:
   - if score is below threshold, warn admin before publishing agent version.

5. Keep everything auditable.

Return complete code.

---

# PHASE 14 — Settings, Team, Provider Connections, and API Keys

## Prompt

You are a senior SaaS settings and admin engineer.

Implement Talkque settings, team management, provider connections, and API keys.

Pages/components:

```txt
app/(dashboard)/settings/page.tsx
app/(dashboard)/team/page.tsx
components/settings/organization-settings.tsx
components/settings/provider-connections.tsx
components/settings/language-settings.tsx
components/settings/security-settings.tsx
components/team/member-table.tsx
components/team/invite-member-form.tsx
components/settings/api-key-table.tsx
```

Requirements:

1. Organization settings:
   - name,
   - slug,
   - industry,
   - country,
   - timezone,
   - locale,
   - currency,
   - website,
   - support email.

2. Provider connections:
   - voice orchestration provider,
   - LLM provider,
   - embedding provider,
   - STT provider,
   - TTS provider,
   - telephony provider,
   - messaging provider.
   - Store provider metadata/config references, not raw API keys.

3. Language settings:
   - enabled languages,
   - dialect configs,
   - Sylheti markers,
   - default response language.

4. Security settings:
   - audit log placeholder,
   - consent settings,
   - data retention settings.

5. Team page:
   - list organization members,
   - role badges,
   - invite member form,
   - role update placeholder.

6. API keys:
   - create key placeholder,
   - show prefix only,
   - never show full key after creation,
   - scopes.

Return complete code.

---

# PHASE 15 — Marketing Landing Page for Global SaaS

## Prompt

You are a senior SaaS landing page copywriter and frontend engineer.

Build the Talkque marketing landing page.

File:

```txt
app/(marketing)/page.tsx
components/marketing/*
```

Positioning:

Talkque is a multilingual AI phone-agent platform for organizations that cannot afford to miss calls.

It is global-first, with a strong Bangla/Sylheti launch wedge.

Hero copy:

Headline options:

- “Never miss another customer call.”
- “AI phone agents that speak your customer’s language.”
- “Answer every call, 24/7, in any language.”

Subheadline:

“Talkque helps organizations answer phone calls instantly, search their own knowledge base, escalate when needed, and send follow-up messages — across languages and dialects.”

Sections:

1. Hero:
   - dark background,
   - green accent,
   - CTA: Start free trial,
   - CTA: Book demo,
   - stats:
     - 24/7 calls,
     - multilingual,
     - RAG-powered,
     - human handoff.

2. Problem:
   - missed calls,
   - overloaded staff,
   - repeated questions,
   - multilingual callers,
   - no visibility into call topics.

3. Solution:
   - AI phone agents,
   - knowledge-base answers,
   - dialect intelligence,
   - trust/audit layer,
   - WhatsApp/SMS follow-ups.

4. Use cases:
   - education,
   - healthcare,
   - clinics,
   - local services,
   - immigration/legal,
   - real estate,
   - global support teams.

5. Demo simulation:
   - caller asks question,
   - Talkque searches KB,
   - answer with source confidence,
   - follow-up message.

6. Unique features:
   - dialect intelligence,
   - answer trust layer,
   - knowledge-gap auto-improvement,
   - caller memory with consent,
   - agent eval before publish,
   - provider-agnostic architecture.

7. Pricing:
   - Starter,
   - Growth,
   - Enterprise.

8. FAQ.

9. Footer.

Design:

- Tailwind only,
- modern SaaS,
- responsive,
- green accent,
- clean typography,
- global positioning.

Return complete code.

---

# PHASE 16 — Testing, Seed Data, and Developer Experience

## Prompt

You are a senior developer experience engineer.

Create testing, seed data, and developer scripts for Talkque.

Files:

```txt
supabase/seed.sql
scripts/seed-demo.ts
scripts/test-supabase.ts
scripts/test-embedding.ts
scripts/test-groq.ts
scripts/test-rag.ts
scripts/test-webhook.ts
docs/LOCAL_DEV.md
docs/TESTING.md
```

Requirements:

1. Seed data:
   - demo organization,
   - demo owner placeholder,
   - demo voice agent,
   - active agent version,
   - language configs for English, Bangla, Sylheti,
   - provider connections,
   - sample KB document/chunks,
   - sample conversations,
   - sample gaps,
   - sample usage events.

2. Test scripts:
   - Supabase connection,
   - RLS sanity check placeholder,
   - embedding generation,
   - Groq completion,
   - RAG search,
   - webhook normalization,
   - outbox processing.

3. Docs:
   - local dev setup,
   - required env vars,
   - Supabase migration steps,
   - seed steps,
   - common errors.

4. Add package.json scripts:
   - `db:seed`,
   - `test:supabase`,
   - `test:embedding`,
   - `test:groq`,
   - `test:rag`,
   - `test:webhook`.

Return complete code and commands.

---

# PHASE 17 — Deployment and Production Readiness

## Prompt

You are a senior production deployment engineer.

Prepare Talkque for deployment.

Files:

```txt
vercel.json
docs/DEPLOYMENT.md
docs/PRODUCTION_CHECKLIST.md
docs/SECURITY_CHECKLIST.md
docs/FIRST_CUSTOMER_RUNBOOK.md
```

Requirements:

1. Vercel deployment config.
2. Environment variable checklist:
   - Supabase URL,
   - Supabase anon key,
   - Supabase service role key,
   - Groq key,
   - OpenAI embedding key,
   - Cohere optional,
   - Deepgram key,
   - ElevenLabs key,
   - LiveKit URL/API key/API secret,
   - Retell key optional,
   - Vapi key optional,
   - Twilio/Telnyx keys,
   - WhatsApp Business token,
   - cron secret,
   - billing provider secrets.

3. Supabase production checklist:
   - run migrations,
   - enable RLS,
   - check policies,
   - storage buckets,
   - backup settings,
   - connection pooling.

4. Security checklist:
   - no service role in frontend,
   - webhook signature verification,
   - API key hashing,
   - audit logs,
   - consent handling,
   - data retention,
   - rate limiting.

5. Voice provider setup:
   - LiveKit recommended,
   - Retell managed alternative,
   - Twilio/SIP setup,
   - webhook URLs.

6. First customer runbook:
   - create organization,
   - configure providers,
   - create first agent,
   - upload KB,
   - run eval tests,
   - assign phone number,
   - test 10 sample calls,
   - monitor dashboard,
   - go live.

7. Production readiness checklist:
   - build passes,
   - lint passes,
   - database migration applied,
   - RLS tested,
   - webhook tested,
   - RAG tested,
   - outbox tested,
   - billing tested,
   - monitoring enabled.

Return complete docs and config.

---

# PHASE 18 — Final QA and Refactor Prompt

## Prompt

You are a senior code reviewer and SaaS launch engineer.

Review the entire Talkque codebase for production readiness.

Focus areas:

1. Architecture:
   - provider abstraction,
   - tenant isolation,
   - modularity,
   - no Bangladesh-only hard-coding,
   - global language support.

2. Security:
   - no leaked secrets,
   - RLS usage,
   - service role isolation,
   - webhook verification,
   - API route auth,
   - input validation,
   - API key hashing.

3. Database:
   - all tenant tables use `organization_id`,
   - indexes are correct,
   - migrations are runnable,
   - views are valid,
   - vector search function works.

4. AI/RAG:
   - Groq only used for LLM tasks,
   - embeddings use OpenAI/Cohere abstraction,
   - answer_events store trust data,
   - KB gaps are logged,
   - fallback behavior is safe.

5. Voice pipeline:
   - webhook normalization,
   - idempotency,
   - call end handling,
   - tool calls,
   - escalation,
   - outbox follow-up.

6. UI:
   - responsive,
   - clean SaaS layout,
   - useful empty states,
   - no broken links,
   - accessible buttons/forms.

7. Billing:
   - usage events append-only,
   - rollups not source of truth,
   - plan limits enforced or documented.

8. Testing:
   - local dev docs,
   - test scripts,
   - seed data,
   - production checklist.

Return:

- critical issues,
- high-priority fixes,
- medium-priority improvements,
- nice-to-have improvements,
- exact file-by-file refactor instructions,
- final launch checklist.

---

# Bonus Prompt — Generate One Phase at a Time With Strict Output

Use this wrapper if your coding agent tends to over-generate.

## Prompt

You are working on Talkque. Implement only the requested phase.

Rules:

1. Do not modify unrelated files.
2. Do not skip required files.
3. Do not use fake secrets.
4. Do not hard-code a single provider.
5. Do not hard-code Bangladesh-only assumptions.
6. Use TypeScript.
7. Use Tailwind CSS.
8. Prefer server components unless interactivity is required.
9. Return a summary of changed files.
10. Return any commands I need to run.
11. Return any environment variables I need to add.
12. Return testing steps.

Now implement this phase:

[PASTE PHASE PROMPT HERE]

---

# Bonus Prompt — Database Safety Review

## Prompt

You are a senior PostgreSQL/Supabase security reviewer.

Review the Talkque database migration for:

- tenant isolation,
- RLS completeness,
- unsafe `security definer` functions,
- missing indexes,
- missing foreign keys,
- poor cascade behavior,
- PII risk,
- billing usage correctness,
- vector search performance,
- webhook idempotency support,
- auditability.

Return:

1. Critical risks.
2. SQL fixes.
3. Recommended indexes.
4. RLS policy corrections.
5. Production checklist.

---

# Bonus Prompt — UI Consistency Review

## Prompt

You are a senior SaaS UI/UX reviewer.

Review the Talkque frontend for:

- consistent navigation,
- responsive design,
- SaaS visual polish,
- accessibility,
- empty states,
- loading states,
- error states,
- forms,
- dashboard information hierarchy,
- global positioning copy.

Return exact improvements by file and component.

