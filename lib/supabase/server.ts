import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = requirePublicSupabaseConfig();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot write cookies. Middleware handles session refresh.
          }
        },
      },
    },
  );
}
