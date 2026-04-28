"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * UpgradeShowcaseMobile — substitui o ScrollDrivenHeroGallery no mobile.
 *
 * Estilo: Framer/Webflow moderno.
 *  - Sem GSAP pinning agressivo (que ficava desproporcional em mobile).
 *  - Storytelling vertical com cards escalonados, parallax sutil no scroll
 *    e tilt 3D no scroll-into-view (estilo Framer Sites).
 *  - Headline grande com line-by-line reveal.
 *  - Cards full-bleed com radius generoso, sombra premium.
 *  - Inclui um "spotlight" gradient que segue o card visível.
 */

type CardSpec = {
  src: string;
  eyebrow: string;
  title: string;
  copy: string;
};

const CARDS: CardSpec[] = [
  {
    src: "/gallery/card1.jpg",
    eyebrow: "01 · ANTES",
    title: "Inventário padrão.",
    copy: "Skins básicas, faca padrão e luvas que ninguém repara. O perfil entra na sala e ninguém olha duas vezes.",
  },
  {
    src: "/gallery/knife.png",
    eyebrow: "02 · DEPOIS",
    title: "Kits absurdos.",
    copy: "Faca rara, AWP de coleção, luvas premium. Você abre o inventário e a sala inteira para o que está fazendo.",
  },
];

function ShowcaseCard({ card, index }: { card: CardSpec; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Parallax sutil baseado no scroll do card vs viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Imagem sobe levemente conforme entra (parallax)
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  // Card como um todo entra com sutileza
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [0, 0, 0] : [50, 0, -10]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.18, 0.85, 1], [0.4, 1, 1, 0.6]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.96, 1, 1]);

  return (
    <motion.article
      ref={ref}
      className="upgrade-mobile-card"
      style={{
        y: cardY,
        opacity: cardOpacity,
        scale: cardScale,
      }}
    >
      <div className="upgrade-mobile-card-inner">
        <div className="upgrade-mobile-card-media">
          <motion.div
            className="upgrade-mobile-card-img-wrap"
            style={{ y: imageY }}
          >
            <Image
              src={card.src}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              quality={92}
              priority={index === 0}
              className="object-cover"
            />
          </motion.div>
          {/* Vinheta para legibilidade da copy */}
          <div className="upgrade-mobile-card-vignette" aria-hidden />
          {/* Borda animada (gradient sweep) */}
          <div className="upgrade-mobile-card-edge" aria-hidden />
        </div>

        <div className="upgrade-mobile-card-body">
          <span className="upgrade-mobile-eyebrow">{card.eyebrow}</span>
          <h3 className="upgrade-mobile-title">{card.title}</h3>
          <p className="upgrade-mobile-copy">{card.copy}</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function UpgradeShowcaseMobile() {
  const reduced = useReducedMotion();

  // Reveal da headline com stagger por palavra
  const headline = "Dê o upgrade que você merece.";
  const words = headline.split(" ");

  return (
    <section
      id="upgrade-mobile"
      className="upgrade-mobile-root"
      aria-label="Dê o upgrade que você merece"
    >
      {/* Gradiente ambiente (spotlight) */}
      <div aria-hidden className="upgrade-mobile-spotlight" />

      <div className="upgrade-mobile-head">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="upgrade-mobile-section-eyebrow"
        >
          • UPGRADE
        </motion.span>

        <h2 className="upgrade-mobile-headline" aria-label={headline}>
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="upgrade-mobile-headline-word-wrap">
              <motion.span
                className="upgrade-mobile-headline-word"
                initial={reduced ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
                whileInView={
                  reduced ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }
                }
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="upgrade-mobile-sub"
        >
          Skins de CS2, rifas e mercado direto. Sem fricção, sem enrolação.
        </motion.p>
      </div>

      <div className="upgrade-mobile-grid">
        {CARDS.map((c, i) => (
          <ShowcaseCard key={c.src} card={c} index={i} />
        ))}
      </div>

      {/* Scroll hint — sugere continuidade vertical */}
      <div aria-hidden className="upgrade-mobile-foot">
        <span className="upgrade-mobile-foot-dash" />
        <span>Continua</span>
      </div>
    </section>
  );
}
