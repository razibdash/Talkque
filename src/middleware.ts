import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Replace this with Supabase SSR middleware session check.
  if (pathname.startsWith('/dashboard')) {
    const hasDemoSession = request.cookies.get('talkque_demo_session')?.value;
    if (!hasDemoSession && process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
