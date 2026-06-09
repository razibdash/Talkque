import { Settings } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function SettingsPage() {
  return <PagePlaceholder title="Settings" description="Configure your organization, integrations, security, data retention, and provider defaults." icon={Settings} />;
}
