"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Área reservada na hero para mídia substituível (Three.js, `<video muted playsInline>`, etc.).
 * Não faz parte do `ScrollDrivenHeroGallery` — não herda o translate horizontal dos cards.
 *
 * Troca: substitua o conteúdo default em `Hero` ou passe `mediaSlot` desde `app/page.tsx`.
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
 * Ciclo 0002: slot de mídia + altura da capa ligeiramente estendida.
 */
export default function Hero({
  loading,
  mediaSlot,
}: {
  loading: boolean;
  /** Se omitido, usa o placeholder em `public/hero-media-placeholder.svg`. */
  mediaSlot?: ReactNode;
}) {
  const show = !loading;

  const headline = ["COMPRA.", "VENDA.", "CONCORRA."];

  return (
    <section
      className="relative min-h-[115vh] w-full overflow-hidden pb-16 md:pb-20"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
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
        className="relative z-10 flex items-center justify-between px-[5vw] py-6 text-[11px] tracking-[0.28em] uppercase"
      >
        <div
          className="font-bold text-sm tracking-[0.2em]"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          DR<span style={{ color: "var(--accent)" }}>·</span>BLACK
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <ul
          className="hidden md:flex items-center gap-10"
          style={{ color: "var(--foreground-muted)" }}
        >
          <li className="hover:text-[var(--highlight)] cursor-pointer transition">
            Catálogo
          </li>
          <li className="hover:text-[var(--highlight)] cursor-pointer transition">
            Rifas
          </li>
          <li className="hover:text-[var(--highlight)] cursor-pointer transition">
            Coleções
          </li>
          <li className="hover:text-[var(--highlight)] cursor-pointer transition">
            Sobre
          </li>
        </ul>

        <button
          className="px-4 py-2 text-[10px] font-semibold tracking-[0.28em] transition"
          style={{
            border: "1px solid var(--accent)",
            color: "var(--highlight)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--on-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--highlight)";
          }}
        >
          ENTRAR
        </button>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: show ? 1 : 0, x: show ? 0 : -20 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="relative z-10 mt-12 md:mt-16 px-[5vw] max-w-md text-[13px] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        <p>
          Skins de CS2, rifas e mercado no mesmo lugar. Compra, vende, concorre —
          direto, sem enrolação.
        </p>
      </motion.div>

      <div className="relative z-10 mt-[5vh] md:mt-[8vh] px-[5vw]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1 select-none">
            <h1
              style={{
                fontFamily: "var(--font-oswald), sans-serif",
                fontWeight: 700,
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
                fontSize: "clamp(64px, 12vw, 200px)",
                color: "var(--foreground)",
              }}
            >
              {headline.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{
                    opacity: show ? 1 : 0,
                    y: show ? 0 : 40,
                    scale: show ? 1 : 0.96,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.7 + i * 0.15,
                    ease: [0.2, 0.7, 0.2, 1],
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
                        }
                      : undefined
                  }
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </div>

          {mediaSlot ? (
            <div className="flex flex-1 justify-center lg:justify-end">
              {mediaSlot}
            </div>
          ) : (
            <HeroMediaSlot>
              <Image
                src="/hero-media-placeholder.svg"
                alt=""
                fill
                className="object-cover"
                aria-hidden
              />
            </HeroMediaSlot>
          )}
        </div>
      </div>
    </section>
  );
}
