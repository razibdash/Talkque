import { CircleHelp } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function KnowledgeGapsPage() {
  return <PagePlaceholder title="Knowledge gaps" description="Find repeated caller questions that were unanswered or answered with low confidence." icon={CircleHelp} />;
}
