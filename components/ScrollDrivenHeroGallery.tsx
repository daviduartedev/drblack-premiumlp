"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import InteractiveSkinBackground, {
  type InteractiveSkinBackgroundHandle,
} from "@/components/InteractiveSkinBackground";
import KprCard from "@/components/KprCard";
import ScrollFilmFrames from "@/components/ScrollFilmFrames";

gsap.registerPlugin(ScrollTrigger);

/**
 * Variantes para a entrada agressiva (Framer-style) dos textos da secção
 * “Continua a história.” — eyebrow desce do topo, headline entra palavra
 * a palavra desde a direita com `rotateY` 3D, sub e CTA seguem em cascata.
 *
 * `viewport.once: false` faz a animação replay quando o utilizador volta a
 * scrollar. `prefers-reduced-motion` cai no conjunto reduzido (só fade).
 */
const VIEWPORT_OPTS = { once: false, margin: "-15%" };
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NARRATIVA_VARIANTS_FULL = {
  eyebrow: {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT_EXPO },
    },
  } satisfies Variants,
  h2Container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  } satisfies Variants,
  h2Word: {
    hidden: { opacity: 0, x: 160, rotateY: 32 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.9, ease: EASE_OUT_EXPO },
    },
  } satisfies Variants,
  sub: {
    hidden: { opacity: 0, x: 90 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO },
    },
  } satisfies Variants,
  cta: {
    hidden: { opacity: 0, y: 50, scale: 0.85 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, delay: 0.6, ease: EASE_OUT_EXPO },
    },
  } satisfies Variants,
};

const NARRATIVA_VARIANTS_REDUCED = {
  eyebrow: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } satisfies Variants,
  h2Container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0 } },
  } satisfies Variants,
  h2Word: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } satisfies Variants,
  sub: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } satisfies Variants,
  cta: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } satisfies Variants,
};

const HEADLINE_WORDS = ["Continua", "a", "história."] as const;

/**
 * Seção "SKINS NO PONTO. RIFA NA TELA."
 *
 * Layout (estilo KPR — referência do vídeo):
 *  ▸ 5 cards quadrados, mesmo tamanho, mesmo gap, dispostos numa fileira
 *    horizontal. O carrossel é dirigido pelo scroll: a fileira inteira
 *    desliza para a esquerda enquanto o usuário rola, até que o último
 *    card (knife.png) chegue ao centro do viewport.
 *
 *  ▸ A partir desse momento, o último card faz uma transição 3D em escala
 *    do tamanho do card até preencher a tela inteira; EM PARALELO, dentro
 *    do mesmo card, começa o scrub da animação `frame_001..frame_101`.
 *    As duas coisas acontecem juntas, num mesmo trecho do scroll.
 */

const CARDS = [
  {
    src: "/gallery/card-1.jpg",
    index: "01 · COMUNIDADE",
    title: "Comunidade ativa",
    subtitle: "Quem joga junto",
  },
  {
    src: "/gallery/knife.png",
    index: "02 · CARTA FORTE",
    title: "Carta forte",
    subtitle: "Vira o jogo",
  },
] as const;

const TOTAL_CARDS = CARDS.length;
const HERO_INDEX = TOTAL_CARDS - 1;

export default function ScrollDrivenHeroGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const heroFilmRef = useRef<HTMLDivElement>(null);
  const heroLabelRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);

  const [expansionProgress, setExpansionProgress] = useState(0);
  const expansionProgressRef = useRef(0);
  const narrativaSkinRef = useRef<InteractiveSkinBackgroundHandle>(null);

  const reducedMotion = useReducedMotion();
  const narrativaVariants = useMemo(
    () => (reducedMotion ? NARRATIVA_VARIANTS_REDUCED : NARRATIVA_VARIANTS_FULL),
    [reducedMotion]
  );

  useEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Ciclo 0002: scrub mais suave atenua saltos (trilha da barra); menor em reduced-motion. */
    const scrubSeconds = prefersReducedMotion ? 0.35 : 1.45;
    const scrollEnd = prefersReducedMotion ? "+=200%" : "+=600%";

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const heroWrap = heroWrapRef.current!;

      gsap.set(track, { xPercent: 0, yPercent: -50, force3D: true });

      // Posição INICIAL: faixa empurrada para a direita o suficiente para
      // que o último card (hero) apareça parcialmente colado à borda
      // direita do viewport. Os cards anteriores ficam fora da tela à
      // esquerda (entrarão conforme rola).
      const computeStartX = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const rect = heroEl.getBoundingClientRect();
        const trackTransform = gsap.getProperty(track, "x") as number;
        // posição atual do hero no viewport - desejamos que ele fique
        // colado à direita (com pequena margem). Calcula o offset bruto
        // ignorando o transform atual.
        const rawHeroLeft = rect.left - trackTransform;
        const targetHeroLeft = window.innerWidth - rect.width - 32; // 32px margem
        return targetHeroLeft - rawHeroLeft;
      };

      // Posição FINAL: hero centralizado no viewport.
      const computeShift = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const trackTransform = gsap.getProperty(track, "x") as number;
        const rect = heroEl.getBoundingClientRect();
        const rawHeroLeft = rect.left - trackTransform;
        const targetHeroLeft = (window.innerWidth - rect.width) / 2;
        return targetHeroLeft - rawHeroLeft;
      };

      // Captura o tamanho BASE do card (antes de qualquer animação).
      // Sem isso, durante a animação `getBoundingClientRect()` já reflete
      // a escala parcial e o cálculo fica instável.
      let heroBaseW = 0;
      let heroBaseH = 0;
      const captureHeroBase = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return;
        // Reset temporário do scale para medir o size cru.
        const prevX = gsap.getProperty(heroWrap, "scaleX") as number;
        const prevY = gsap.getProperty(heroWrap, "scaleY") as number;
        gsap.set(heroWrap, { scaleX: 1, scaleY: 1 });
        const rect = heroEl.getBoundingClientRect();
        heroBaseW = rect.width;
        heroBaseH = rect.height;
        gsap.set(heroWrap, { scaleX: prevX || 1, scaleY: prevY || 1 });
      };
      captureHeroBase();

      // Escala anisotrópica — scaleX e scaleY independentes para que
      // o card preencha EXATAMENTE viewport × viewport (zero bordas).
      // Sem isso, com frame 16:9 numa viewport 16:10/ultrawide ficam
      // barras pretas no topo/laterais.
      const computeHeroScaleXY = () => {
        if (heroBaseW === 0 || heroBaseH === 0) captureHeroBase();
        const targetW = window.innerWidth;
        const targetH = window.innerHeight;
        // 1.12 em cada eixo = 12% extra → cover absoluto sem nenhuma
        // chance de borda preta, mesmo com track posicionado a 58%
        // (não 50%) e qualquer arredondamento de pixel/perspective.
        return {
          scaleX: (targetW / heroBaseW) * 1.12,
          scaleY: (targetH / heroBaseH) * 1.12,
        };
      };

      // Quanto o hero precisa subir em Y para ficar centralizado
      // verticalmente no viewport ao final da expansão (corrige a
      // diferença entre top: 58% e o centro real 50%).
      const computeHeroYOffset = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const rect = heroEl.getBoundingClientRect();
        const heroCenterY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        return viewportCenterY - heroCenterY;
      };

      // Estado inicial: faixa empurrada para a direita — hero colado à
      // borda direita do viewport, demais cards fora da tela.
      gsap.set(track, { x: () => computeStartX() });

      // ============================================================
      // Timeline ÚNICA pinada — evita conflito de múltiplas ScrollTriggers
      // pinando o mesmo elemento.
      //
      // Layout temporal (progress 0..1):
      //   0.00 .. 0.40  Fase A — carrossel desliza direita → centro
      //   0.40 .. 0.85  Fase B — hero expande + frames scrubam EM PARALELO
      //   0.85 .. 1.00  Fase C — saída cinematográfica (fly-through KPR/peachweb)
      //                          a hero card escala + tilt 3D + drift + fade,
      //                          revelando a secção “Continua a história.”
      // ============================================================
      const PHASE_A_END = 0.40;
      const PHASE_B_END = 0.85;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: scrollEnd,
          pin: true,
          pinSpacing: true,
          scrub: scrubSeconds,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // Frame scrub roda durante a fase B; após PHASE_B_END mantém o
            // último frame enquanto a fase C (saída) executa.
            let next: number;
            if (p < PHASE_A_END) {
              next = 0;
            } else if (p >= PHASE_B_END) {
              next = 1;
            } else {
              const t = (p - PHASE_A_END) / (PHASE_B_END - PHASE_A_END);
              next = Math.min(1, Math.max(0, t));
            }
            if (expansionProgressRef.current !== next) {
              expansionProgressRef.current = next;
              setExpansionProgress(next);
            }
          },
        },
      });

      // ----- FASE A — carrossel direita → centro (0 .. 0.40) -----
      // Sem overshoot: a faixa vai direto até o hero ficar centralizado
      // e PARA. Daí em diante a fase B (expansão 3D + frame scrub) toma
      // o controle. Easing suave para sensação band sem ultrapassar.
      tl.to(
        track,
        {
          x: () => computeShift(),
          duration: 0.40,
          ease: "power3.out",
        },
        0
      );

      // Sway escalonado nos cards não-hero durante a fase A.
      for (let i = 0; i < HERO_INDEX; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const delay = i * 0.02;
        tl.to(
          card,
          { y: -10, rotation: -0.8, duration: 0.2, ease: "power2.out" },
          delay
        );
        tl.to(
          card,
          { y: 0, rotation: 0, duration: 0.18, ease: "power2.inOut" },
          0.22 + delay
        );
      }

      // ----- FASE B — expansão hero + frame scrub em PARALELO (0.40 .. 0.85) -----
      // Hero scale anisotrópico → fullscreen exato (cobre viewport inteira
      // independente da proporção da tela). object-cover do <Image>
      // interno faz o crop natural para preencher sem distorcer.
      tl.fromTo(
        heroWrap,
        { scaleX: 1, scaleY: 1, y: 0, rotationX: 0, rotationY: 0, z: 0 },
        {
          scaleX: () => computeHeroScaleXY().scaleX,
          scaleY: () => computeHeroScaleXY().scaleY,
          y: () => computeHeroYOffset(),
          duration: 0.45,
          ease: "power2.inOut",
        },
        PHASE_A_END
      );

      // Animação do border-radius: card → 0 (sem cantos no fullscreen).
      // Aplicado no KprCard interno (primeiro filho do heroWrap).
      const heroCardEl = heroWrap.firstElementChild as HTMLElement | null;
      if (heroCardEl) {
        tl.fromTo(
          heroCardEl,
          { borderRadius: 28 },
          { borderRadius: 0, duration: 0.45, ease: "power2.inOut" },
          PHASE_A_END
        );
      }

      // Film overlay aparece logo no início da fase B (frames já estão
      // sendo scrubbed pelo onUpdate, mas o overlay precisa estar visível).
      tl.fromTo(
        heroFilmRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.04, ease: "power1.inOut" },
        PHASE_A_END
      );

      // Texto principal + HUD desaparecem no início da fase B.
      tl.to(
        [eyebrowRef.current, titleRef.current, subRef.current],
        { opacity: 0, y: -30, duration: 0.12, ease: "power2.in" },
        PHASE_A_END
      );
      tl.to(
        hudRef.current,
        { opacity: 0, duration: 0.1, ease: "power2.in" },
        PHASE_A_END
      );

      // Cards laterais somem deixando o hero ser o protagonista.
      for (let i = 0; i < HERO_INDEX; i++) {
        tl.to(
          cardRefs.current[i],
          { opacity: 0, duration: 0.14, ease: "power1.in" },
          PHASE_A_END
        );
      }

      // Labels overlay (canto + headline central) aparecem durante a expansão.
      tl.fromTo(
        heroLabelRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" },
        PHASE_A_END + 0.1
      );
      // headline overlay removido — sem animação aqui

      // ----- FASE C — saída cinematográfica (0.85 .. 1.00) -----
      // Fly-through estilo KPR/peachweb: a hero card que ocupa o ecrã
      // sobreescala (~1.18×), tilta em rotateX, sobe em Y e desvanece
      // para opacidade 0, revelando a secção “Continua a história.”
      // por baixo. O frame overlay desvanece em paralelo.
      const exitDuration = 1 - PHASE_B_END;
      tl.to(
        heroWrap,
        {
          scaleX: () => computeHeroScaleXY().scaleX * 1.18,
          scaleY: () => computeHeroScaleXY().scaleY * 1.18,
          y: () => computeHeroYOffset() - 110,
          rotationX: -12,
          rotationY: 6,
          opacity: 0,
          duration: exitDuration,
          ease: "power2.in",
        },
        PHASE_B_END
      );
      tl.to(
        heroFilmRef.current,
        {
          opacity: 0,
          duration: exitDuration,
          ease: "power2.in",
        },
        PHASE_B_END
      );
      tl.to(
        heroLabelRef.current,
        {
          opacity: 0,
          y: -20,
          duration: exitDuration,
          ease: "power2.in",
        },
        PHASE_B_END
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="w-full">
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(80% 60% at 28% 22%, rgba(255,92,10,0.10) 0%, rgba(10,10,10,0) 60%), radial-gradient(60% 50% at 80% 90%, rgba(238,217,196,0.06) 0%, rgba(10,10,10,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ff5c0a 1px, transparent 1px), linear-gradient(to bottom, #ff5c0a 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-30 flex items-center justify-between px-[5vw] pt-7">
          <div
            className="text-[11px] tracking-[0.28em] uppercase"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            DR · BLACK SKINS
          </div>
          <div
            className="text-[10px] tracking-[0.32em] uppercase"
            style={{ color: "rgba(238,217,196,0.85)" }}
          >
            02 · ARSENAL
          </div>
        </div>

        <div className="relative z-20 px-[5vw] mt-[3vh] max-w-[60rem]">
          <div
            ref={eyebrowRef}
            className="text-[10px] tracking-[0.32em] uppercase"
            style={{ color: "var(--highlight)" }}
          >
            ESCOLHE TUA CARTA
          </div>
          <h1
            ref={titleRef}
            className="mt-2"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.025em",
              fontSize: "clamp(36px, 5.6vw, 88px)",
              color: "rgba(255,255,255,0.96)",
              textTransform: "uppercase",
              whiteSpace: "pre-line",
            }}
          >
            {"SKINS NO PONTO.\nRIFA NA TELA."}
          </h1>
          <p
            ref={subRef}
            className="mt-3 max-w-md text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Duas cartas. Uma vira o jogo. Compra, concorre e leva — direto, sem
            enrolação.
          </p>
        </div>

        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: "58%",
            perspective: "1800px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            ref={trackRef}
            className="relative flex items-center"
            style={{
              gap: "clamp(20px, 2.4vw, 44px)",
              paddingLeft: "8vw",
              paddingRight: "8vw",
              width: "max-content",
              willChange: "transform",
            }}
          >
            {CARDS.map((card, i) => {
              const isHero = i === HERO_INDEX;
              return (
                <div
                  key={card.src}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{
                    width: "clamp(480px, 52vw, 880px)",
                    flex: "0 0 auto",
                    willChange: isHero ? "transform" : "opacity",
                  }}
                >
                  {isHero ? (
                    <div ref={heroWrapRef} style={{ transformOrigin: "50% 50%" }}>
                      <KprCard
                        src={card.src}
                        index={card.index}
                        hideLabels
                        priority
                        sizes="(min-width: 1024px) 52vw, 95vw"
                        overlay={
                          <>
                            <div
                              ref={heroFilmRef}
                              className="absolute inset-0 pointer-events-none"
                              style={{ opacity: 0 }}
                              aria-hidden
                            >
                              {expansionProgress > 0 ? (
                                <ScrollFilmFrames
                                  progress={expansionProgress}
                                  firstIndex={1}
                                  lastIndex={101}
                                  fallbackColor="#0a0a0a"
                                />
                              ) : null}
                            </div>

                            {/* labels removidos — durante o fullscreen
                                a animação ocupa a tela inteira sem
                                sobreposições */}
                            <div ref={heroLabelRef} style={{ display: "none" }} aria-hidden />
                            <div ref={heroHeadlineRef} style={{ display: "none" }} aria-hidden />
                          </>
                        }
                      />
                    </div>
                  ) : (
                    <KprCard
                      src={card.src}
                      index={card.index}
                      title={card.title}
                      subtitle={card.subtitle}
                      sizes="(min-width: 1024px) 52vw, 85vw"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={hudRef}
          className="absolute inset-x-[5vw] bottom-7 z-30 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase pointer-events-none"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <span>SCROLL ↓</span>
          <span style={{ color: "var(--highlight)" }}>02 / 02 · ARSENAL</span>
        </div>
      </div>

      <section
        id="continua-narrativa"
        className="relative w-full overflow-hidden isolate"
        style={{
          minHeight: "min(100vh, 760px)",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
        onPointerMoveCapture={(e) =>
          narrativaSkinRef.current?.onSectionPointerMove(e)
        }
        onPointerLeave={() => narrativaSkinRef.current?.onSectionPointerLeave()}
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
          className="absolute -left-[10%] bottom-[-20%] w-[70%] h-[70%] opacity-[0.38] blur-3xl"
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

        <InteractiveSkinBackground ref={narrativaSkinRef} />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-[5vw] py-28 md:py-36">
          <div className="max-w-xl" style={{ perspective: "900px" }}>
            <motion.div
              variants={narrativaVariants.eyebrow}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTS}
              className="text-[11px] tracking-[0.28em] uppercase"
              style={{ color: "var(--highlight)" }}
            >
              06 · NARRATIVA
            </motion.div>
            <motion.h2
              variants={narrativaVariants.h2Container}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTS}
              className="mt-4 overflow-hidden"
              style={{
                fontFamily: "var(--font-oswald), sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                fontSize: "clamp(42px, 6vw, 92px)",
                lineHeight: 0.95,
                color: "var(--foreground)",
                transformStyle: "preserve-3d",
              }}
            >
              {HEADLINE_WORDS.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  variants={narrativaVariants.h2Word}
                  className="inline-block"
                  style={{
                    marginRight: i < HEADLINE_WORDS.length - 1 ? "0.25em" : 0,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              variants={narrativaVariants.sub}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTS}
              className="mt-6 max-w-md text-[14px] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Cada skin é um novo começo. Bora virar a tua?
            </motion.p>
            <motion.a
              variants={narrativaVariants.cta}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTS}
              href="#hero-mercado"
              className="mt-8 inline-flex items-center justify-center px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              style={{
                background: "var(--accent)",
                color: "var(--on-accent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-soft)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = "var(--accent-deep)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = "var(--accent-soft)";
              }}
            >
              Ver mercado
            </motion.a>
          </div>
        </div>
      </section>
    </section>
  );
}
