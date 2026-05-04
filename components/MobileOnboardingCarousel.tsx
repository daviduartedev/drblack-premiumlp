"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/components/MobileOnboardingCarousel.css";

/**
 * MobileOnboardingCarousel — tela de onboarding mobile estilo "adidas adiclub":
 *  - Fullscreen, vídeo vertical CS2 como background (PLACEHOLDER por enquanto).
 *  - Indicadores de progresso (3) no topo.
 *  - Header: logo TEXTO GOLD | risco vertical | logo DR Black + botão X de fechar.
 *  - CTAs grandes na parte inferior: "IR PARA O SITE" e "FAZER LOGIN".
 *  - Cada slide avança automaticamente após X segundos; usuário pode tocar nas
 *    laterais para passar manualmente (zona esquerda volta, direita avança).
 *  - Bloqueia scroll do body enquanto aberto.
 *
 * Layout pronto para receber vídeos: basta preencher `video` em cada slide do
 * array `SLIDES` abaixo. Quando `video` estiver presente, a tag <video> é
 * renderizada automaticamente no lugar do placeholder.
 */

type Slide = {
  /** Vídeo vertical de fundo (CS2). Se vazio, mostra placeholder. */
  video?: string;
  /** Headline principal — uppercase, grande. */
  headline: string;
  /** Sublinha discreta abaixo do headline. */
  subline: string;
  /**
   * Variante visual do placeholder (1, 2, 3) — gera gradients diferentes para
   * cada slide enquanto não há vídeo. Mantém a UX de "muda algo" entre slides.
   */
  placeholderVariant: 1 | 2 | 3;
};

const SLIDES: Slide[] = [
  {
    // video: "/onboarding-videos/cs2-clip-1.mp4",
    headline: "COMPRA",
    subline: "as melhores skins de CS2",
    placeholderVariant: 1,
  },
  {
    // video: "/onboarding-videos/cs2-clip-2.mp4",
    headline: "VENDA",
    subline: "direto, sem enrolação",
    placeholderVariant: 2,
  },
  {
    // video: "/onboarding-videos/cs2-clip-3.mp4",
    headline: "CONCORRA",
    subline: "rifas exclusivas todo dia",
    placeholderVariant: 3,
  },
];

/** Duração de cada slide antes de avançar automaticamente (ms). */
const SLIDE_DURATION_MS = 5200;

type Props = {
  onClose: () => void;
};

export default function MobileOnboardingCarousel({ onClose }: Props) {
  const [active, setActive] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  /** Anima a entrada (fade-in). */
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  /** Bloqueia scroll do body enquanto a tela estiver aberta. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /** ESC fecha a tela. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Auto-avanço: a cada `SLIDE_DURATION_MS`, vai para o próximo slide.
   * Quando chega no último, volta ao primeiro em loop.
   */
  const goTo = useCallback((idx: number) => {
    setActive((prev) => {
      const next = (idx + SLIDES.length) % SLIDES.length;
      if (next !== prev) startedAtRef.current = Date.now();
      return next;
    });
  }, []);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setActive((p) => (p + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active]);

  /**
   * Garante que apenas o vídeo do slide ativo está tocando — pausa os demais.
   * Só roda se houver vídeos definidos no `SLIDES`.
   */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        try {
          v.currentTime = 0;
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {
          /* iOS pode lançar se o elemento ainda não carregou */
        }
      } else {
        try {
          v.pause();
        } catch {
          /* noop */
        }
      }
    });
  }, [active]);

  /**
   * Toque nas laterais avança/volta. Zona central é "passiva" (não interfere
   * para que o usuário possa apenas assistir o vídeo).
   */
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - target.left;
      const ratio = x / target.width;
      if (ratio < 0.33) prev();
      else if (ratio > 0.66) next();
    },
    [next, prev]
  );

  return (
    <div
      className={`mob-onb-root${isMounted ? " is-mounted" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Boas-vindas — DR Black Skins"
    >
      {/* ============================================================
          BACKGROUND — placeholder por slide (vídeos serão adicionados depois)
          ============================================================ */}
      <div className="mob-onb-bg" aria-hidden>
        {SLIDES.map((slide, i) =>
          slide.video ? (
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              key={`v-${i}`}
              className={`mob-onb-video${i === active ? " is-active" : ""}`}
              src={slide.video}
              muted
              playsInline
              loop
              preload={i === 0 ? "auto" : "metadata"}
              disableRemotePlayback
            />
          ) : (
            <div
              key={`p-${i}`}
              className={`mob-onb-placeholder mob-onb-placeholder-${slide.placeholderVariant}${
                i === active ? " is-active" : ""
              }`}
            />
          )
        )}
        <div className="mob-onb-overlay" />
      </div>

      {/* ============================================================
          ZONAS DE TOQUE — esquerda volta, direita avança
          ============================================================ */}
      <div
        className="mob-onb-tap-zones"
        onClick={handleTap}
        aria-hidden
      />

      {/* ============================================================
          PROGRESS BARS — 3 indicadores no topo
          ============================================================ */}
      <div className="mob-onb-progress" aria-hidden>
        {SLIDES.map((_, i) => (
          <div key={i} className="mob-onb-progress-track">
            <div
              className={`mob-onb-progress-fill${
                i < active ? " is-done" : ""
              }${i === active ? " is-active" : ""}`}
              style={
                i === active
                  ? { animationDuration: `${SLIDE_DURATION_MS}ms` }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* ============================================================
          HEADER — logo TEXTO GOLD | risco | logo DR Black + X
          ============================================================ */}
      <header className="mob-onb-header">
        <div className="mob-onb-brand">
          <Image
            src="/TEXTO GOLD (1).png"
            alt="DR Black Skins"
            width={220}
            height={56}
            className="mob-onb-brand-text"
            priority
          />
          <span className="mob-onb-brand-divider" aria-hidden />
          <Image
            src="/gallery/13bc242a-1908-46cf-bcfa-9ccd9633dafa_1.webp"
            alt=""
            width={56}
            height={56}
            className="mob-onb-brand-logo"
            priority
          />
        </div>

        <button
          type="button"
          className="mob-onb-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {/* ============================================================
          CONTEÚDO CENTRAL — headline + subline
          ============================================================ */}
      <div className="mob-onb-content">
        <span className="mob-onb-badge" aria-hidden>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7l1.6 3.4 3.7.4-2.8 2.6.8 3.7L12 15.3 8.7 17.1l.8-3.7L6.7 10.8l3.7-.4L12 7z" />
          </svg>
        </span>

        <h2 key={`h-${active}`} className="mob-onb-headline">
          {SLIDES[active].headline}
        </h2>
        <p key={`p-${active}`} className="mob-onb-subline">
          {SLIDES[active].subline}
        </p>
      </div>

      {/* ============================================================
          CTAs — IR PARA O SITE / FAZER LOGIN
          ============================================================ */}
      <div className="mob-onb-ctas">
        <button
          type="button"
          className="mob-onb-cta mob-onb-cta-primary"
          onClick={onClose}
        >
          <span>IR PARA O SITE</span>
          <Arrow />
        </button>
        <Link
          href="/login"
          className="mob-onb-cta mob-onb-cta-secondary"
          onClick={onClose}
        >
          <span>FAZER LOGIN</span>
          <Arrow />
        </Link>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 24 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 8h18M14 2l6 6-6 6" />
    </svg>
  );
}
