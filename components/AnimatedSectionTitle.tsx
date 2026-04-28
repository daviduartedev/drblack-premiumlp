"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
  type MotionProps,
} from "framer-motion";
import { useMemo, type CSSProperties, type JSX } from "react";

/**
 * AnimatedSectionTitle — animação Framer/Webflow agressiva, palavra-a-palavra,
 * com entrada lateral (alternada esquerda/direita), blur, scale e tilt 3D.
 *
 * Usado em todos os títulos de seção do site para padronizar o efeito de
 * entrada/saída quando o usuário scrolla.
 *
 * Props:
 *   • text — string do título (será fatiada em palavras)
 *   • as — tag HTML (default: h2)
 *   • className — classes extras (ex: "t-h2")
 *   • align — alinhamento ("left" | "center" | "right")
 *   • once — se true, anima apenas 1× ao entrar; default false (replay
 *     no enter/exit estilo Framer)
 *   • delay — atraso inicial (s) antes da cascata
 *   • style — estilo CSS adicional
 *
 * Animação por palavra:
 *   • posição inicial alternada: ímpares à esquerda (-160), pares à direita (+160)
 *   • rotateX -28°, rotateY ±10°, scale 0.6, blur(14px), opacity 0
 *   • → posição final neutra (0,0,0,1, sem blur, opacidade 1)
 *   • duration 0.95s, ease expoOut, stagger 0.08s
 *
 * Acessibilidade: prefers-reduced-motion → fade simples sem transformações.
 */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const containerVariantsReduced: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
  exit: { transition: { staggerChildren: 0 } },
};

const wordVariantLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -160,
    y: 24,
    rotateX: -28,
    rotateY: 10,
    scale: 0.6,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    x: -120,
    rotateX: -20,
    rotateY: 8,
    scale: 0.7,
    filter: "blur(10px)",
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

const wordVariantRight: Variants = {
  hidden: {
    opacity: 0,
    x: 160,
    y: 24,
    rotateX: -28,
    rotateY: -10,
    scale: 0.6,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    x: 120,
    rotateX: -20,
    rotateY: -8,
    scale: 0.7,
    filter: "blur(10px)",
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

const wordVariantReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

type AlignOption = "left" | "center" | "right";

interface AnimatedSectionTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  align?: AlignOption;
  /** Se true, só anima na primeira vez. Default: false (replay no enter/exit). */
  once?: boolean;
  /** Delay extra (s) antes do stagger começar. */
  delay?: number;
  style?: CSSProperties;
  /** Estilos aplicados ao container (onde existe overflow-hidden). */
  containerStyle?: CSSProperties;
  /** Margem do viewport para disparar a animação. Ex: "-15%". */
  viewportMargin?: string;
}

const alignClassMap: Record<AlignOption, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function AnimatedSectionTitle({
  text,
  as = "h2",
  className = "",
  align = "left",
  once = false,
  delay = 0,
  style,
  containerStyle,
  viewportMargin = "-12%",
}: AnimatedSectionTitleProps) {
  const reducedMotion = useReducedMotion() === true;

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  const Tag: keyof JSX.IntrinsicElements = as;
  const MotionTag = motion[Tag] as React.ComponentType<MotionProps & React.HTMLAttributes<HTMLElement>>;

  const baseContainer = reducedMotion ? containerVariantsReduced : containerVariants;

  // Aplica delay inicial dinamicamente (clonando o variant `visible`)
  const containerWithDelay: Variants = useMemo(() => {
    if (delay <= 0) return baseContainer;
    return {
      ...baseContainer,
      visible: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: delay,
        },
      },
    };
  }, [baseContainer, delay]);

  return (
    <div
      className={`overflow-hidden ${alignClassMap[align]}`}
      style={{
        perspective: reducedMotion ? undefined : 1100,
        ...containerStyle,
      }}
    >
      <MotionTag
        className={`${className} inline-block`}
        style={{
          transformStyle: "preserve-3d",
          willChange: reducedMotion ? undefined : "transform, opacity",
          ...style,
        }}
        variants={containerWithDelay}
        initial="hidden"
        whileInView="visible"
        exit="exit"
        viewport={{ once, margin: viewportMargin, amount: 0.2 }}
      >
        {words.map((word, i) => {
          const variant = reducedMotion
            ? wordVariantReduced
            : i % 2 === 0
            ? wordVariantLeft
            : wordVariantRight;

          return (
            <motion.span
              key={`${word}-${i}`}
              variants={variant}
              className="inline-block"
              style={{
                marginRight: i < words.length - 1 ? "0.28em" : 0,
                transformStyle: "preserve-3d",
                willChange: reducedMotion ? undefined : "transform, opacity, filter",
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </MotionTag>
    </div>
  );
}
