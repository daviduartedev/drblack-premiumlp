"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HeroMobile from "@/components/HeroMobile";
import "@/components/HeroMobile.css";

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
      className={`relative aspect-video w-full max-w-[min(92vw,520px)] overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_0_48px_rgba(247,147,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

type NavItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

const NAV_LINKS: NavItem[] = [
  { label: "Catálogo", href: "#skins-destaque" },
  { label: "Rifas", href: "/rifas" },
  { label: "Sobre", href: "#", disabled: true },
];

/**
 * Hero — estilo vitrine cinematográfico (layout tipo referência KPR):
 * moldura fina, fundo só em CSS (sem foto), navegação centrada no desktop,
 * texto curto canto superior esquerdo, headline caps à direita em baixo, SCROLL.
 */
export default function Hero({ loading }: { loading: boolean }) {
  const show = !loading;

  const headline = ["COMPRA.", "VENDA.", "CONCORRA."];
  const headlineOffsetX: Record<string, number> = {
    "VENDE.": 205,
    "CONCORRA.": -220,
  };

  const navLinkClass = (disabled?: boolean) =>
    disabled
      ? "hero-min-black-outline t-eyebrow transition"
      : "hero-min-black-outline hero-nav-catalog-link t-eyebrow cursor-pointer transition";

  return (
    <>
      {/* ============================================================
          Mobile (≤ 767px) — experiência exclusiva, vídeo CS2 vertical.
          Desktop é renderizado abaixo intacto.
          ============================================================ */}
      <div className="block md:hidden">
        <HeroMobile loading={loading} />
      </div>

      {/* ============================================================
          Desktop (≥ 768px) — markup original 100% preservado.
          ============================================================ */}
      <section
      className="hero-desktop-section relative min-h-[100svh] w-full overflow-hidden border border-white/20 hidden md:block"
      style={{
        color: "var(--foreground)",
      }}
    >
      <div
        aria-hidden
        className="hero-brand-backdrop pointer-events-none absolute inset-0 z-0"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        {/* Barra superior — logo | nav centrada (md+) | CTA */}
        <div className="content-wrap section-padding-x relative flex w-full shrink-0 items-center py-6">
          <div className="relative z-[2] min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Image
                src="/new-logo.png"
                alt="Logo DR Black"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
              <div
                className="hero-min-black-outline truncate font-bold text-sm uppercase"
                style={{
                  fontFamily: "var(--font-oswald), sans-serif",
                  letterSpacing: "0.2em",
                }}
              >
                DR<span style={{ color: "var(--accent)" }}>·</span>BLACK
                <span style={{ color: "var(--accent)" }}>.</span>
              </div>
            </div>
          </div>

          <nav
            aria-label="Secções"
            className="absolute left-1/2 top-1/2 z-[2] hidden -translate-x-1/2 -translate-y-1/2 md:block"
          >
            <ul className="flex items-center gap-10">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  {item.disabled ? (
                    <a
                      href={item.href}
                      aria-disabled="true"
                      tabIndex={-1}
                      title="Em breve"
                      className={navLinkClass(true)}
                      style={{
                        cursor: "not-allowed",
                        color: "var(--foreground-faint)",
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      className={navLinkClass(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-[2] ml-auto shrink-0">
            <Link href="/login" className="hero-kpr-cta">
              ENTRAR
            </Link>
          </div>
        </div>

        {/* Nav mobile */}
        <div className="content-wrap section-padding-x pb-2 md:hidden">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((item) => (
              <li key={`m-${item.label}`}>
                {item.disabled ? (
                  <a
                    href={item.href}
                    aria-disabled="true"
                    tabIndex={-1}
                    title="Em breve"
                    className={navLinkClass(true)}
                    style={{
                      cursor: "not-allowed",
                      color: "var(--foreground-faint)",
                    }}
                  >
                    {item.label}
                  </a>
                ) : (
                  <a href={item.href} className={navLinkClass(false)}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna editorial + headline + scroll */}
        <div className="flex min-h-0 flex-1 flex-col content-wrap section-padding-x pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: show ? 1 : 0,
              y: show ? 0 : 16,
            }}
            transition={{
              duration: 0.75,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-[min(44ch,100%)] pt-2 md:pt-4"
            style={{
              marginLeft:
                "calc(-1 * var(--gutter) - clamp(16px, 3.5vw, 40px))",
            }}
          >
            <p className="hero-min-black-outline t-body-sm">
              Skins de CS2, rifas e mercado no mesmo lugar. Compra, vende,
              concorre, direto, sem enrolação.
            </p>
          </motion.div>

          <div className="flex min-h-0 flex-1 flex-col justify-end pt-10 md:pt-16">
            <div className="w-full text-right">
              <h1 className="hero-kpr-headline">
                {headline.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 48 }}
                    animate={{
                      opacity: show ? 1 : 0,
                      y: show ? 0 : 48,
                    }}
                    transition={{
                      duration: 0.85,
                      delay: 0.5 + i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="block"
                    style={{
                      willChange: "transform, opacity",
                      x: headlineOffsetX[word] ?? 0,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>
          </div>

          <div className="flex justify-end pt-8 md:pt-10">
            <span
              className="hero-min-black-outline t-card-sub uppercase"
              style={{ letterSpacing: "0.28em" }}
            >
              SCROLL ↓
            </span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
