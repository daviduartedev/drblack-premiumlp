"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Área reservada na hero para mídia substituível (Three.js, `<video muted playsInline>`, etc.).
 * Não faz parte do `ScrollDrivenHeroGallery` — não herda o translate horizontal dos cards.
 *
 * Ciclo 0005: não é consumido pelo `Hero` (a prop `mediaSlot` foi removida). Mantido exportado
 * para cycles futuras que reintroduzam mídia na capa.
 */
export function HeroMediaSlot({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="hero-media"
      className={`relative aspect-video w-full max-w-[min(92vw,520px)] overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_0_48px_rgba(255,92,10,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Hero — face pós-loader (rebrand laranja/creme, spec rebrand-2026-q1).
 * Ciclo 0002: slot de mídia + altura da capa.
 * Ciclo 0005: tipografia/spacings via tokens; sem coluna de mídia;
 * altura `min-h-[100svh]` para casar com a galeria pinada e evitar que
 * `100vh` — maior que o ecrã visível em vários browsers — revele logo a próxima secção.
 */
export default function Hero({ loading }: { loading: boolean }) {
  const show = !loading;

  const headline = ["COMPRA.", "VENDE.", "CONCORRA."];

  return (
    <section
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        paddingBottom: "var(--space-7)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 30%, #1a0f0a 0%, #0f0c0a 45%, #0a0a0a 80%, #000 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-[10%] top-[5%] w-[70%] h-[80%] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,92,10,0.45), rgba(255,122,61,0.15) 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -left-[10%] bottom-[-20%] w-[70%] h-[70%] opacity-38 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(204,74,8,0.45), rgba(10,10,10,0.2) 55%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ff5c0a 1px, transparent 1px), linear-gradient(to bottom, #ff5c0a 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : -12 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex items-center justify-between section-padding-x py-6"
      >
        <div
          className="font-bold text-sm"
          style={{
            fontFamily: "var(--font-oswald), sans-serif",
            letterSpacing: "0.2em",
          }}
        >
          DR<span style={{ color: "var(--accent)" }}>·</span>BLACK
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <ul className="hidden md:flex items-center gap-10">
          <li>
            <a
              href="#skins-destaque"
              className="hero-nav-catalog-link t-eyebrow cursor-pointer transition"
            >
              Catálogo
            </a>
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              tabIndex={-1}
              title="Em breve"
              className="t-eyebrow transition"
              style={{
                cursor: "not-allowed",
                color: "var(--foreground-faint)",
              }}
            >
              Rifas
            </a>
          </li>
          <li>
            <a
              href="#"
              aria-disabled="true"
              tabIndex={-1}
              title="Em breve"
              className="t-eyebrow transition"
              style={{
                cursor: "not-allowed",
                color: "var(--foreground-faint)",
              }}
            >
              Sobre
            </a>
          </li>
        </ul>

        <button type="button" className="btn-ghost t-cta">
          ENTRAR
        </button>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, x: -60, rotateX: -25, scale: 0.92 }}
        animate={{
          opacity: show ? 1 : 0,
          x: show ? 0 : -60,
          rotateX: show ? 0 : -25,
          scale: show ? 1 : 0.92,
        }}
        transition={{
          duration: 0.95,
          delay: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 mt-12 md:mt-16 section-padding-x t-body-sm"
        style={{
          maxWidth: "44ch",
          perspective: 800,
          transformStyle: "preserve-3d",
        }}
      >
        <p>
          Skins de CS2, rifas e mercado no mesmo lugar. Compra, vende, concorre —
          direto, sem enrolação.
        </p>
      </motion.div>

      <div
        className="relative z-10 mt-[5vh] md:mt-[8vh] section-padding-x"
        style={{ perspective: 1200 }}
      >
        <div className="min-w-0 select-none" style={{ transformStyle: "preserve-3d" }}>
          <h1 className="t-h1">
            {headline.map((word, i) => (
              <motion.span
                key={word}
                initial={{
                  opacity: 0,
                  y: 90,
                  x: -120,
                  rotateY: -55,
                  scale: 0.7,
                }}
                animate={{
                  opacity: show ? 1 : 0,
                  y: show ? 0 : 90,
                  x: show ? 0 : -120,
                  rotateY: show ? 0 : -55,
                  scale: show ? 1 : 0.7,
                }}
                transition={{
                  duration: 1.1,
                  delay: 0.65 + i * 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block"
                style={
                  i === headline.length - 1
                    ? {
                        background:
                          "linear-gradient(90deg, #b83d00 0%, #ff5c0a 40%, #ff7a3d 52%, #ff5c0a 68%, #eed9c4 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        transformStyle: "preserve-3d",
                        willChange: "transform, opacity",
                      }
                    : {
                        transformStyle: "preserve-3d",
                        willChange: "transform, opacity",
                      }
                }
              >
                {word}
              </motion.span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
