# Talkque Architecture Map

This file maps the Next.js routes to the database design.

## SaaS core

- `/onboarding` -> organizations, organization_members, provider_connections, voice_agents
- `/dashboard/organization` -> organizations, organization_locations
- `/dashboard/team` -> organization_members
- `/dashboard/billing` -> plans, subscriptions, usage_events, usage_daily_rollups

## AI agent core

- `/dashboard/agents` -> voice_agents
- `/dashboard/agents/[agentId]` -> agent_versions, agent_language_configs
- `/dashboard/settings` -> provider_connections
- `/dashboard/developer/api-keys` -> api_keys

## Knowledge base

- `/dashboard/knowledge-base` -> kb_sources, kb_documents, kb_chunks, embeddings
- `/dashboard/knowledge-base/gaps` -> kb_gaps

## Conversations and calls

- `/dashboard/calls` -> conversations, voice_call_details, callers
- `/dashboard/calls/[conversationId]` -> conversation_messages, tool_calls, answer_events, sentiment_events

## Automation

- `/dashboard/automations` -> staff_contacts, handoff_routes, escalations, outbox_events, followup_messages

## Quality

- `/dashboard/evaluations` -> agent_test_sets, agent_test_cases, agent_eval_runs, agent_eval_results
