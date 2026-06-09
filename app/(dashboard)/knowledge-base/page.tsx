import Link from 'next/link';
import { AlertTriangle, ArrowRight, BookOpen, Search, UploadCloud } from 'lucide-react';
import { DocumentList } from '@/components/knowledge-base/document-list';
import { SearchPanel } from '@/components/knowledge-base/search-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseServerClient, requireOrganizationAccess } from '@/lib/supabase/server';
import type { KnowledgeDocument } from '@/types/knowledge-base';

export default async function KnowledgeBasePage() {
  const { organization } = await requireOrganizationAccess();
  const supabase = await createSupabaseServerClient();
  const [documentsResult, chunksResult, gapsResult] = await Promise.all([
    supabase
      .from('kb_documents')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase.from('kb_chunks').select('document_id').eq('organization_id', organization.id),
    supabase
      .from('kb_gaps')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .in('status', ['open', 'in_review']),
  ]);

  if (documentsResult.error) {
    throw new Error(`Unable to load knowledge documents: ${documentsResult.error.message}`);
  }
  if (chunksResult.error) {
    throw new Error(`Unable to count knowledge chunks: ${chunksResult.error.message}`);
  }
  if (gapsResult.error) {
    throw new Error(`Unable to count knowledge gaps: ${gapsResult.error.message}`);
  }

  const chunkCounts = new Map<string, number>();
  for (const chunk of chunksResult.data) {
    chunkCounts.set(chunk.document_id, (chunkCounts.get(chunk.document_id) ?? 0) + 1);
  }

  const documents: KnowledgeDocument[] = documentsResult.data.map((document) => ({
    id: document.id,
    organizationId: document.organization_id,
    title: document.title,
    status: document.status,
    chunkCount: chunkCounts.get(document.id) ?? 0,
    language: document.base_language_code,
    originalFilename: document.original_filename,
    createdAt: document.created_at,
  }));
  const unresolvedGaps = gapsResult.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">Knowledge base</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Trusted answers for every agent
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload sources, monitor ingestion, and test retrieval before callers rely on it.
          </p>
        </div>
        <Link
          href="/knowledge-base/upload"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          <UploadCloud className="mr-2 size-4" />
          Upload document
        </Link>
      </div>

      {unresolvedGaps > 0 ? (
        <Link
          href="/knowledge-base/gaps"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-600" />
          <span className="font-medium">
            {unresolvedGaps} unresolved knowledge {unresolvedGaps === 1 ? 'gap needs' : 'gaps need'} attention
          </span>
          <ArrowRight className="ml-auto size-4" />
        </Link>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Sources currently available to your organization.</CardDescription>
          </div>
          <BookOpen className="size-5 text-brand-600" />
        </CardHeader>
        <CardContent>
          <DocumentList documents={documents} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Test search</CardTitle>
            <CardDescription>Inspect the chunks and scores returned by semantic retrieval.</CardDescription>
          </div>
          <Search className="size-5 text-brand-600" />
        </CardHeader>
        <CardContent>
          <SearchPanel />
        </CardContent>
      </Card>
    </div>
  );
}
