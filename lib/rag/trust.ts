import 'server-only';

import type { Json } from '@/types/database';
import type { KnowledgeSearchResult } from '@/types/knowledge-base';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type TrustDecision = {
  canAnswer: boolean;
  confidence: number;
  reason: string;
};

export type RecordAnswerEventInput = {
  organizationId: string;
  conversationId: string;
  messageId?: string | null;
  agentId?: string | null;
  agentVersionId?: string | null;
  query: string;
  answer?: string | null;
  languageCode?: string | null;
  retrievedChunks: Pick<KnowledgeSearchResult, 'chunkId' | 'similarity'>[];
  usedFallback: boolean;
  confidenceScore: number;
  fallbackReason?: string | null;
  trustDecision?: 'answer' | 'clarify' | 'fallback' | 'escalate' | null;
  llmProvider?: string | null;
  llmModel?: string | null;
  latencyMs?: number | null;
  metadata?: Record<string, Json | undefined>;
};

export function evaluateRetrievalTrust(scores: number[], threshold = 0.72): TrustDecision {
  const confidence = Math.min(1, Math.max(...scores, 0));
  return {
    canAnswer: confidence >= threshold,
    confidence,
    reason: confidence >= threshold ? 'retrieval_threshold_met' : 'insufficient_evidence',
  };
}

export async function recordAnswerEvent(input: RecordAnswerEventInput) {
  const providerName = process.env.EMBEDDING_PROVIDER?.toLowerCase() || 'openai';
  if (providerName === 'groq') {
    throw new Error('Groq cannot be recorded as an embedding provider.');
  }

  const admin = createSupabaseAdminClient();
  const result = await admin
    .from('answer_events')
    .insert({
      organization_id: input.organizationId,
      conversation_id: input.conversationId,
      message_id: input.messageId ?? null,
      agent_id: input.agentId ?? null,
      agent_version_id: input.agentVersionId ?? null,
      query: input.query,
      answer: input.answer ?? null,
      language_code: input.languageCode ?? null,
      retrieved_chunk_ids: input.retrievedChunks.map((chunk) => chunk.chunkId),
      retrieval_scores: input.retrievedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        score: chunk.similarity,
      })) as Json,
      confidence_score: Math.min(1, Math.max(0, input.confidenceScore)),
      trust_decision:
        input.trustDecision ?? (input.usedFallback ? 'fallback' : 'answer'),
      used_fallback: input.usedFallback,
      fallback_reason: input.fallbackReason ?? null,
      llm_provider: input.llmProvider ?? null,
      llm_model: input.llmModel ?? null,
      embedding_provider: providerName,
      embedding_model: 'text-embedding-3-small',
      latency_ms: input.latencyMs ?? null,
      metadata: (input.metadata ?? {}) as Json,
    })
    .select('*')
    .single();

  if (result.error) {
    throw new Error(`Unable to record answer event: ${result.error.message}`);
  }

  return result.data;
}
