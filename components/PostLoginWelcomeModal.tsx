"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  onClose: () => void;
};

/**
 * Card estilo newsletter na hero — mostrado após o loader em cada visita à LP (pai controla).
 */
export default function PostLoginWelcomeModal({ onClose }: Props) {
  const titleId = useId();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  /**
   * Detecta mobile em runtime (matchMedia) — mantém o desktop intacto.
   * Enquanto `isMobile === null` (primeiro paint SSR), renderizamos `null`
   * para evitar mismatch — o modal aparece logo no próximo frame.
   */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  /** Fecha o modal e mantém a home no topo (sem ir para #skins-destaque). */
  const stayOnHome = useCallback(() => {
    dismiss();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [dismiss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  // Antes do primeiro frame de matchMedia, não renderiza nada (SSR safety).
  if (isMobile === null) return null;

  // Mobile: popup totalmente removido — apenas desktop exibe o card.
  if (isMobile) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 hidden md:flex"
      style={{
        background: "rgba(5, 5, 8, 0.72)",
        backdropFilter: "blur(8px)",
      }}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="post-login-welcome-dialog relative w-full max-w-[420px] rounded-2xl border border-[var(--line)] bg-[var(--background-raised)] p-[var(--space-5)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
      >
        <button
          type="button"
          onClick={dismiss}
          className="btn-icon-sm absolute right-3 top-3"
          aria-label="Fechar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h2 id={titleId} className="t-h3" style={{ margin: 0 }}>
          Bem-vindo
        </h2>
        <p className="t-body-sm mt-4" style={{ color: "var(--foreground-muted)", marginBottom: 0 }}>
          Aqui você encontra as melhores skins de CS2, rifas e o mercado — tudo no mesmo lugar.
          Compra, vende e concorre com a gente.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/login" className="btn-solid text-center" onClick={dismiss}>
            Fazer login
          </Link>
          <button type="button" className="btn-ghost justify-center" onClick={stayOnHome}>
            Acessar a loja
          </button>
        </div>
      </div>
    </div>
  );
}
