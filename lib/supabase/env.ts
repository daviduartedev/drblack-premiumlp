/** Supabase public key — suporta nome legado (anon) e publishable do dashboard. */
export function getSupabaseAnonKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return key?.trim() || undefined;
}

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

/** Origem real do pedido (dominio customizado na Vercel). */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return getSiteUrl().replace(/\/$/, "");
}
