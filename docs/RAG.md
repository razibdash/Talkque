# Retrieval-Augmented Generation

The RAG pipeline is divided into ingestion, chunking, embedding, search, and trust evaluation.

## Intended Flow

1. Store the source document and create an ingestion job.
2. Extract and normalize text with language metadata.
3. Chunk content using semantic boundaries and controlled overlap.
4. Generate embeddings through the configured provider.
5. Store vectors and content hashes in Supabase pgvector.
6. Retrieve only within the active organization and agent knowledge scope.
7. Apply a trust threshold before allowing the agent to answer.
8. Record evidence, scores, and fallbacks for auditing and knowledge-gap analysis.

Never allow a low-confidence retrieval result to be presented as a certain business fact.
