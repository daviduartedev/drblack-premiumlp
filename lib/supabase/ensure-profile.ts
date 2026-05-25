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

function buildProfilePayload(authUser: User) {
  return {
    id: authUser.id,
    email: (authUser.email ?? "").toLowerCase(),
    name:
      (authUser.user_metadata?.name as string | undefined) ??
      authUser.email?.split("@")[0] ??
      "Usuario",
    role: ((authUser.user_metadata?.role as UserRole | undefined) ??
      "customer") as UserRole,
  };
}

async function readProfileById(
  client: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data } = await client
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", userId)
    .maybeSingle();

  return data ? (data as ProfileRow) : null;
}

/** Garante linha em `profiles` para usuarios Auth (ex.: criados antes da migration). */
export async function ensureProfile(
  supabase: SupabaseClient,
  authUser: User
): Promise<ProfileRow | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = getSupabaseUrl();

  if (serviceKey && url) {
    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const existing = await readProfileById(admin, authUser.id);
    if (existing) {
      return existing;
    }

    const payload = buildProfilePayload(authUser);
    const { data: inserted, error } = await admin
      .from("profiles")
      .insert(payload)
      .select("id, email, name, role")
      .single();

    if (!error && inserted) {
      return inserted as ProfileRow;
    }

    if (error?.code === "23505") {
      return readProfileById(admin, authUser.id);
    }

    if (error) {
      console.error("[ensure-profile] admin insert falhou:", error.message);
    }
  } else {
    console.warn(
      "[ensure-profile] SUPABASE_SERVICE_ROLE_KEY ausente — leitura/insert via anon client (sujeito a RLS)"
    );
  }

  const existing = await readProfileById(supabase, authUser.id);
  if (existing) {
    return existing;
  }

  const payload = buildProfilePayload(authUser);
  const { data: inserted, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("id, email, name, role")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return readProfileById(supabase, authUser.id);
    }
    if (error) {
      console.error("[ensure-profile] anon insert falhou:", error.message);
    }
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
