"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Gem, ShieldCheck } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { TEST_CREDENTIALS } from "@/lib/test-credentials";

const initialState: LoginState = { message: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <div className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <main className="content-wrap section-padding-x flex min-h-[100svh] items-center py-[var(--space-8)]">
        <div className="grid w-full gap-[var(--space-6)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section>
            <Link href="/" className="footer-link t-body-sm">
              Voltar ao inicio
            </Link>
            <p className="t-eyebrow mt-[var(--space-6)]">
              Acesso local seedado
            </p>
            <h1 className="t-h2 mt-[var(--space-3)] max-w-[10ch]">
              Entrar no painel.
            </h1>
            <p className="t-body mt-[var(--space-4)] max-w-[52ch]">
              Validacao visual com cookie HTTP-only local. Supabase Auth entra
              depois; este mock nao e seguranca de producao.
            </p>
            <div className="mt-[var(--space-5)] grid gap-3 sm:grid-cols-2">
              <SeedCard
                icon={<Gem size={18} />}
                title="Cliente"
                email={TEST_CREDENTIALS.customer.email}
                password={TEST_CREDENTIALS.customer.password}
              />
              <SeedCard
                icon={<ShieldCheck size={18} />}
                title="Admin"
                email={TEST_CREDENTIALS.admin.email}
                password={TEST_CREDENTIALS.admin.password}
              />
            </div>
          </section>

          <section
            className="rounded-[8px] border p-[var(--space-5)]"
            style={{
              borderColor: "rgba(91, 168, 255, 0.28)",
              background:
                "linear-gradient(145deg, rgba(180, 16, 58, 0.14), rgba(70, 45, 180, 0.12)), var(--background-raised)",
              boxShadow:
                "0 32px 90px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <h2 className="t-h3">Login de teste</h2>
            <p className="t-body-sm mt-2">
              Use uma das contas seedadas para validar os fluxos de cliente e
              admin.
            </p>

            <form action={formAction} className="mt-[var(--space-5)] grid gap-5">
              <label className="grid gap-2">
                <span className="t-card-sub">E-mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="rounded-[8px] border border-[var(--line)] bg-black/35 px-4 py-3 t-body-sm text-[var(--foreground)]"
                />
              </label>
              <label className="grid gap-2">
                <span className="t-card-sub">Senha</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={4}
                  autoComplete="current-password"
                  className="rounded-[8px] border border-[var(--line)] bg-black/35 px-4 py-3 t-body-sm text-[var(--foreground)]"
                />
              </label>
              {state.message ? (
                <p className="t-body-sm text-[#ff9aad]" aria-live="polite">
                  {state.message}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn-solid t-cta inline-flex w-fit items-center gap-2"
                disabled={pending}
              >
                <ShieldCheck size={15} />
                {pending ? "Entrando" : "Entrar"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

function SeedCard({
  icon,
  title,
  email,
  password,
}: {
  icon: React.ReactNode;
  title: string;
  email: string;
  password: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-2 text-[var(--highlight)]">
        {icon}
        <span className="t-card-sub">{title}</span>
      </div>
      <p className="t-body-sm mt-3 break-all">{email}</p>
      <p className="t-body-sm mt-1 text-[var(--foreground-faint)]">
        senha: {password}
      </p>
    </div>
  );
}
