import { CreditCard } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default function BillingPage() {
  return <PagePlaceholder title="Billing" description="Manage plans, payment methods, invoices, usage limits, and metered voice consumption." icon={CreditCard} actionLabel="Manage plan" />;
}
