import { DashboardSidebar } from './sidebar';
import { DashboardTopbar } from './topbar';

type DashboardShellProps = {
  children: React.ReactNode;
  organizationName: string;
  environment: string;
  userEmail: string;
};

export function DashboardShell({
  children,
  organizationName,
  environment,
  userEmail,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <DashboardSidebar organizationName={organizationName} />
      <div className="lg:pl-64">
        <DashboardTopbar
          organizationName={organizationName}
          environment={environment}
          userEmail={userEmail}
        />
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
