import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getPublicSupabaseConfig } from '@/lib/supabase/config';
import {
  AuthenticationError,
  AuthorizationError,
  requireOrganizationAccess,
} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getEnvironmentLabel() {
  if (process.env.VERCEL_ENV === 'preview') return 'Preview';
  if (process.env.NODE_ENV === 'production') return 'Production';
  return 'Development';
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!getPublicSupabaseConfig()) {
    redirect('/login');
  }

  try {
    const { organization, user } = await requireOrganizationAccess();

    return (
      <DashboardShell
        organizationName={organization.name}
        environment={getEnvironmentLabel()}
        userEmail={user.email ?? 'Talkque user'}
      >
        {children}
      </DashboardShell>
    );
  } catch (cause) {
    if (cause instanceof AuthenticationError) {
      redirect('/login');
    }

    if (cause instanceof AuthorizationError) {
      redirect('/onboarding');
    }

    throw cause;
  }
}
