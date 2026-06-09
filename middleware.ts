import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agents/:path*',
    '/calls/:path*',
    '/knowledge-base/:path*',
    '/automations/:path*',
    '/analytics/:path*',
    '/billing/:path*',
    '/team/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
