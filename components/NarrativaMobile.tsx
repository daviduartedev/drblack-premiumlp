"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * NarrativaMobile — substitui a seção `continua-narrativa` no mobile.
 *
 * Estilo: WebGL/Framer mas SEM três.js (custo zero):
 *  - Background com 2 conic gradients animados (orbs de cor) que dão a sensação
 *    de luz volumétrica do LightPillar mas em CSS puro.
 *  - AWP central com parallax inverso ao scroll (sobe enquanto a seção sobe).
 *  - Headline com glitch sutil + chip "FEATURED".
 *  - Brilho dinâmico nos cantos.
 */

export default function NarrativaMobile() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const awpY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [60, -60]
  );
  const awpScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [0.92, 1.05, 0.92]
  );
  const headlineY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [30, -30]
  );

  return (
    <section
      ref={ref}
      id="continua-narrativa-mobile"
      className="narrativa-mobile-root"
      aria-label="Continua a história"
    >
      {/* Aurora 1 — orb violeta/rosa */}
      <div aria-hidden className="narrativa-mobile-aurora narrativa-mobile-aurora-a" />
      {/* Aurora 2 — orb laranja (acento da marca) */}
      <div aria-hidden className="narrativa-mobile-aurora narrativa-mobile-aurora-b" />
      {/* Grid sutil */}
      <div aria-hidden className="narrativa-mobile-grid" />
      {/* Vinheta */}
      <div aria-hidden className="narrativa-mobile-vignette" />

      <div className="narrativa-mobile-stack">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="narrativa-mobile-chip"
        >
          <span className="narrativa-mobile-chip-dot" />
          DESTAQUE
        </motion.div>

        <motion.h2
          style={{ y: headlineY }}
          className="narrativa-mobile-headline"
        >
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="narrativa-mobile-headline-line"
          >
            Sua próxima
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="narrativa-mobile-headline-line narrativa-mobile-headline-accent"
          >
            obra-prima
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="narrativa-mobile-headline-line"
          >
            te espera.
          </motion.span>
        </motion.h2>

        {/* AWP — figura central, parallax + scale */}
        <motion.div
          className="narrativa-mobile-awp"
          style={{ y: awpY, scale: awpScale }}
        >
          {/* Glow atrás da AWP */}
          <div aria-hidden className="narrativa-mobile-awp-glow" />
          <Image
            src="/gallery/AWP%20Light%20(1)%401.5x.png"
            alt=""
            fill
            sizes="100vw"
            quality={92}
            className="object-contain object-center"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="narrativa-mobile-sub"
        >
          Skins selecionadas, rifas exclusivas e o mercado direto — tudo num só lugar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="narrativa-mobile-cta-wrap"
        >
          <a href="#skins-destaque" className="narrativa-mobile-cta">
            Ver skins em destaque
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
          </a>
        </motion.div>
      </div>
    </section>
  );
}
