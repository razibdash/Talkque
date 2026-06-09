import { PhoneCall } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function CallsPage() {
  return <PagePlaceholder title="Calls" description="Review call status, duration, language, sentiment, outcomes, and provider costs." icon={PhoneCall} />;
}
