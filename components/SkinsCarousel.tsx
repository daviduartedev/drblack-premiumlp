"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Skins em destaque — faixa full-bleed + marquee contínuo (duplicado em JS).
 * Cards na paleta da marca (sem verde). prefers-reduced-motion: scroll manual.
 */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const HEADER_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const HEADER_WORD: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -65 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
};

const HEADER_LINE: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO },
  },
};

const VIEWPORT_OPTS = { once: true, margin: "-10%" };

const USQ = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=1200&q=90&auto=format&fit=crop`;

export type FeaturedSkin = {
  id: string;
  src: string;
  index: string;
  title: string;
  subtitle: string;
  price?: string;
  href?: string;
};

const FEATURED: FeaturedSkin[] = [
  {
    id: "u-rifle",
    src: USQ("photo-1769430534992-0c5f4a6c3fa3"),
    index: "01 · RIFLE TÁTICO",
    title: "M4A1 | Comando",
    subtitle: "Field-Tested",
    price: "R$ 2.180",
    href: "#",
  },
  {
    id: "u-pistol",
    src: USQ("photo-1713643560166-eeaf7b12a49f"),
    index: "02 · NOTURNO",
    title: "Glock-18 | Sombra",
    subtitle: "Minimal Wear",
    price: "R$ 980",
    href: "#",
  },
  {
    id: "u-karambit",
    src: USQ("photo-1577983770799-380cd543c064"),
    index: "03 · FACA CURVA",
    title: "★ Karambit | Carbon",
    subtitle: "Factory New",
    price: "R$ 14.200",
    href: "#",
  },
  {
    id: "u-usp",
    src: USQ("photo-1589728473894-4fb97b4dbb88"),
    index: "04 · INOX",
    title: "USP-S | Pulse",
    subtitle: "Well-Worn",
    price: "R$ 1.450",
    href: "#",
  },
  {
    id: "u-pocket",
    src: USQ("photo-1623998023424-1af3a2e589f4"),
    index: "05 · CANIVETE",
    title: "Bayonet | Dobrável",
    subtitle: "Minimal Wear",
    price: "R$ 6.780",
    href: "#",
  },
  {
    id: "u-orange",
    src: USQ("photo-1584435191093-2d9ed132c88d"),
    index: "06 · STRIKE",
    title: "Talon | Blaze Line",
    subtitle: "Battle-Scarred",
    price: "R$ 3.260",
    href: "#",
  },
];

const HEADER_TITLE_WORDS = ["Skins", "em", "destaque"] as const;

/** Tokens da marca — cards escuros + laranja / dourado */
const CARD = {
  bg: "var(--background-raised)",
  fg: "var(--foreground)",
  muted: "var(--foreground-muted)",
  tagBorder: "var(--line)",
  tagFg: "var(--highlight)",
  imageWell: "rgba(255, 255, 255, 0.06)",
  imageRing: "rgba(255, 193, 7, 0.15)",
  ctaBg: "var(--accent)",
  ctaFg: "var(--on-accent)",
} as const;

const CARD_WIDTH = "min(460px, 92vw)";

function tagsFromSkin(skin: FeaturedSkin): string[] {
  const after = skin.index.split("·")[1]?.trim();
  const tags = [after, skin.subtitle].filter(Boolean) as string[];
  return tags.slice(0, 3);
}

function cardDescription(skin: FeaturedSkin): string {
  const bits = [
    `Ilustração Unsplash — ${skin.subtitle}.`,
    skin.price ? ` Referência ${skin.price}.` : "",
  ];
  return bits.join("");
}

export default function SkinsCarousel() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="skins-destaque"
      aria-label="Skins em destaque"
      className="relative overflow-hidden py-[var(--section-py)]"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto mb-10 max-w-[var(--content-max)] px-[var(--gutter)] md:mb-12">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTS}
          variants={HEADER_CONTAINER}
          className="flex flex-col gap-3"
        >
          <div style={{ perspective: reducedMotion ? undefined : "900px" }}>
            <motion.h2
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="t-h2 overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              {HEADER_TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  variants={HEADER_WORD}
                  className="inline-block"
                  style={{
                    marginRight:
                      i < HEADER_TITLE_WORDS.length - 1 ? "0.25em" : 0,
                    transformStyle: "preserve-3d",
                    willChange: reducedMotion ? undefined : "transform, opacity",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              variants={HEADER_LINE}
              className="t-body-sm mt-3"
              style={{ maxWidth: "44ch" }}
            >
              Vitrine em movimento contínuo, fotos ilustrativas (Unsplash), estilo
              CS2.
            </motion.p>
          </div>
        </motion.header>
      </div>

      <div
        className="relative w-screen min-w-0 max-w-[100vw] shrink-0"
        style={{ marginLeft: "calc(50% - 50vw)" }}
      >
        <div
          className="skins-marquee-mask relative w-full"
          style={
            ({
              "--skins-marquee-duration": "52s",
              "--skins-marquee-gap": "20px",
            } as CSSProperties)
          }
        >
          <div className="skins-marquee-track flex w-max flex-row flex-nowrap">
            {FEATURED.map((skin) => (
              <FeaturedSkinCard
                key={skin.id}
                skin={skin}
                width={CARD_WIDTH}
              />
            ))}
            {FEATURED.map((skin) => (
              <FeaturedSkinCard
                key={`${skin.id}-loop`}
                skin={skin}
                width={CARD_WIDTH}
                duplicate
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedSkinCard({
  skin,
  width,
  duplicate = false,
}: {
  skin: FeaturedSkin;
  width: string;
  duplicate?: boolean;
}) {
  const tags = tagsFromSkin(skin);
  const desc = cardDescription(skin);

  const cardInner = (
    <>
      <div className="min-w-0 flex-1">
        <h3
          className="text-[clamp(17px,2.1vw,22px)] font-semibold uppercase leading-snug tracking-tight"
          style={{
            fontFamily: "var(--font-oswald), sans-serif",
            color: CARD.fg,
          }}
        >
          {skin.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide md:text-xs"
              style={{
                borderColor: CARD.tagBorder,
                color: CARD.tagFg,
                fontFamily: "var(--font-geist-sans), sans-serif",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,120px)_1fr] sm:gap-5 md:grid-cols-[minmax(0,140px)_1fr]">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-2xl sm:w-[120px] md:w-[140px]"
            style={{
              background: CARD.imageWell,
              boxShadow: `inset 0 0 0 1px ${CARD.imageRing}`,
            }}
          >
            <Image
              src={skin.src}
              alt={duplicate ? "" : `${skin.title}, imagem ilustrativa`}
              fill
              sizes="(max-width: 640px) 88vw, 140px"
              quality={90}
              className="object-cover"
            />
          </div>
          <div
            className="flex min-h-0 min-w-0 flex-col justify-between text-[12px] leading-relaxed md:text-[13px]"
            style={{
              color: CARD.muted,
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            <p>{desc}</p>
            {skin.price ? (
              <p
                className="mt-2 font-semibold"
                style={{ color: "var(--accent)" }}
              >
                {skin.price}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full transition group-hover:scale-105 md:bottom-5 md:right-5 md:size-11"
        style={{
          background: CARD.ctaBg,
          color: CARD.ctaFg,
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        <ChevronRightIcon />
      </span>
    </>
  );

  const shellClass =
    "skin-card-link group relative flex min-h-[220px] flex-col rounded-[24px] p-5 shadow-none transition-[transform,box-shadow] duration-300 md:min-h-[240px] md:p-6";

  const shellStyle: CSSProperties = {
    background: CARD.bg,
    color: CARD.fg,
  };

  if (duplicate) {
    return (
      <div
        className="pointer-events-none shrink-0 flex-none select-none"
        style={{ width }}
        aria-hidden
      >
        <div className={`${shellClass} pointer-events-none`} style={shellStyle}>
          {cardInner}
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 flex-none" style={{ width }}>
      <a
        data-skin-card
        href={skin.href ?? "#"}
        className={shellClass}
        style={shellStyle}
      >
        {cardInner}
      </a>
    </div>
  );
}
