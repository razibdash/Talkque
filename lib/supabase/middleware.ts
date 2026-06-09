import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { getPublicSupabaseConfig } from './config';

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse['cookies']['set']>[2];
};

const protectedRoutePrefixes = [
  '/dashboard',
  '/agents',
  '/calls',
  '/knowledge-base',
  '/automations',
  '/analytics',
  '/billing',
  '/team',
  '/settings',
  '/onboarding',
] as const;

const authOnlyRoutes = ['/login', '/signup'] as const;

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getPublicSupabaseConfig();
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutePrefixes.some((route) => matchesRoute(pathname, route));
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => matchesRoute(pathname, route));

  if (!config) {
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (user && isAuthOnlyRoute) {
    return copyCookies(response, NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return response;
}
