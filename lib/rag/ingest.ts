export type IngestDocumentInput = {
  organizationId: string;
  title: string;
  content: string;
  language?: string;
};

export async function ingestDocument(_input: IngestDocumentInput) {
  void _input;
  throw new Error('Knowledge ingestion is not implemented.');
}
