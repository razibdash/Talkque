import { embedWithOpenAI } from '@/lib/providers/embeddings/openai';

export async function searchKnowledgeBase(params: {
  organizationId: string;
  query: string;
  languageCode?: string;
}) {
  const embedding = await embedWithOpenAI(params.query);

  // Call Supabase RPC: match_kb_chunks(p_organization_id, p_query_embedding, p_language_code)
  return {
    query: params.query,
    embeddingDimensions: embedding.length,
    chunks: [],
  };
}
