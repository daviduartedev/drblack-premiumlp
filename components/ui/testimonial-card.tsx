"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Lightning from "@/components/Lightning";

export interface Stat {
  value: string;
  label: string;
}

/**
 * Mantido por compatibilidade com `components/ui/demo.tsx`.
 * O novo layout não exibe cards de review — recebe os testimonials apenas
 * para cravar marcos na timeline animada (nome + título). O `quote` e o
 * `rating` são ignorados visualmente.
 */
export interface Testimonial {
  name: string;
  title: string;
  quote?: string;
  avatarSrc: string;
  rating: number;
}

export interface ClientsSectionProps {
  tagLabel: string;
  title: string;
  description: string;
  stats: Stat[];
  testimonials: Testimonial[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Stat card — número anima ao entrar no viewport                            */
/* -------------------------------------------------------------------------- */

function formatNumber(n: number, original: string): string {
  // Preserva casas decimais do valor original (ex: 4.8 → 1 casa).
  const dot = original.indexOf(".");
  const decimals = dot >= 0 ? original.length - dot - 1 : 0;
  if (decimals > 0) return n.toFixed(decimals);
  return Math.round(n).toLocaleString("en-US");
}

const AnimatedStatCard = ({ value, label }: Stat) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion() === true;
  const [display, setDisplay] = React.useState<string>(value);
  const startedRef = React.useRef(false);

  const parsed = React.useMemo(() => {
    const m = value.match(/^([^\d.,-]*)([\d.,-]+)(.*)$/);
    if (!m) return null;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    if (Number.isNaN(target)) return null;
    return { prefix, target, suffix, raw: num };
  }, [value]);

  React.useEffect(() => {
    if (!parsed || reducedMotion) {
      const id = window.requestAnimationFrame(() => setDisplay(value));
      return () => window.cancelAnimationFrame(id);
    }
    const displayId = window.requestAnimationFrame(() =>
      setDisplay(`${parsed.prefix}0${parsed.suffix}`)
    );
    const node = ref.current;
    if (!node) {
      window.cancelAnimationFrame(displayId);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const duration = 1400;
            const start = performance.now();
            const ease = (t: number) => 1 - Math.pow(1 - t, 4); // easeOutQuart
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const v = parsed.target * ease(t);
              setDisplay(
                `${parsed.prefix}${formatNumber(v, parsed.raw)}${parsed.suffix}`
              );
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => {
      window.cancelAnimationFrame(displayId);
      obs.disconnect();
    };
  }, [parsed, reducedMotion, value]);

  return (
    <Card
      ref={ref}
      className="relative overflow-hidden rounded-2xl border-border bg-muted/50 text-center"
    >
      <CardContent className="relative z-10 flex min-h-[122px] flex-col items-center justify-center gap-2 p-4 sm:min-h-[132px] sm:p-5">
        <p className="tabular-nums text-3xl font-bold text-foreground sm:text-4xl">
          {display}
        </p>
        <p className="max-w-[14ch] text-sm leading-tight text-muted-foreground">
          {label}
        </p>
      </CardContent>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 110%, rgba(168,85,247,0.18) 0%, transparent 70%)",
        }}
      />
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scroll-driven visual (substitui os cards de review)                        */
/* -------------------------------------------------------------------------- */

interface ScrollVisualProps {
  testimonials: Testimonial[];
  reducedMotion: boolean;
}

/**
 * Visualização animada acionada pelo scroll. Substitui os antigos cards de
 * testimonial por uma timeline vertical com marcadores que avançam conforme
 * o usuário rola a página. Cada testimonial vira um "milestone" na trilha.
 *
 * Princípio: useScroll com `target` = container, `offset` = ["start end", "end start"]
 * → progress 0..1 atravessa toda a passagem da seção pelo viewport.
 */
const ScrollVisual: React.FC<ScrollVisualProps> = ({
  testimonials,
  reducedMotion,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Suaviza a barra de progresso para não tremer.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.4,
  });

  // Altura do "fill" da trilha (0% → 100%).
  const trackHeight = useTransform(smoothProgress, [0.05, 0.85], ["0%", "100%"]);

  // Inclinação 3D leve de toda a peça, conforme a seção entra/sai.
  const tilt = useTransform(smoothProgress, [0, 0.5, 1], [10, 0, -8]);
  const liftY = useTransform(smoothProgress, [0, 0.5, 1], [60, 0, -40]);

  // Glow interno: opacidade modulada pelo progresso.
  const glowOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.4, 1, 0.6]);

  const total = Math.max(1, testimonials.length);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: "min(680px, 90vh)" }}
    >
      <motion.div
        className="sticky top-24 w-full"
        style={
          reducedMotion
            ? undefined
            : { rotateX: tilt, y: liftY, transformPerspective: 1200 }
        }
      >
        <div
          className={cn(
            "relative w-full rounded-3xl border border-border bg-card/60 backdrop-blur-sm",
            "p-6 sm:p-8 lg:p-10 overflow-hidden"
          )}
          style={{
            boxShadow:
              "0 30px 70px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Glow interno animado */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-px z-0"
            style={{
              background:
                "radial-gradient(120% 60% at 80% 0%, rgba(168,85,247,0.18) 0%, transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(56,189,248,0.14) 0%, transparent 60%)",
              opacity: glowOpacity,
            }}
          />

          <div className="relative z-10 grid grid-cols-[auto_1fr] gap-6">
            {/* Trilha vertical (track + fill) */}
            <div className="relative w-3 sm:w-4 mt-2 mb-2">
              <div className="absolute inset-x-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />
              <motion.div
                className="absolute inset-x-1/2 -translate-x-1/2 top-0 w-[3px] rounded-full"
                style={{
                  height: trackHeight,
                  background:
                    "linear-gradient(180deg, rgba(168,85,247,1) 0%, rgba(56,189,248,1) 100%)",
                  boxShadow: "0 0 14px rgba(168,85,247,0.65)",
                }}
              />
            </div>

            {/* Marcos animados */}
            <ol className="flex flex-col gap-8 sm:gap-10">
              {testimonials.map((t, i) => (
                <Milestone
                  key={`${t.name}-${i}`}
                  index={i}
                  total={total}
                  testimonial={t}
                  progress={smoothProgress}
                  reducedMotion={reducedMotion}
                />
              ))}

              {/* Marco final: "& crescendo" */}
              <FinalMilestone
                progress={smoothProgress}
                reducedMotion={reducedMotion}
              />
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */

interface MilestoneProps {
  index: number;
  total: number;
  testimonial: Testimonial;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}

const Milestone: React.FC<MilestoneProps> = ({
  index,
  total,
  testimonial,
  progress,
  reducedMotion,
}) => {
  // O marco "ativa" quando o progresso passa por sua posição relativa.
  // Distribuímos os marcos entre 0.15 e 0.8 do progresso.
  const start = 0.15 + (index / (total + 1)) * 0.65;
  const peak = start + 0.06;

  const opacity = useTransform(progress, [start - 0.08, start, peak], [0.25, 0.7, 1]);
  const x = useTransform(progress, [start - 0.08, peak], [40, 0]);
  const scale = useTransform(progress, [start - 0.08, peak], [0.92, 1]);
  const dotScale = useTransform(progress, [start - 0.04, peak], [0.6, 1.15]);
  const ringOpacity = useTransform(progress, [start, peak, peak + 0.1], [0, 0.9, 0]);

  return (
    <li className="relative flex items-start gap-4 sm:gap-5">
      {/* Bolinha sobre a trilha (alinhada à esquerda do <ol>) */}
      <span
        aria-hidden
        className="absolute -left-[34px] sm:-left-[42px] top-1.5"
      >
        <motion.span
          className="block w-3.5 h-3.5 rounded-full bg-foreground"
          style={
            reducedMotion
              ? undefined
              : {
                  scale: dotScale,
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,1) 0%, rgba(56,189,248,1) 100%)",
                  boxShadow: "0 0 12px rgba(168,85,247,0.7)",
                }
          }
        />
        {/* Anel de ping ao ativar */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[rgba(168,85,247,0.7)]"
          style={reducedMotion ? { opacity: 0 } : { opacity: ringOpacity, scale: 2.2 }}
        />
      </span>

      <motion.div
        className="flex flex-col gap-1"
        style={reducedMotion ? undefined : { opacity, x, scale }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Project · {String(index + 1).padStart(2, "0")}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-foreground">
          {testimonial.name}
        </p>
        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
      </motion.div>
    </li>
  );
};

const FinalMilestone: React.FC<{
  progress: MotionValue<number>;
  reducedMotion: boolean;
}> = ({ progress, reducedMotion }) => {
  const opacity = useTransform(progress, [0.78, 0.9], [0, 1]);
  const x = useTransform(progress, [0.78, 0.9], [40, 0]);
  const dotScale = useTransform(progress, [0.78, 0.9], [0.6, 1.2]);

  return (
    <li className="relative flex items-start gap-4 sm:gap-5">
      <span
        aria-hidden
        className="absolute -left-[34px] sm:-left-[42px] top-1.5"
      >
        <motion.span
          className="block w-3.5 h-3.5 rounded-full"
          style={
            reducedMotion
              ? { background: "rgb(56,189,248)" }
              : {
                  scale: dotScale,
                  background:
                    "linear-gradient(135deg, rgba(56,189,248,1) 0%, rgba(34,197,94,1) 100%)",
                  boxShadow: "0 0 16px rgba(56,189,248,0.8)",
                }
          }
        />
      </span>

      <motion.div
        className="flex flex-col gap-1"
        style={reducedMotion ? undefined : { opacity, x }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          And counting
        </p>
        <p className="text-lg sm:text-xl font-semibold text-foreground">
          + new partnerships every quarter
        </p>
        <p className="text-sm text-muted-foreground">
          Scroll-driven story · Built with care
        </p>
      </motion.div>
    </li>
  );
};

/* -------------------------------------------------------------------------- */
/*  Section principal                                                         */
/* -------------------------------------------------------------------------- */

export const ClientsSection = ({
  tagLabel,
  title,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  className,
}: ClientsSectionProps) => {
  const reducedMotion = useReducedMotion() === true;

  return (
    <section
      className={cn(
        "relative isolate w-full bg-background text-foreground py-20 md:py-28 overflow-hidden",
        className
      )}
    >
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ mixBlendMode: "screen", opacity: 0.74 }}
        >
          <Lightning hue={280} xOffset={1.1} speed={0.55} intensity={1.35} size={1} />
        </div>
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, transparent 0%, rgba(10,10,10,0.5) 68%, rgba(10,10,10,0.92) 100%)",
        }}
      />

      <div className="container relative z-[2] mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Coluna de texto + stats + CTAs (mantida) */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/50 px-3 py-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{tagLabel}</span>
          </div>

          <h2 className="max-w-[18ch] text-4xl font-bold tracking-tight md:text-5xl">
            {title}
          </h2>
          <p className="max-w-[52ch] text-base text-muted-foreground sm:text-lg">
            {description}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {stats.map((stat) => (
              <AnimatedStatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full rounded-full sm:h-12"
            >
              {secondaryActionLabel}
            </Button>
            <Button size="lg" className="h-11 w-full rounded-full sm:h-12">
              {primaryActionLabel}
            </Button>
          </div>
        </div>

        {/* Coluna direita: animação de scroll (substitui o componente de review) */}
        <ScrollVisual testimonials={testimonials} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
};
