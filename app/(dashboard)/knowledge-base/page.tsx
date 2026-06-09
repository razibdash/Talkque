import { BookOpen } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function KnowledgeBasePage() {
  return <PagePlaceholder title="Knowledge base" description="Manage the trusted documents and structured content your agents use to answer callers." icon={BookOpen} actionLabel="Add knowledge" />;
}
