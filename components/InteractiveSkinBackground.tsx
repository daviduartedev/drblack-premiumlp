"use client";

/**
 * Skin interativa — elemento de destaque flutuante na secção “Continua a narrativa”.
 *
 * Ciclo: `cycles/Q12026/0003-narrativa-skin-interativa/`
 * Ativo: `public/gallery/Dragon-Lore_LR.webp` (AWP Dragon Lore — ver `SKIN_SRC`).
 *   Para trocar a skin, altera a constante `SKIN_SRC` ou substitui o ficheiro em `public/`.
 *
 * Visual: a skin flutua off-center à direita da secção em `object-contain`.
 * Atrás dela, uma camada-eco em blur dá ambiência laranja sem mostrar fundo
 * chapado; um glow radial laranja segue o cursor para reforçar a sensação
 * de objecto iluminado.
 *
 * Animações compostas em camadas (`transform-style: preserve-3d`):
 *  1. **Entry scroll-scrubbed** — ao entrar na viewport, a skin roda em 3D,
 *     sobe e ganha opacidade (ritmo inspirado no site da KPR). Driver:
 *     `useScroll({ target, offset: ["start end", "center center"] })`.
 *  2. **Cursor tilt** — `useMotionValue` + `useSpring` + `useTransform`
 *     mapeiam a posição do cursor para `rotateX/Y` (±5°), `translateX/Y`
 *     (±12px), `scale` (até 1.02). Sem `setState` por frame.
 *
 * Modos de interação:
 *  - `interactive` (desktop, pointer fino): entry + cursor.
 *  - `touch-static` (`pointer: coarse`): entry + pose ligeiramente rotada
 *    como pose final (sem cursor).
 *  - `reduced-static` (`prefers-reduced-motion: reduce`): pose estática
 *    imediata (sem entry, sem cursor) — preserva profundidade sem motion.
 *
 * O cursor é actualizado via `ref` + `useImperativeHandle` para permitir
 * `onPointerMoveCapture` na secção mãe (texto e CTA por cima permanecem clicáveis).
 */

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const SKIN_SRC = "/gallery/Dragon-Lore_LR.webp";

/**
 * Fidelidade máx. ao ficheiro em `public/`: `unoptimized` desliga o pipeline Sharp
 * (sem segunda compressão) e o browser reduz/amplia a partir do WebP original.
 * `sizes` alinhado ao `SkinFrame` (até ~56% da largura) × ~2 para DPR elevado, caso
 * volte a `unoptimized: false` no futuro.
 */
const SKIN_SIZES = "(min-width: 1280px) 48vw, (min-width: 768px) 64vw, 100vw";

export type InteractiveSkinBackgroundHandle = {
  onSectionPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onSectionPointerLeave: () => void;
};

const SPRING = { stiffness: 150, damping: 20, mass: 0.5 };
const SPRING_HOVER = { stiffness: 300, damping: 28, mass: 0.45 };

type InteractionMode = "interactive" | "touch-static" | "reduced-static";

function subscribeInteractionMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mqCoarse = window.matchMedia("(pointer: coarse)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  mqCoarse.addEventListener("change", onStoreChange);
  mqReduce.addEventListener("change", onStoreChange);
  return () => {
    mqCoarse.removeEventListener("change", onStoreChange);
    mqReduce.removeEventListener("change", onStoreChange);
  };
}

function getInteractionModeSnapshot(): InteractionMode {
  if (typeof window === "undefined") return "interactive";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced-static";
  if (window.matchMedia("(pointer: coarse)").matches) return "touch-static";
  return "interactive";
}

/** Servidor: assume caminho interactivo; após hidratação o snapshot alinha-se ao dispositivo. */
function useInteractionMode(): InteractionMode {
  return useSyncExternalStore(
    subscribeInteractionMode,
    getInteractionModeSnapshot,
    () => "interactive"
  );
}

/** Wrapper posicional: define o enquadramento e o tamanho da skin na secção. */
const SkinFrame = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function SkinFrame({ children }, ref) {
    return (
      <div
        ref={ref}
        className="pointer-events-none absolute inset-y-0 right-[6%] hidden md:flex md:w-[56%] lg:right-[10%] lg:w-[46%] xl:right-[14%] xl:w-[40%] items-center justify-center"
        style={{ perspective: "1400px" }}
        aria-hidden
      >
        {children}
      </div>
    );
  }
);

/** Camada-eco em blur — dá ambiência laranja por trás da skin. */
function SkinEcho() {
  return (
    <div
      aria-hidden
      className="absolute inset-[6%] opacity-[0.55]"
      style={{
        filter: "blur(60px) saturate(1.3)",
        transform: "translateZ(-40px)",
      }}
    >
      <Image
        src={SKIN_SRC}
        alt=""
        fill
        sizes={SKIN_SIZES}
        unoptimized
        className="object-contain object-center"
        priority={false}
        aria-hidden
      />
    </div>
  );
}

function SkinFocus() {
  return (
    <Image
      src={SKIN_SRC}
      alt=""
      fill
      sizes={SKIN_SIZES}
      unoptimized
      className="object-contain object-center [transform:translateZ(0)] will-change-transform"
      style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))" }}
      priority={false}
      fetchPriority="high"
      aria-hidden
    />
  );
}

function StaticGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-[8%]"
      style={{
        background:
          "radial-gradient(60% 55% at 50% 50%, rgba(255,92,10,0.30), transparent 70%)",
        filter: "blur(20px)",
      }}
    />
  );
}

const InteractiveSkinBackground = forwardRef<InteractiveSkinBackgroundHandle>(
  function InteractiveSkinBackground(_, ref) {
    const mode = useInteractionMode();
    const frameRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const hover = useMotionValue(0);

    const springX = useSpring(x, SPRING);
    const springY = useSpring(y, SPRING);
    const springHover = useSpring(hover, SPRING_HOVER);

    const cursorRotateY = useTransform(springX, [-1, 1], [5, -5]);
    const cursorRotateX = useTransform(springY, [-1, 1], [-5, 5]);
    const cursorTranslateX = useTransform(springX, [-1, 1], [12, -12]);
    const cursorTranslateY = useTransform(springY, [-1, 1], [-12, 12]);
    const cursorScale = useTransform(springHover, [0, 1], [1, 1.02]);

    const glowX = useTransform(springX, [-1, 1], [25, 75]);
    const glowY = useTransform(springY, [-1, 1], [30, 70]);
    const glowBg = useMotionTemplate`radial-gradient(60% 55% at ${glowX}% ${glowY}%, rgba(255,92,10,0.32), transparent 70%)`;

    /**
     * Entry scroll-scrubbed (ritmo inspirado no site da KPR): à medida que a
     * secção entra na viewport, a skin roda em 3D, sobe e ganha opacidade.
     * `progress 0` quando o topo do SkinFrame toca o fundo da viewport;
     * `progress 1` quando o centro do SkinFrame coincide com o centro da viewport.
     */
    const { scrollYProgress } = useScroll({
      target: frameRef,
      offset: ["start end", "center center"],
    });
    const restingRotateX = mode === "touch-static" ? -2 : 0;
    const restingRotateY = mode === "touch-static" ? -3 : 0;
    const entryRotateX = useTransform(scrollYProgress, [0, 1], [-18, restingRotateX]);
    const entryRotateY = useTransform(scrollYProgress, [0, 1], [24, restingRotateY]);
    const entryY = useTransform(scrollYProgress, [0, 1], [80, 0]);
    const entryScale = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
    const entryOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.7, 1]);

    useImperativeHandle(
      ref,
      () => ({
        onSectionPointerMove(event) {
          if (mode !== "interactive") return;
          const rect = event.currentTarget.getBoundingClientRect();
          const nx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const ny = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          x.set(Math.max(-1, Math.min(1, nx)));
          y.set(Math.max(-1, Math.min(1, ny)));
          hover.set(1);
        },
        onSectionPointerLeave() {
          if (mode !== "interactive") return;
          x.set(0);
          y.set(0);
          hover.set(0);
        },
      }),
      [mode, x, y, hover]
    );

    if (mode === "reduced-static") {
      return (
        <SkinFrame ref={frameRef}>
          <div
            className="relative h-full w-full will-change-transform"
            style={{
              transform: "rotateX(-2deg) rotateY(-3deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <StaticGlow />
            <SkinEcho />
            <SkinFocus />
          </div>
        </SkinFrame>
      );
    }

    return (
      <SkinFrame ref={frameRef}>
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{
            rotateX: entryRotateX,
            rotateY: entryRotateY,
            y: entryY,
            scale: entryScale,
            opacity: entryOpacity,
            transformStyle: "preserve-3d",
          }}
        >
          {mode === "interactive" ? (
            <motion.div
              className="relative h-full w-full"
              style={{
                rotateX: cursorRotateX,
                rotateY: cursorRotateY,
                x: cursorTranslateX,
                y: cursorTranslateY,
                scale: cursorScale,
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-[8%]"
                style={{ background: glowBg, filter: "blur(20px)" }}
              />
              <SkinEcho />
              <SkinFocus />
            </motion.div>
          ) : (
            <>
              <StaticGlow />
              <SkinEcho />
              <SkinFocus />
            </>
          )}
        </motion.div>
      </SkinFrame>
    );
  }
);

export default InteractiveSkinBackground;
