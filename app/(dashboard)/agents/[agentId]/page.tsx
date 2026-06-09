import { Bot } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default async function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return <PagePlaceholder title={`Agent: ${agentId}`} description="Configure prompts, language behavior, voice settings, tools, and deployment channels." icon={Bot} actionLabel="Save draft" />;
}
