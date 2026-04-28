"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  onClose: () => void;
};

/**
 * WelcomeModalMobile — bottom-sheet premium estilo app.
 *
 * Padrão UX:
 *  - Aparece subindo de baixo (bottom-sheet) na primeira renderização da hero.
 *  - Tem handle (linha de arrasto) para sugerir gesture.
 *  - Backdrop blur premium, fechamento por tap fora ou botão X.
 *  - 2 ações claras: "Entrar / Fazer login" (primário) e "Continuar navegando" (ghost).
 */
export default function WelcomeModalMobile({ onClose }: Props) {
  const titleId = useId();
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    // dá tempo da animação de saída rodar
    window.setTimeout(() => onClose(), 280);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dismiss]);

  return (
    <div
      className={`mobile-welcome-root ${closing ? "is-closing" : ""}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mobile-welcome-sheet"
      >
        <div className="mobile-welcome-handle" aria-hidden />

        {/* Header com ícone de boas-vindas */}
        <div className="mobile-welcome-icon" aria-hidden>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2l2.5 6.5L21 9.5l-5 4.6 1.4 6.9L12 17.8 6.6 21 8 14.1 3 9.5l6.5-1z" />
          </svg>
        </div>

        <h2 id={titleId} className="mobile-welcome-title">
          Bem-vindo ao DR Black
        </h2>
        <p className="mobile-welcome-sub">
          Skins de CS2, rifas e mercado direto. Faça login para acessar a sua conta
          ou continue navegando para conhecer o catálogo.
        </p>

        <div className="mobile-welcome-actions">
          <Link href="/login" className="mobile-welcome-cta-primary" onClick={dismiss}>
            Entrar / Fazer login
          </Link>
          <button
            type="button"
            className="mobile-welcome-cta-ghost"
            onClick={dismiss}
          >
            Continuar navegando
          </button>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mobile-welcome-close"
          aria-label="Fechar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
