import { UploadCloud } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function KnowledgeUploadPage() {
  return <PagePlaceholder title="Upload knowledge" description="Ingest documents, websites, FAQs, and structured sources into the retrieval pipeline." icon={UploadCloud} actionLabel="Choose files" />;
}
