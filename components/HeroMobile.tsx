"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * HeroMobile — versão exclusiva para tablet/mobile (≤ 767px).
 *
 * Premissas:
 *  - Desktop NÃO usa este componente — só renderiza em `<md` via wrapper no
 *    componente `hero.tsx`.
 *  - Background é vídeo vertical (CS2) com fallback estático para conexão lenta
 *    e `prefers-reduced-motion`.
 *  - Mantém identidade visual: paleta, tipografia Oswald, headline KPR.
 *  - CTA grande, touch-friendly (>= 48px de altura).
 *  - Nav recolhida em hamburger (drawer suave).
 */

type NavItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

const NAV_LINKS: NavItem[] = [
  { label: "Catálogo", href: "#skins-destaque" },
  { label: "Rifas", href: "#", disabled: true },
  { label: "Sobre", href: "#", disabled: true },
];

export default function HeroMobile({ loading }: { loading: boolean }) {
  const show = !loading;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Política de reprodução:
   *  - autoplay muted loop com `playsInline` (iOS Safari).
   *  - Se data-saver/connection-2g, não tenta carregar (poupar dados).
   *  - Se reduced motion, mantém imagem fallback.
   */
  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Heurística simples de poupar dados / conexão lenta.
    type NetInfo = {
      saveData?: boolean;
      effectiveType?: string;
    };
    const conn: NetInfo | undefined = (
      navigator as Navigator & { connection?: NetInfo }
    ).connection;
    const saveData = !!conn?.saveData;
    const slow =
      conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";

    if (reduced || saveData || slow) {
      setVideoFailed(true);
      return;
    }

    const onCanPlay = () => setVideoReady(true);
    const onError = () => setVideoFailed(true);

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    // Em alguns iOS o autoplay precisa de play() explícito após user gesture.
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Sem permissão de autoplay — manter fallback estático.
          setVideoFailed(true);
        });
      }
    };
    tryPlay();

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, []);

  /** Bloqueia scroll do body quando o menu está aberto. */
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <section
      className="hero-mobile-root relative w-full overflow-hidden"
      aria-label="DR Black Skins — abertura"
    >
      {/* ============================================================
          BACKGROUND — vídeo CS2 vertical com fallback inteligente
          ============================================================ */}
      <div aria-hidden className="hero-mobile-bg">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="hero-mobile-video"
            src="/NOVOVIDEO.mp4"
            poster="/bg-hero.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disableRemotePlayback
            data-ready={videoReady ? "1" : "0"}
          />
        ) : (
          <div className="hero-mobile-fallback" />
        )}
        {/* Overlay degradê — leitura do branco sobre o vídeo */}
        <div className="hero-mobile-overlay" />
        {/* Grain/scanlines premium */}
        <div className="hero-mobile-scan" />
      </div>

      {/* ============================================================
          TOPBAR — logo + hamburguer + CTA
          ============================================================ */}
      <div className="hero-mobile-topbar">
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="hero-mobile-burger"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="hero-mobile-brand" aria-label="DR Black Skins">
          DR<span style={{ color: "var(--accent)" }}>·</span>BLACK
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <Link
          href="/login"
          className="hero-mobile-login-pill"
          aria-label="Entrar"
        >
          ENTRAR
        </Link>
      </div>

      {/* ============================================================
          CONTEÚDO PRINCIPAL — eyebrow, headline, CTAs
          ============================================================ */}
      <div className="hero-mobile-content">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="hero-mobile-eyebrow"
        >
          • SKINS · RIFAS · MERCADO
        </motion.span>

        <h1 className="hero-mobile-headline">
          {["COMPRA.", "VENDA.", "CONCORRA."].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 28 }}
              transition={{
                duration: 0.75,
                delay: 0.4 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: "block" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 14 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hero-mobile-sub"
        >
          Skins de CS2, rifas e mercado direto. Sem enrolação.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16 }}
          transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="hero-mobile-ctas"
        >
          <a href="#skins-destaque" className="hero-mobile-cta-primary">
            Ver catálogo
          </a>
          <Link href="/login" className="hero-mobile-cta-ghost">
            Fazer login
          </Link>
        </motion.div>

        {/* Indicador de scroll animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 0.7 : 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="hero-mobile-scroll-hint"
          aria-hidden
        >
          <span>SCROLL</span>
          <div className="hero-mobile-scroll-line">
            <div className="hero-mobile-scroll-dot" />
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          DRAWER — menu mobile premium
          ============================================================ */}
      {menuOpen ? (
        <div className="hero-mobile-drawer-root" role="dialog" aria-modal="true">
          <div
            className="hero-mobile-drawer-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside className="hero-mobile-drawer">
            <div className="hero-mobile-drawer-head">
              <span className="hero-mobile-drawer-title">Menu</span>
              <button
                type="button"
                className="hero-mobile-drawer-close"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Navegação principal">
              <ul className="hero-mobile-drawer-list">
                {NAV_LINKS.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.disabled ? undefined : it.href}
                      onClick={() => !it.disabled && setMenuOpen(false)}
                      aria-disabled={it.disabled || undefined}
                      className={`hero-mobile-drawer-link ${
                        it.disabled ? "is-disabled" : ""
                      }`}
                    >
                      <span>{it.label}</span>
                      {!it.disabled ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      ) : (
                        <span className="hero-mobile-drawer-soon">EM BREVE</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="hero-mobile-drawer-foot">
              <Link
                href="/login"
                className="hero-mobile-cta-primary w-full"
                onClick={() => setMenuOpen(false)}
              >
                Entrar / Cadastrar
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
