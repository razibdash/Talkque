import type { KnowledgeSearchResult } from '@/types/knowledge-base';

export async function searchKnowledgeBase(
  _organizationId: string,
  _query: string,
): Promise<KnowledgeSearchResult[]> {
  void _organizationId;
  void _query;
  return [];
}
