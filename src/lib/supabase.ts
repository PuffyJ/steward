import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieEntry = { name: string; value: string; options: CookieOptions };

// ─── Server Client (Server Components, Route Handlers, Server Actions) ────────
// Uses createClient directly with service role key — no cookie handling, so it
// never forwards the user's JWT and correctly bypasses RLS for all queries.

export async function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ─── Auth Client (Server Components) ─────────────────────────────────────────
// Uses anon key + cookie handling so getSession() can read the user's JWT.
// Use this for session checks only; use createServerSupabase() for DB queries.

export async function createAuthSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieEntry[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — can't set cookies
          }
        },
      },
    }
  );
}
