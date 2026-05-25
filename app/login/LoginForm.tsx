"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { createClient, isBrowserSupabaseConfigured } from "@/lib/supabase/client";

const initialState: LoginState = { message: "" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "E-mail ou senha invalidos.",
  auth: "Autenticacao indisponivel. Verifique a configuracao do Supabase.",
  session_not_persisted:
    "Sessao nao pôde ser persistida no servidor. Verifique se cookies estao habilitados ou contate o suporte.",
  profile_creation_failed:
    "Conta configurada parcialmente. Tente novamente ou contate o suporte.",
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
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState("");

  const supabaseAuth = useSupabase || isBrowserSupabaseConfigured();
  const queryError = errorCode ? ERROR_MESSAGES[errorCode] : "";
  const errorMessage = clientError || queryError || state.message;

  async function handleSupabaseLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      if (!supabase) {
        setClientError(ERROR_MESSAGES.auth);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        setClientError("E-mail ou senha invalidos.");
        return;
      }

      const syncRes = await fetch("/auth/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      const sync = (await syncRes.json()) as { ok?: boolean; role?: string; error?: string };

      if (!syncRes.ok) {
        const mapped = sync.error ? ERROR_MESSAGES[sync.error] : undefined;
        setClientError(
          mapped ?? "Login ok, mas nao foi possivel iniciar a sessao no servidor."
        );
        return;
      }
      const destination = sync.role === "admin" ? "/admin" : "/dashboard";
      window.location.assign(destination);
    } catch {
      setClientError("Nao foi possivel entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (supabaseAuth) {
    return (
      <LoginLayout errorMessage={errorMessage}>
        <form
          onSubmit={handleSupabaseLogin}
          className="mt-[var(--space-5)] grid gap-5"
        >
          <LoginFields disabled={submitting} />
          <SubmitButton pending={submitting} />
        </form>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout errorMessage={errorMessage}>
      <form action={formAction} className="mt-[var(--space-5)] grid gap-5">
        <LoginFields disabled={pending} />
        <SubmitButton pending={pending} />
      </form>
    </LoginLayout>
  );
}

function LoginLayout({
  errorMessage,
  children,
}: {
  errorMessage: string;
  children: React.ReactNode;
}) {
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
            {errorMessage ? (
              <p
                className="t-body-sm mt-4 text-[#ff9aad]"
                role="alert"
                aria-live="polite"
              >
                {errorMessage}
              </p>
            ) : null}
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

function LoginFields({ disabled }: { disabled: boolean }) {
  return (
    <>
      <label className="grid gap-2">
        <span className="t-card-sub">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={disabled}
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
          disabled={disabled}
          className="min-h-[44px] rounded-[8px] border border-[var(--line)] bg-black/35 px-4 py-3 t-body-sm text-[var(--foreground)]"
        />
      </label>
    </>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      className="btn-solid t-cta inline-flex min-h-[44px] w-fit items-center gap-2"
      disabled={pending}
    >
      <ShieldCheck size={15} />
      {pending ? "Entrando" : "Entrar"}
    </button>
  );
}
