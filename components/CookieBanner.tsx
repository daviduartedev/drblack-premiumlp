"use client";

import { useEffect, useState } from "react";

/**
 * Banner de consentimento de cookies — LGPD.
 *
 * Comportamento:
 *  - Aparece na primeira visita (sem registro em localStorage).
 *  - Três caminhos: Aceitar todos / Apenas essenciais / Configurar.
 *  - Em "Configurar" o usuário marca por categoria (analíticos / marketing).
 *  - Persiste o consentimento em `localStorage["dr.consent"]`.
 *  - Reabrível a partir do footer (link "Política de Cookies").
 */

const STORAGE_KEY = "dr.consent";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignora — modo privado */
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Mostra na primeira carga se não houver consentimento registrado.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readConsent();
    if (!stored) {
      // Pequeno atraso evita "flash" no primeiro paint.
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const persist = (a: boolean, m: boolean) => {
    writeConsent({
      essential: true,
      analytics: a,
      marketing: m,
      timestamp: new Date().toISOString(),
    });
    setOpen(false);
    setConfiguring(false);
  };

  const acceptAll = () => persist(true, true);
  const onlyEssential = () => persist(false, false);
  const saveCustom = () => persist(analytics, marketing);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      data-cookie-banner
      className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none"
    >
      <div className="content-wrap section-padding-x" style={{ paddingBlock: "var(--space-4)" }}>
        <div
          className="pointer-events-auto"
          style={{
            maxWidth: "980px",
            marginInline: "auto",
            background: "var(--background-raised)",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "var(--space-4)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
          }}
        >
          {!configuring ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="min-w-0">
                <h2
                  id="cookie-banner-title"
                  className="t-eyebrow"
                  style={{ color: "var(--accent)" }}
                >
                  Cookies & privacidade
                </h2>
                <p className="t-body-sm mt-2" style={{ maxWidth: "62ch" }}>
                  Usamos cookies essenciais para o site funcionar e, com sua
                  autorização, cookies analíticos e de marketing para melhorar
                  sua experiência. Você pode aceitar todos, apenas os
                  essenciais ou configurar sua preferência. Veja nossa{" "}
                  <a
                    href="/cookies"
                    style={{ color: "var(--highlight)", textDecoration: "underline" }}
                  >
                    Política de Cookies
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:flex-nowrap md:shrink-0">
                <BannerButton variant="ghost" onClick={() => setConfiguring(true)}>
                  Configurar
                </BannerButton>
                <BannerButton variant="ghost" onClick={onlyEssential}>
                  Só essenciais
                </BannerButton>
                <BannerButton variant="solid" onClick={acceptAll}>
                  Aceitar todos
                </BannerButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <h2
                  id="cookie-banner-title"
                  className="t-eyebrow"
                  style={{ color: "var(--accent)" }}
                >
                  Configurar cookies
                </h2>
                <p className="t-body-sm mt-2" style={{ maxWidth: "62ch" }}>
                  Os cookies essenciais são obrigatórios para o funcionamento
                  do site. Você decide os demais.
                </p>
              </div>

              <ConsentRow
                label="Essenciais"
                description="Sessão, login, segurança. Necessários, não podem ser desativados."
                checked
                disabled
                onChange={() => undefined}
              />
              <ConsentRow
                label="Analíticos"
                description="Estatísticas anônimas de uso para melhorar a navegação."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentRow
                label="Marketing"
                description="Anúncios e campanhas relevantes ao seu interesse."
                checked={marketing}
                onChange={setMarketing}
              />

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <BannerButton variant="ghost" onClick={() => setConfiguring(false)}>
                  Voltar
                </BannerButton>
                <BannerButton variant="solid" onClick={saveCustom}>
                  Salvar preferências
                </BannerButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Botões do banner
 * ============================================================ */
function BannerButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "ghost" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${variant === "solid" ? "btn-solid" : "btn-ghost"} t-cta`}
    >
      {children}
    </button>
  );
}

/* ============================================================
 * Linha de toggle de consentimento
 * ============================================================ */
function ConsentRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className="flex items-start gap-4"
      style={{
        cursor: disabled ? "default" : "pointer",
        padding: "var(--space-3)",
        border: "1px solid var(--line-soft)",
        borderRadius: "12px",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0"
        style={{ accentColor: "var(--accent)" }}
      />
      <div>
        <div className="t-card-title">{label}</div>
        <div
          className="t-body-sm mt-1"
          style={{ color: "var(--foreground-muted)" }}
        >
          {description}
        </div>
      </div>
    </label>
  );
}
