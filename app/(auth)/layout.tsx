import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <section className="flex flex-col px-6 py-6 sm:px-10 lg:px-14">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
      </section>
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_42%)]" />
        <div className="relative max-w-xl">
          <p className="text-sm font-medium text-brand-400">One platform, every conversation</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight">
            AI phone agents that understand your customers, wherever they are.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-400">
            Orchestrate voice, language, knowledge, telephony, and quality from a secure SaaS workspace.
          </p>
        </div>
      </aside>
    </main>
  );
}
