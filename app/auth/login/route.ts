import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import {
  getRequestOrigin,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function loginRedirect(path: string, request: Request) {
  const base = getRequestOrigin(request);
  return NextResponse.redirect(new URL(path, base), 303);
}

/** Fallback server-side login (ex.: crawlers). Fluxo principal: cliente + /auth/me. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return loginRedirect("/login?error=auth", request);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return loginRedirect("/login?error=invalid", request);
  }

  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  const cookieStore = await cookies();
  const pendingCookies: CookieToSet[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          pendingCookies.push({ name, value, options });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return loginRedirect("/login?error=invalid", request);
  }

  await supabase.auth.getUser();

  const profile = await ensureProfile(supabase, data.user);
  const role = profile?.role ?? "customer";
  const destination = role === "admin" ? "/admin" : "/dashboard";

  const response = loginRedirect(destination, request);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
