import { Workflow } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function AutomationsPage() {
  return <PagePlaceholder title="Automations" description="Trigger handoffs, messages, webhooks, and business workflows from conversation events." icon={Workflow} actionLabel="Create automation" />;
}
