import 'server-only';

import type { Json } from '@/types/database';
import type { KnowledgeSearchResult } from '@/types/knowledge-base';
import { getConfiguredEmbeddingProvider } from '@/lib/providers/embeddings';
import {
  createSupabaseServerClient,
  type ServerSupabaseClient,
} from '@/lib/supabase/server';

export type KnowledgeSearchOptions = {
  languageCode?: string | null;
  dialectCode?: string | null;
  threshold?: number;
  limit?: number;
  client?: ServerSupabaseClient;
};

function vectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}

function toMetadata(value: Json): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function searchKnowledgeBase(
  organizationId: string,
  query: string,
  options: KnowledgeSearchOptions = {},
): Promise<KnowledgeSearchResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const provider = getConfiguredEmbeddingProvider();
  const [queryEmbedding] = await provider.embed([normalizedQuery], { inputType: 'query' });
  const supabase = options.client ?? (await createSupabaseServerClient());
  const rpcResult = await supabase.rpc('match_kb_chunks', {
    p_organization_id: organizationId,
    p_query_embedding: vectorLiteral(queryEmbedding),
    p_match_threshold: options.threshold ?? 0.5,
    p_match_count: Math.min(50, Math.max(1, options.limit ?? 5)),
    // Search the multilingual embedding space, then substitute a requested translation below.
    p_language_code: null,
  });

  if (rpcResult.error) {
    throw new Error(`Knowledge search failed: ${rpcResult.error.message}`);
  }

  const matches = rpcResult.data ?? [];
  const translations = new Map<
    string,
    { translated_content: string; language_code: string; dialect_code: string | null }
  >();

  if (options.languageCode && matches.length) {
    let translationQuery = supabase
      .from('kb_chunk_translations')
      .select('chunk_id, translated_content, language_code, dialect_code')
      .eq('organization_id', organizationId)
      .eq('language_code', options.languageCode)
      .in(
        'chunk_id',
        matches.map((match) => match.chunk_id),
      );

    if (options.dialectCode) {
      translationQuery = translationQuery.eq('dialect_code', options.dialectCode);
    }

    const translationResult = await translationQuery;
    if (translationResult.error) {
      throw new Error(`Unable to load chunk translations: ${translationResult.error.message}`);
    }

    for (const translation of translationResult.data) {
      translations.set(translation.chunk_id, translation);
    }
  }

  return matches.map((match) => {
    const translation = translations.get(match.chunk_id);
    return {
      chunkId: match.chunk_id,
      documentId: match.document_id,
      documentVersionId: match.document_version_id,
      content: translation?.translated_content ?? match.content,
      similarity: match.similarity,
      languageCode: translation?.language_code ?? match.language_code,
      translated: Boolean(translation),
      metadata: toMetadata(match.metadata),
    };
  });
}
