import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import {
  getSiteUrl,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

function loginRedirect(path: string, request: Request) {
  const base = getSiteUrl().replace(/\/$/, "");
  try {
    return NextResponse.redirect(new URL(path, base || request.url), 303);
  } catch {
    return NextResponse.redirect(`${base}${path}`, 303);
  }
}

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

  const pendingCookies: {
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
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

  const profile = await ensureProfile(supabase, data.user);
  const role = profile?.role ?? "customer";
  const destination = role === "admin" ? "/admin" : "/dashboard";

  const response = loginRedirect(destination, request);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
