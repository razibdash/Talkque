import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const organizationId = form.get('organizationId');

  if (!file || !organizationId) {
    return NextResponse.json({ error: 'file and organizationId are required' }, { status: 400 });
  }

  // Pipeline: kb_documents -> kb_document_versions -> kb_chunks -> translations -> embeddings.
  return NextResponse.json({ ok: true, filename: file.name, status: 'queued' });
}
