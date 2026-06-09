import { Bot } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function AgentsPage() {
  return <PagePlaceholder title="AI agents" description="Create, configure, test, and deploy multilingual phone agents." icon={Bot} actionLabel="Create agent" />;
}
