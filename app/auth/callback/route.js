// app/auth/callback/route.js
// Fixed: open redirect vulnerability + deprecated import
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Allowlist of safe redirect destinations
const SAFE_REDIRECTS = ['/', '/dashboard', '/profile', '/marketplace', '/chat', '/community'];

function isSafeRedirect(path) {
  if (!path) return false;
  // Must start with / and not contain protocol
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.includes('://')) return false;
  // Check against allowlist
  return SAFE_REDIRECTS.some((safe) => path === safe || path.startsWith(safe + '/'));
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // SECURITY FIX: Validate redirect parameter against allowlist
  const redirectTo = requestUrl.searchParams.get('redirect') || '/';
  const safeRedirect = isSafeRedirect(redirectTo) ? redirectTo : '/';

  return NextResponse.redirect(new URL(safeRedirect, requestUrl.origin));
}