# Talkque SaaS file structure

```txt
talkque-saas/
├── docs
│   ├── architecture-map.md
│   └── routes.md
├── src
│   ├── app
│   │   ├── (auth)
│   │   │   └── auth
│   │   │       ├── login
│   │   │       │   └── page.tsx
│   │   │       └── register
│   │   │           └── page.tsx
│   │   ├── (dashboard)
│   │   │   └── dashboard
│   │   │       ├── agents
│   │   │       │   ├── [agentId]
│   │   │       │   │   ├── versions
│   │   │       │   │   │   └── page.tsx
│   │   │       │   │   └── page.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── analytics
│   │   │       │   └── page.tsx
│   │   │       ├── automations
│   │   │       │   └── page.tsx
│   │   │       ├── billing
│   │   │       │   └── page.tsx
│   │   │       ├── calls
│   │   │       │   ├── [conversationId]
│   │   │       │   │   └── page.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── developer
│   │   │       │   └── api-keys
│   │   │       │       └── page.tsx
│   │   │       ├── evaluations
│   │   │       │   └── page.tsx
│   │   │       ├── knowledge-base
│   │   │       │   ├── documents
│   │   │       │   │   └── page.tsx
│   │   │       │   ├── gaps
│   │   │       │   │   └── page.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── organization
│   │   │       │   └── page.tsx
│   │   │       ├── settings
│   │   │       │   └── page.tsx
│   │   │       ├── team
│   │   │       │   └── page.tsx
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── (marketing)
│   │   │   └── page.tsx
│   │   ├── (onboarding)
│   │   │   └── onboarding
│   │   │       └── page.tsx
│   │   ├── api
│   │   │   ├── agents
│   │   │   │   └── route.ts
│   │   │   ├── billing
│   │   │   │   └── webhook
│   │   │   │       └── route.ts
│   │   │   ├── evaluations
│   │   │   │   └── run
│   │   │   │       └── route.ts
│   │   │   ├── health
│   │   │   │   └── route.ts
│   │   │   ├── kb
│   │   │   │   └── upload
│   │   │   │       └── route.ts
│   │   │   ├── organizations
│   │   │   │   └── route.ts
│   │   │   ├── outbox
│   │   │   │   └── process
│   │   │   │       └── route.ts
│   │   │   └── voice
│   │   │       └── webhook
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components
│   │   ├── layout
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── dashboard-topbar.tsx
│   │   │   └── marketing-nav.tsx
│   │   ├── saas
│   │   │   ├── empty-state.tsx
│   │   │   ├── metric-card.tsx
│   │   │   └── page-header.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── lib
│   │   ├── auth
│   │   │   └── current-organization.ts
│   │   ├── config
│   │   │   ├── navigation.ts
│   │   │   └── site.ts
│   │   ├── providers
│   │   │   ├── embeddings
│   │   │   │   └── openai.ts
│   │   │   ├── llm
│   │   │   │   └── groq.ts
│   │   │   ├── voice
│   │   │   │   └── livekit.ts
│   │   │   └── index.ts
│   │   ├── rag
│   │   │   ├── chunking.ts
│   │   │   └── search.ts
│   │   ├── security
│   │   │   └── phone.ts
│   │   ├── supabase
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── types
│   │   ├── database.ts
│   │   └── saas.ts
│   └── middleware.ts
├── supabase
│   └── migrations
│       └── 0001_talkque_mvp.sql
├── .env.example
├── .gitignore
├── README.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```
