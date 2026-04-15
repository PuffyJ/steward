import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: Record<string, unknown>) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  // Token-hash flow (from custom email template using {{ .TokenHash }})
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === 'invite' || type === 'signup') {
        return NextResponse.redirect(new URL('/set-password', appUrl));
      }
      return NextResponse.redirect(new URL(next, appUrl));
    }
  }

  // PKCE flow (from OAuth or other code-based flows)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === 'invite' || type === 'signup') {
        return NextResponse.redirect(new URL('/set-password', appUrl));
      }
      return NextResponse.redirect(new URL(next, appUrl));
    }
  }

  return NextResponse.redirect(new URL('/login', appUrl));
}
