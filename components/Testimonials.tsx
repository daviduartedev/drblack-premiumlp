"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import AnimatedSectionTitle from "@/components/AnimatedSectionTitle";
import Lightning from "@/components/Lightning";

/**
 * Seção de depoimentos — versão com Lightning de fundo, cards animando das
 * laterais ao scrollar e hover 3D agressivo (tilt + brilho radial seguindo
 * o cursor).
 *
 * Estrutura:
 *   • Camada 0 — Lightning (canvas WebGL) com mixBlendMode "screen"
 *   • Camada 1 — vinheta radial escura empurrando o conteúdo para frente
 *   • Camada 2 — header (selo, título, subtítulo) e grid 2x2 de cards
 *
 * Animações:
 *   • Header: fade + subida
 *   • Cards: cada um entra da lateral oposta (ímpares da esquerda, pares da
 *     direita) com tilt e scale, em cascata via staggerChildren
 *   • Hover: rotateX/Y do card seguindo o cursor (efeito tilt 3D), brilho
 *     radial branco que segue o cursor (mixBlendMode overlay), accent border
 *     que pulsa, scale 1.03 e elevação maior do shadow
 *   • prefers-reduced-motion: cai num fade simples e desativa o Lightning
 */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const VIEWPORT_OPTS = { once: true, margin: "-12%" };

const containerVariantsFull: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const containerVariantsReduced: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
};

const cardVariantFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -120,
    rotateY: 18,
    scale: 0.86,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

const cardVariantFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 120,
    rotateY: -18,
    scale: 0.86,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

const cardVariantReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const headerVariantsFull: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

const headerVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    text: "A Dr. Black Skins transformou minhas partidas. Coleção crescendo, drops semanais e suporte ágil — virei jogador VIP na real.",
    image: "https://i.pravatar.cc/120?img=12",
    name: "Lucas Almeida",
    role: "Pro Player CS2",
  },
  {
    text: "Plataforma rápida, segura e com skins que ninguém mais oferece. Nota 10.",
    image: "https://i.pravatar.cc/120?img=47",
    name: "Mariana Costa",
    role: "Streamer",
  },
  {
    text: "Comprei minha primeira AWP aqui e nunca mais fui o mesmo. Inventário evoluiu absurdamente.",
    image: "https://i.pravatar.cc/120?img=33",
    name: "Rafael Souza",
    role: "Comunidade Diamante",
  },
  {
    text: "Atendimento humano e entrega na hora. Recomendo pra todo mundo do squad.",
    image: "https://i.pravatar.cc/120?img=44",
    name: "Bianca Ferreira",
    role: "Capitã FACEIT",
  },
] as const;

const TILT_SPRING = { stiffness: 220, damping: 20, mass: 0.4 };

function TestimonialCard({
  testimonial,
  variants,
  reducedMotion,
}: {
  testimonial: Testimonial;
  variants: Variants;
  reducedMotion: boolean;
}) {
  // MotionValues para o hover (tilt 3D + brilho seguindo cursor)
  const px = useMotionValue(0.5); // 0..1 — posição X normalizada
  const py = useMotionValue(0.5);

  const sx = useSpring(px, TILT_SPRING);
  const sy = useSpring(py, TILT_SPRING);

  // Rotação do card em graus a partir da posição do cursor
  const rotateY = useTransform(sx, [0, 1], [10, -10]);
  const rotateX = useTransform(sy, [0, 1], [-8, 8]);

  // Posição do brilho radial que acompanha o cursor (em %)
  const glowX = useTransform(sx, [0, 1], [0, 100]);
  const glowY = useTransform(sy, [0, 1], [0, 100]);
  const glowBg = useMotionTemplate`radial-gradient(280px circle at ${glowX}% ${glowY}%, rgba(247,147,0,0.32), transparent 60%)`;

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      px.set(Math.max(0, Math.min(1, nx)));
      py.set(Math.max(0, Math.min(1, ny)));
    },
    [px, py, reducedMotion]
  );

  const onPointerLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return (
    <motion.article
      variants={variants}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.03,
              y: -6,
              transition: { duration: 0.35, ease: EASE_OUT_EXPO },
            }
      }
      className="group relative overflow-hidden rounded-3xl border p-8 md:p-10"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--line-soft)",
        boxShadow:
          "0 18px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset",
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
      }}
    >
      {/* Brilho radial que segue o cursor — só visível no hover (group-hover) */}
      {!reducedMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBg, mixBlendMode: "screen" }}
        />
      ) : null}

      {/* Borda accent que aparece no hover, dando o "snap" agressivo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 0 1px var(--accent), 0 0 28px rgba(247,147,0,0.28), 0 30px 80px rgba(247,147,0,0.18)",
        }}
      />

      {/* Conteúdo do card — posicionado em translateZ para parecer "flutuar" no tilt */}
      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        <p
          className="text-sm leading-relaxed md:text-base"
          style={{ color: "var(--foreground)" }}
        >
          {testimonial.text}
        </p>
        <div className="mt-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={40}
            height={40}
            src={testimonial.image}
            alt={testimonial.name}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            style={{ boxShadow: "inset 0 0 0 1px var(--line-soft)" }}
          />
          <div className="flex flex-col">
            <div
              className="font-medium tracking-tight leading-5"
              style={{ color: "var(--foreground)" }}
            >
              {testimonial.name}
            </div>
            <div
              className="text-sm tracking-tight leading-5"
              style={{ color: "var(--foreground-faint)" }}
            >
              {testimonial.role}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Testimonials() {
  const reducedMotion = useReducedMotion() === true;

  const containerVariants = reducedMotion
    ? containerVariantsReduced
    : containerVariantsFull;
  const headerVariants = reducedMotion
    ? headerVariantsReduced
    : headerVariantsFull;

  // Variants alternadas: ímpares (0,2) → esquerda; pares (1,3) → direita
  const pickVariant = (i: number): Variants => {
    if (reducedMotion) return cardVariantReduced;
    return i % 2 === 0 ? cardVariantFromLeft : cardVariantFromRight;
  };

  return (
    <section
      aria-label="Depoimentos da comunidade"
      className="relative isolate w-full overflow-hidden section-padding"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        paddingBlock: "clamp(64px, 10vw, 128px)",
      }}
    >
      {/* Lightning de fundo — z-0, mixBlendMode screen */}
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden md:block"
          style={{ mixBlendMode: "screen", opacity: 0.7 }}
        >
          <Lightning
            hue={280}
            xOffset={1.3}
            speed={0.5}
            intensity={1.3}
            size={1}
          />
        </div>
      ) : null}

      {/* Vinheta radial — empurra os cantos para o preto, foca no centro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, transparent 0%, rgba(10,10,10,0.55) 70%, rgba(10,10,10,0.92) 100%)",
        }}
      />

      <div className="content-wrap relative z-[2] mx-auto max-w-5xl">
        <motion.header
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTS}
          className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <span
            className="rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-wider"
            style={{
              borderColor: "var(--line-soft)",
              background: "var(--background-raised)",
              color: "var(--foreground-muted)",
            }}
          >
            Depoimentos
          </span>
          <AnimatedSectionTitle
            text="Construído por jogadores, amado por milhares."
            className="t-h2"
            align="center"
            style={{ color: "var(--foreground)" }}
          />
          <p
            className="text-base md:text-lg"
            style={{ color: "var(--foreground-muted)" }}
          >
            Veja o que a comunidade Dr. Black Skins está dizendo sobre nossa
            plataforma, drops semanais e o catálogo exclusivo de skins do CS2.
          </p>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTS}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16"
          style={{ perspective: 1200 }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard
              key={t.name}
              testimonial={t}
              variants={pickVariant(i)}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
