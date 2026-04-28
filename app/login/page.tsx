"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { isLoggedIn, markLoggedIn } from "@/lib/auth-session";

export default function LoginPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setSessionChecked(true);
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    markLoggedIn();
    router.push("/");
  }

  return (
    <div
      className="min-h-[100svh] flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <main className="flex flex-1 flex-col justify-center content-wrap section-padding-x py-[var(--space-8)]">
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <Link href="/" className="footer-link t-body-sm">
            ← Voltar ao início
          </Link>

          {!sessionChecked ? (
            <p className="t-body-sm mt-8" style={{ color: "var(--foreground-muted)" }}>
              Carregando…
            </p>
          ) : loggedIn ? (
            <>
              <h1 className="t-h3 mt-8">Você já está conectado</h1>
              <p className="t-body-sm mt-3" style={{ color: "var(--foreground-muted)" }}>
                Use os links abaixo para continuar navegando.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/#skins-destaque" className="btn-solid text-center">
                  Acessar a loja
                </Link>
                <Link href="/" className="btn-ghost justify-center">
                  Ir para a capa
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="t-h3 mt-8">Entrar</h1>
              <p className="t-body-sm mt-3" style={{ color: "var(--foreground-muted)" }}>
                Placeholder até integração com backend. Ao enviar, a sessão é
                simulada no navegador e você volta ao início com o boas-vindas.
              </p>

              <form onSubmit={onSubmit} className="mt-8 flex max-w-md flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="t-card-sub">E-mail</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] px-4 py-3 t-body-sm"
                    style={{ color: "var(--foreground)" }}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-card-sub">Senha</span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={4}
                    autoComplete="current-password"
                    className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] px-4 py-3 t-body-sm"
                    style={{ color: "var(--foreground)" }}
                  />
                </label>
                <button type="submit" className="btn-solid self-start">
                  Entrar
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
