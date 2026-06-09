export type KnowledgeDocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'archived';

export type KnowledgeDocument = {
  id: string;
  organizationId: string;
  title: string;
  status: KnowledgeDocumentStatus;
  chunkCount: number;
  language: string | null;
  originalFilename: string | null;
  createdAt: string;
};

export type KnowledgeSearchResult = {
  chunkId: string;
  documentId: string;
  documentVersionId: string;
  content: string;
  similarity: number;
  languageCode: string | null;
  translated: boolean;
  metadata: Record<string, unknown>;
};
