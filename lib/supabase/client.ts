import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function readPublicEnv(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

export function createClient(): SupabaseClient | null {
  const url = readPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}

export function isBrowserSupabaseConfigured(): boolean {
  return Boolean(
    readPublicEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      (readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
        readPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"))
  );
}
