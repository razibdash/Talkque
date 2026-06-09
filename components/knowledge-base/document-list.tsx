import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import { cn } from '@/lib/utils';
import type { KnowledgeDocument, KnowledgeDocumentStatus } from '@/types/knowledge-base';

const statusStyles: Record<KnowledgeDocumentStatus, string> = {
  uploaded: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  ready: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  archived: 'bg-slate-100 text-slate-600',
};

export function DocumentList({ documents }: { documents: KnowledgeDocument[] }) {
  if (!documents.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No knowledge documents"
        description="Upload a PDF, DOCX, or TXT file to give your agents a trusted source."
        action={{ label: 'Upload document', href: '/knowledge-base/upload' }}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="pb-3 pr-4">Document</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Chunks</th>
            <th className="pb-3 pr-4">Language</th>
            <th className="pb-3 text-right">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-b border-slate-100 last:border-0">
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{document.title}</p>
                    <p className="truncate text-xs text-slate-400">
                      {document.originalFilename ?? 'Text document'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                    statusStyles[document.status],
                  )}
                >
                  {document.status}
                </span>
              </td>
              <td className="py-4 pr-4 tabular-nums text-slate-600">
                {document.chunkCount.toLocaleString()}
              </td>
              <td className="py-4 pr-4 uppercase text-slate-600">
                {document.language ?? 'Auto'}
              </td>
              <td className="py-4 text-right text-xs text-slate-400">
                {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                  new Date(document.createdAt),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
