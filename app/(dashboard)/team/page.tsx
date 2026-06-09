import { Users } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function TeamPage() {
  return <PagePlaceholder title="Team" description="Invite teammates and manage organization roles, access, and operational responsibilities." icon={Users} actionLabel="Invite member" />;
}
