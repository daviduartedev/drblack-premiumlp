import type { User } from "@supabase/supabase-js";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { UserRole } from "@/lib/ruby-safira-types";

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

/** Garante linha em `profiles` para usuarios Auth (ex.: criados antes da migration). */
export async function ensureProfile(
  supabase: SupabaseClient,
  authUser: User
): Promise<ProfileRow | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    return existing as ProfileRow;
  }

  const payload = {
    id: authUser.id,
    email: (authUser.email ?? "").toLowerCase(),
    name:
      (authUser.user_metadata?.name as string | undefined) ??
      authUser.email?.split("@")[0] ??
      "Usuario",
    role: ((authUser.user_metadata?.role as UserRole | undefined) ??
      "customer") as UserRole,
  };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = getSupabaseUrl();

  if (serviceKey && url) {
    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: upserted, error } = await admin
      .from("profiles")
      .upsert(payload)
      .select("id, email, name, role")
      .single();

    if (!error && upserted) {
      return upserted as ProfileRow;
    }
  }

  const { data: inserted, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("id, email, name, role")
    .single();

  if (error || !inserted) {
    return null;
  }

  return inserted as ProfileRow;
}

export async function getProfileForAuthUser(
  authUser: User
): Promise<ProfileRow | null> {
  const supabase = await createClient();
  return ensureProfile(supabase, authUser);
}
