import 'server-only';

import { createHash } from 'node:crypto';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import type { Json } from '@/types/database';
import { getConfiguredEmbeddingProvider } from '@/lib/providers/embeddings';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { chunkText, type ChunkOptions } from './chunker';

export type IngestTranslation = {
  languageCode: string;
  dialectCode?: string | null;
  chunks: string[];
  provider?: string;
  model?: string;
};

export type IngestDocumentInput = {
  organizationId: string;
  userId?: string | null;
  title: string;
  filename?: string;
  mimeType?: string;
  language?: string;
  content?: string;
  fileBuffer?: Buffer;
  sourceId?: string | null;
  metadata?: Record<string, Json | undefined>;
  chunkOptions?: ChunkOptions;
  translations?: IngestTranslation[];
};

export type IngestDocumentResult = {
  documentId: string;
  documentVersionId: string;
  chunkCount: number;
  status: 'ready';
};

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const TEXT_MIMES = new Set(['text/plain', 'text/markdown', 'text/csv']);

function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeExtractedText(value: string) {
  return value
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractDocumentText(input: {
  content?: string;
  fileBuffer?: Buffer;
  mimeType?: string;
  filename?: string;
}) {
  if (typeof input.content === 'string') {
    return { text: normalizeExtractedText(input.content), parserName: 'plain-text' };
  }

  if (!input.fileBuffer) {
    throw new Error('No document content was provided.');
  }

  const mimeType = input.mimeType?.toLowerCase();
  const extension = input.filename?.toLowerCase().split('.').pop();

  if (mimeType === PDF_MIME || extension === 'pdf') {
    const parsed = await pdfParse(input.fileBuffer);
    return { text: normalizeExtractedText(parsed.text), parserName: 'pdf-parse' };
  }

  if (mimeType === DOCX_MIME || extension === 'docx') {
    const parsed = await mammoth.extractRawText({ buffer: input.fileBuffer });
    return { text: normalizeExtractedText(parsed.value), parserName: 'mammoth' };
  }

  if (!mimeType || TEXT_MIMES.has(mimeType) || extension === 'txt') {
    return {
      text: normalizeExtractedText(input.fileBuffer.toString('utf8')),
      parserName: 'plain-text',
    };
  }

  throw new Error(`Unsupported document type: ${input.mimeType ?? input.filename ?? 'unknown'}`);
}

function vectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}

export async function ingestDocument(
  input: IngestDocumentInput,
): Promise<IngestDocumentResult> {
  const admin = createSupabaseAdminClient();
  const originalBytes = input.fileBuffer ?? Buffer.from(input.content ?? '', 'utf8');
  let documentId: string | null = null;
  let versionId: string | null = null;

  try {
    const documentResult = await admin
      .from('kb_documents')
      .insert({
        organization_id: input.organizationId,
        source_id: input.sourceId ?? null,
        title: input.title,
        original_filename: input.filename ?? null,
        mime_type: input.mimeType ?? 'text/plain',
        base_language_code: input.language ?? null,
        status: 'uploaded',
        metadata: (input.metadata ?? {}) as Json,
        created_by: input.userId ?? null,
      })
      .select('*')
      .single();

    if (documentResult.error) {
      throw new Error(`Unable to create document: ${documentResult.error.message}`);
    }

    documentId = documentResult.data.id;
    await admin
      .from('kb_documents')
      .update({ status: 'processing' })
      .eq('organization_id', input.organizationId)
      .eq('id', documentId);

    const extracted = await extractDocumentText(input);
    if (!extracted.text) {
      throw new Error('The document did not contain extractable text.');
    }

    const versionResult = await admin
      .from('kb_document_versions')
      .insert({
        organization_id: input.organizationId,
        document_id: documentId,
        version_number: 1,
        content_hash: sha256(originalBytes),
        byte_size: originalBytes.byteLength,
        extracted_text: extracted.text,
        parser_name: extracted.parserName,
        parser_version: '1',
        processing_status: 'processing',
        metadata: {},
      })
      .select('*')
      .single();

    if (versionResult.error) {
      throw new Error(`Unable to create document version: ${versionResult.error.message}`);
    }

    versionId = versionResult.data.id;
    const chunks = chunkText(extracted.text, {
      ...input.chunkOptions,
      metadata: {
        filename: input.filename ?? null,
        title: input.title,
        ...(input.chunkOptions?.metadata ?? {}),
      },
    });

    if (!chunks.length) {
      throw new Error('The document did not produce any searchable chunks.');
    }

    const chunkResult = await admin
      .from('kb_chunks')
      .insert(
        chunks.map((chunk) => ({
          organization_id: input.organizationId,
          document_id: documentId as string,
          document_version_id: versionId as string,
          chunk_index: chunk.index,
          content: chunk.content,
          content_hash: sha256(chunk.content),
          language_code: input.language ?? null,
          token_count: chunk.tokenCount,
          metadata: chunk.metadata as Json,
        })),
      )
      .select('*');

    if (chunkResult.error) {
      throw new Error(`Unable to store document chunks: ${chunkResult.error.message}`);
    }

    const storedChunks = [...chunkResult.data].sort((a, b) => a.chunk_index - b.chunk_index);
    const embeddingProvider = getConfiguredEmbeddingProvider();
    const batchSize = 64;

    for (let offset = 0; offset < storedChunks.length; offset += batchSize) {
      const batch = storedChunks.slice(offset, offset + batchSize);
      const embeddings = await embeddingProvider.embed(
        batch.map((chunk) => chunk.content),
        { inputType: 'document' },
      );
      const embeddingResult = await admin.from('kb_chunk_embeddings_1536').insert(
        batch.map((chunk, index) => ({
          organization_id: input.organizationId,
          chunk_id: chunk.id,
          embedding_provider: embeddingProvider.name,
          embedding_model: embeddingProvider.model,
          embedded_content_hash: chunk.content_hash,
          embedding: vectorLiteral(embeddings[index]),
        })),
      );

      if (embeddingResult.error) {
        throw new Error(`Unable to store chunk embeddings: ${embeddingResult.error.message}`);
      }
    }

    for (const translation of input.translations ?? []) {
      const rows = translation.chunks
        .map((translatedContent, index) => {
          const sourceChunk = storedChunks[index];
          if (!sourceChunk || !translatedContent.trim()) return null;
          return {
            organization_id: input.organizationId,
            chunk_id: sourceChunk.id,
            language_code: translation.languageCode,
            dialect_code: translation.dialectCode ?? null,
            translated_content: translatedContent.trim(),
            translation_provider: translation.provider ?? null,
            translation_model: translation.model ?? null,
            source_content_hash: sourceChunk.content_hash,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (rows.length) {
        const translationResult = await admin.from('kb_chunk_translations').insert(rows);
        if (translationResult.error) {
          throw new Error(`Unable to store chunk translations: ${translationResult.error.message}`);
        }
      }
    }

    const processedAt = new Date().toISOString();
    const versionUpdate = await admin
      .from('kb_document_versions')
      .update({
        processing_status: 'ready',
        processing_error: null,
        processed_at: processedAt,
      })
      .eq('organization_id', input.organizationId)
      .eq('id', versionId);

    if (versionUpdate.error) {
      throw new Error(`Unable to finalize document version: ${versionUpdate.error.message}`);
    }

    const documentUpdate = await admin
      .from('kb_documents')
      .update({ status: 'ready', current_version_id: versionId })
      .eq('organization_id', input.organizationId)
      .eq('id', documentId);

    if (documentUpdate.error) {
      throw new Error(`Unable to finalize document: ${documentUpdate.error.message}`);
    }

    return {
      documentId,
      documentVersionId: versionId,
      chunkCount: storedChunks.length,
      status: 'ready',
    };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown ingestion error';

    if (versionId) {
      await admin
        .from('kb_document_versions')
        .update({
          processing_status: 'failed',
          processing_error: message.slice(0, 2000),
          processed_at: new Date().toISOString(),
        })
        .eq('organization_id', input.organizationId)
        .eq('id', versionId);
    }

    if (documentId) {
      await admin
        .from('kb_documents')
        .update({
          status: 'failed',
          metadata: { ...(input.metadata ?? {}), processingError: message } as Json,
        })
        .eq('organization_id', input.organizationId)
        .eq('id', documentId);
    }

    throw cause;
  }
}
