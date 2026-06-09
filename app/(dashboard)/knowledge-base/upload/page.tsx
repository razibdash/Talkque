import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { UploadDropzone } from '@/components/knowledge-base/upload-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function KnowledgeUploadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/knowledge-base" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to knowledge base
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Upload knowledge
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Documents are extracted, split into overlapping chunks, and embedded for semantic search.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a document</CardTitle>
          <CardDescription>Use text-based PDFs for the best extraction quality.</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadDropzone />
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
        <p>
          Uploaded knowledge is scoped to your active organization and is only returned after ingestion reaches ready status.
        </p>
      </div>
    </div>
  );
}
