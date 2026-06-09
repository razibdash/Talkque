export type KnowledgeDocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'archived';

export type KnowledgeDocument = {
  id: string;
  organizationId: string;
  title: string;
  status: KnowledgeDocumentStatus;
};

export type KnowledgeSearchResult = {
  chunkId: string;
  content: string;
  similarity: number;
};
