import { NextResponse } from 'next/server';
import { ingestDocument } from '@/lib/rag/ingest';
import {
  AuthenticationError,
  AuthorizationError,
  requireOrganizationAccess,
} from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/octet-stream',
]);

function errorResponse(cause: unknown) {
  if (cause instanceof AuthenticationError) {
    return NextResponse.json({ ok: false, message: cause.message }, { status: 401 });
  }
  if (cause instanceof AuthorizationError) {
    return NextResponse.json({ ok: false, message: cause.message }, { status: 403 });
  }

  const message = cause instanceof Error ? cause.message : 'Unable to upload document.';
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const { organization, user } = await requireOrganizationAccess(undefined, [
      'owner',
      'admin',
      'manager',
    ]);
    const formData = await request.formData();
    const file = formData.get('file');
    const languageValue = formData.get('language');
    const language =
      typeof languageValue === 'string' && languageValue.trim()
        ? languageValue.trim().toLowerCase()
        : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: 'Select a PDF, DOCX, or TXT file.' },
        { status: 400 },
      );
    }

    const extension = file.name.toLowerCase().split('.').pop() ?? '';
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type || 'application/octet-stream')) {
      return NextResponse.json(
        { ok: false, message: 'Only PDF, DOCX, and TXT files are supported.' },
        { status: 415 },
      );
    }

    if (!file.size || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, message: 'Files must be larger than 0 bytes and no more than 10 MB.' },
        { status: 413 },
      );
    }

    if (language && !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(language)) {
      return NextResponse.json(
        { ok: false, message: 'Language must be a code such as en, es, or bn-BD.' },
        { status: 400 },
      );
    }

    const result = await ingestDocument({
      organizationId: organization.id,
      userId: user.id,
      title: file.name.replace(/\.[^.]+$/, ''),
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      language,
      fileBuffer: Buffer.from(await file.arrayBuffer()),
      metadata: { uploadedVia: 'dashboard' },
    });

    return NextResponse.json({
      ok: true,
      document: {
        id: result.documentId,
        versionId: result.documentVersionId,
        status: result.status,
      },
      chunkCount: result.chunkCount,
    });
  } catch (cause) {
    return errorResponse(cause);
  }
}
