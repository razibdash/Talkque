import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CreditCard,
  KeyRound,
  PhoneCall,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';

export const dashboardNav = [
  { title: 'Overview', href: '/dashboard', icon: Activity },
  { title: 'Agents', href: '/dashboard/agents', icon: Bot },
  { title: 'Calls', href: '/dashboard/calls', icon: PhoneCall },
  { title: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Automations', href: '/dashboard/automations', icon: Workflow },
  { title: 'Evaluations', href: '/dashboard/evaluations', icon: ShieldCheck },
  { title: 'Team', href: '/dashboard/team', icon: Users },
  { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { title: 'Organization', href: '/dashboard/organization', icon: Building2 },
  { title: 'API Keys', href: '/dashboard/developer/api-keys', icon: KeyRound },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];
