import { History } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default async function AgentVersionsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return <PagePlaceholder title="Agent versions" description={`Review immutable versions, evaluations, and releases for agent ${agentId}.`} icon={History} />;
}
