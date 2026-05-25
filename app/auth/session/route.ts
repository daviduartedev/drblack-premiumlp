import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/**
 * Garante que cookies de sessao do Supabase saem com atributos seguros.
 * As options do @supabase/ssr podem omitir secure/sameSite em alguns runtimes.
 */
function secureCookieOptions(
  options: CookieToSet["options"]
): CookieToSet["options"] {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...options,
  };
}

/**
 * Recebe tokens do login no browser e grava cookies HTTP-only no servidor.
 * O @supabase/ssr aplica cookies via setAll de forma assincrona apos setSession.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }

  let body: { access_token?: string; refresh_token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const access_token = body.access_token?.trim();
  const refresh_token = body.refresh_token?.trim();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "missing_tokens" }, { status: 400 });
  }

  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  const cookieStore = await cookies();
  const pendingCookies: CookieToSet[] = [];

  let resolveCookies: (() => void) | null = null;
  const cookiesWritten = new Promise<void>((resolve) => {
    resolveCookies = resolve;
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (cookiesToSet.length === 0) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          pendingCookies.push({ name, value, options });
        });
        resolveCookies?.();
      },
    },
  });

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  await Promise.race([
    cookiesWritten,
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("cookie_timeout")), 4000)
    ),
  ]).catch(() => {
    /* setAll pode ja ter corrido sincronamente em alguns runtimes */
  });

  if (pendingCookies.length === 0) {
    return NextResponse.json({ error: "session_not_persisted" }, { status: 500 });
  }

  await supabase.auth.getUser();
  const profile = await ensureProfile(supabase, data.user);
  const role = profile?.role ?? "customer";

  const response = NextResponse.json({
    ok: true,
    role,
    email: data.user.email,
  });

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, secureCookieOptions(options));
  });

  return response;
}

export const dynamic = "force-dynamic";
