# Deployment

Deploy the Next.js application to a Node.js-compatible platform and provision Supabase separately.

## Checklist

- Configure all required environment variables from `.env.local.example`.
- Apply Supabase migrations and verify Row Level Security policies.
- Register public HTTPS webhook URLs with voice, telephony, messaging, and billing providers.
- Keep service-role and provider secrets server-side.
- Configure a durable worker or scheduled job for outbox processing.
- Add error tracking, structured logs, tracing, and uptime checks.
- Run `npm run typecheck` and `npm run build` in CI.

For production, pin provider SDK versions, configure secret rotation, and define regional data-retention requirements before accepting customer calls.
