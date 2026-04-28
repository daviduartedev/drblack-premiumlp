"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";
import KprCard from "@/components/KprCard";

/**
 * Skins em destaque — faixa contínua estilo Framer (marquee infinito, sem setas).
 *
 * - Imagens: Unsplash (fotos táticas / facas / airsoft — ilustrativas, não skins
 *   oficiais da Valve; `next.config.ts` declara `images.unsplash.com`).
 * - Duas passagens do mesmo lote + `translateX(-50%)` em `globals.css` → loop
 *   contínuo. Cópia duplicada: `aria-hidden` + `pointer-events: none` (só a
 *   primeira fila leva links e teclado).
 * - Abertura na viewport: perspectiva + faixa em “linha” (`rotateX` + `scaleX` baixo)
 *   expandindo ao plano; cada card afasta-se do eixo central com atraso escalonado.
 * - `prefers-reduced-motion: reduce` — sem 3D/cards-emergência; marquee sem anim
 *   (mask com scroll) via `globals.css`.
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

export default function SkinsCarousel() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="skins-destaque"
      aria-label="Skins em destaque"
      className="section-padding relative"
      style={{ background: "var(--background)" }}
    >
      <div className="content-wrap">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTS}
          variants={HEADER_CONTAINER}
          className="mb-10 flex flex-col gap-3 md:mb-12"
        >
          <div style={{ perspective: "900px" }}>
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
                    willChange: "transform, opacity",
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

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-[2]"
            style={{
              width: "var(--gutter)",
              background:
                "linear-gradient(to right, var(--background), transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-[2]"
            style={{
              width: "var(--gutter)",
              background:
                "linear-gradient(to left, var(--background), transparent)",
            }}
          />
          {/* Abertura 3D: faixa parte como “linha” no centro do plano e expande para os lados */}
          <div
            className="relative"
            style={
              reducedMotion
                ? undefined
                : ({
                    perspective: "min(1400px, 155vw)",
                    perspectiveOrigin: "50% 42%",
                  } as CSSProperties)
            }
          >
            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      rotateX: 82,
                      scaleX: 0.022,
                      opacity: 0.82,
                      y: 36,
                      filter: "blur(6px)",
                    }
              }
              whileInView={
                reducedMotion
                  ? undefined
                  : {
                      rotateX: 0,
                      scaleX: 1,
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }
              }
              viewport={reducedMotion ? undefined : VIEWPORT_OPTS}
              transition={{
                rotateX: { duration: reducedMotion ? 0 : 1.22, ease: EASE_OUT_EXPO },
                scaleX: { duration: reducedMotion ? 0 : 1.22, ease: EASE_OUT_EXPO },
                opacity: { duration: reducedMotion ? 0 : 1.22, ease: EASE_OUT_EXPO },
                y: { duration: reducedMotion ? 0 : 1.22, ease: EASE_OUT_EXPO },
                filter: {
                  duration: reducedMotion ? 0 : 0.78,
                  delay: reducedMotion ? 0 : 0.1,
                  ease: EASE_OUT_EXPO,
                },
              }}
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "50% 50%",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className="skins-marquee-mask relative"
                style={
                  ({
                    "--skins-marquee-duration": "52s",
                  } as CSSProperties)
                }
              >
                <div className="skins-marquee-track">
                  {FEATURED.map((skin, i) => (
                    <SkinCard
                      key={skin.id}
                      skin={skin}
                      emergeIndex={i}
                      emergeTotal={FEATURED.length}
                    />
                  ))}
                  {FEATURED.map((skin, i) => (
                    <SkinCard
                      key={`${skin.id}-marquee-loop`}
                      skin={skin}
                      duplicate
                      emergeIndex={i}
                      emergeTotal={FEATURED.length}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * SkinCard — wrapper sobre o KprCard (link ou cópia decorativa)
 * ============================================================ */
function SkinCard({
  skin,
  duplicate = false,
  emergeIndex = 0,
  emergeTotal = 1,
}: {
  skin: FeaturedSkin;
  duplicate?: boolean;
  emergeIndex?: number;
  emergeTotal?: number;
}) {
  const reducedMotionLocal = useReducedMotion();
  const cardWidth = "clamp(240px, 22vw, 320px)";
  const center = (emergeTotal - 1) / 2;
  const delta = emergeIndex - center;
  /** Cards à esquerda/direita começam puxados ao eixo central e deslizam para a posição na faixa */
  const lateralShift = reducedMotionLocal ? 0 : -delta * 52;

  const visual = (
    <>
      <div
        className={`transition duration-300 ease-out ${
          duplicate
            ? ""
            : "group-hover:-translate-y-1 group-focus-visible:-translate-y-1 group-active:-translate-y-0.5 group-active:scale-[0.99] group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
        }`}
        style={{ willChange: duplicate ? undefined : "transform, box-shadow" }}
      >
        <KprCard
          src={skin.src}
          alt={duplicate ? "" : `${skin.title}, imagem ilustrativa`}
          index={skin.index}
          hideLabels
          sizes="(min-width: 1024px) 22vw, 80vw"
          quality={90}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[3] flex items-start justify-between p-4"
        >
          <span
            className="t-card-sub"
            style={{
              padding: "6px 10px",
              borderRadius: "10px",
              backgroundColor: "rgba(10,10,10,0.55)",
              border: "1px solid rgba(238,217,196,0.18)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {skin.index}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="t-card-title truncate">{skin.title}</div>
          <div
            className="t-card-sub mt-1 truncate"
            style={{ color: "var(--foreground-faint)" }}
          >
            {skin.subtitle}
          </div>
        </div>
        {skin.price ? (
          <div
            className="shrink-0 font-semibold"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontSize: "16px",
              letterSpacing: "0.01em",
              color: "var(--accent)",
            }}
          >
            {skin.price}
          </div>
        ) : null}
      </div>
    </>
  );

  const emergeTransition = {
    duration: reducedMotionLocal ? 0 : 1.08,
    ease: EASE_OUT_EXPO,
    delay: reducedMotionLocal ? 0 : 0.08 + Math.abs(delta) * 0.065,
  };

  if (duplicate) {
    const inner = (
      <div
        className="relative block h-full w-full pointer-events-none"
        aria-hidden
        tabIndex={-1}
      >
        {visual}
      </div>
    );

    if (reducedMotionLocal) {
      return (
        <div
          className="relative block flex-none pointer-events-none"
          style={{ width: cardWidth }}
          aria-hidden
          tabIndex={-1}
        >
          {visual}
        </div>
      );
    }

    return (
      <motion.div
        className="relative flex-none pointer-events-none"
        style={{ width: cardWidth }}
        initial={{ x: lateralShift, opacity: 0.65, scale: 0.9 }}
        whileInView={{ x: 0, opacity: 1, scale: 1 }}
        viewport={VIEWPORT_OPTS}
        transition={emergeTransition}
      >
        {inner}
      </motion.div>
    );
  }

  if (reducedMotionLocal) {
    return (
      <a
        data-skin-card
        href={skin.href ?? "#"}
        className="skin-card-link group relative block flex-none transition"
        style={{ width: cardWidth }}
      >
        {visual}
      </a>
    );
  }

  return (
    <motion.div
      className="flex-none"
      style={{ width: cardWidth }}
      initial={{ x: lateralShift, opacity: 0.65, scale: 0.9 }}
      whileInView={{ x: 0, opacity: 1, scale: 1 }}
      viewport={VIEWPORT_OPTS}
      transition={emergeTransition}
    >
      <a
        data-skin-card
        href={skin.href ?? "#"}
        className="skin-card-link group relative block w-full transition"
      >
        {visual}
      </a>
    </motion.div>
  );
}
