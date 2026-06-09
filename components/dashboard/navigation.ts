import {
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  LayoutDashboard,
  Network,
  PhoneCall,
  Settings,
  Users,
} from 'lucide-react';

export const dashboardNavigation = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agents', href: '/agents', icon: Bot },
  { label: 'Calls', href: '/calls', icon: PhoneCall },
  { label: 'Knowledge base', href: '/knowledge-base', icon: BookOpen },
  { label: 'Automations', href: '/automations', icon: Network },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const;
