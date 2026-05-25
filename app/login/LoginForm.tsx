"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { message: "" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "E-mail ou senha invalidos.",
  auth: "Autenticacao indisponivel. Verifique a configuracao do Supabase.",
};

type LoginFormProps = {
  useSupabase: boolean;
  errorCode?: string;
};

export default function LoginForm({ useSupabase, errorCode }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  const queryError = errorCode ? ERROR_MESSAGES[errorCode] : "";
  const errorMessage = queryError || state.message;

  return (
    <div className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <main className="content-wrap section-padding-x flex min-h-[100svh] items-center py-[var(--space-8)]">
        <div className="grid w-full gap-[var(--space-6)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section>
            <Link href="/" className="footer-link t-body-sm">
              Voltar ao inicio
            </Link>
            <p className="t-eyebrow mt-[var(--space-6)]">Acesso</p>
            <h1 className="t-h2 mt-[var(--space-3)] max-w-[10ch]">
              Entrar no painel.
            </h1>
            <p className="t-body mt-[var(--space-4)] max-w-[52ch]">
              Use sua conta para acessar a area de cliente ou o painel admin.
            </p>
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
            <h2 className="t-h3">Login</h2>
            <p className="t-body-sm mt-2">
              Entre com e-mail e senha cadastrados no Supabase Auth.
            </p>

            <form
              action={useSupabase ? "/auth/login" : formAction}
              method="post"
              className="mt-[var(--space-5)] grid gap-5"
            >
              <label className="grid gap-2">
                <span className="t-card-sub">E-mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="min-h-[44px] rounded-[8px] border border-[var(--line)] bg-black/35 px-4 py-3 t-body-sm text-[var(--foreground)]"
                />
              </label>
              <label className="grid gap-2">
                <span className="t-card-sub">Senha</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="min-h-[44px] rounded-[8px] border border-[var(--line)] bg-black/35 px-4 py-3 t-body-sm text-[var(--foreground)]"
                />
              </label>
              {errorMessage ? (
                <p className="t-body-sm text-[#ff9aad]" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn-solid t-cta inline-flex min-h-[44px] w-fit items-center gap-2"
                disabled={!useSupabase && pending}
              >
                <ShieldCheck size={15} />
                {!useSupabase && pending ? "Entrando" : "Entrar"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
