"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * `useLayoutEffect` corre antes do paint — necessário para a Fase 0 aplicar o
 * estado fullscreen do `card1` SEM flicker (entre o paint inicial e o set GSAP).
 * Em SSR cai para `useEffect` (este componente é `"use client"`, mas o guard
 * evita warnings em qualquer build chamada server-side).
 */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
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
 * Layout temporal — uma única timeline pinada (estilo KPR). Cada card faz o
 * ciclo `fullscreen → encolhe → vira card → próximo expande`:
 *
 *  ▸ Fase 0 (intro): `card1.jpg` aparece em **fullscreen** logo após a hero,
 *    como se fosse a primeira "secção" da galeria. Ao rolar, encolhe (scale
 *    anisotrópico ↘ 1) e ganha cantos arredondados até virar o primeiro card
 *    do carrossel ("Comunidade ativa"). Sem swap visual: o próprio elemento
 *    do carrossel é o alvo do morph.
 *
 *  ▸ Fase A: o título "SKINS NO PONTO. RIFA NA TELA." e o HUD aparecem em
 *    cascata; a faixa de cards desliza da posição "card1 centrado" até
 *    "knife centrado", fazendo o `knife.png` chegar ao centro do viewport.
 *
 *  ▸ Fase B: o `knife.png` faz transição 3D em escala (scaleX/Y) até preencher
 *    a tela inteira; EM PARALELO, dentro do mesmo card, scrubba a animação
 *    `frame_001..frame_101`. As duas coisas acontecem juntas.
 *
 *  ▸ Fase C: fly-through cinematográfico — o knife sobre-escala, tilta em 3D
 *    e desvanece para revelar a secção "Continua a história" por baixo.
 */

const CARDS = [
  {
    src: "/gallery/card1.jpg",
  },
  {
    src: "/gallery/knife.png",
    index: "02 · CARTA FORTE",
    title: "Carta forte",
    subtitle: "Vira o jogo",
  },
] as const;

const TOTAL_CARDS = CARDS.length;
const INTRO_INDEX = 0;
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
  /**
   * Overlay fullscreen para a Fase 0. É um `<div>` `position:absolute; inset:0`
   * com a imagem do `card1` em `object-cover`. Anima `width/height/top/left`
   * (não `scale`) — assim o `object-cover` recompõe o crop em cada frame e
   * NUNCA distorce. No fim da Fase 0, faz `fade-out` revelando o card1 real
   * que continua no carrossel por baixo.
   */
  const introOverlayRef = useRef<HTMLDivElement>(null);
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

  useIsoLayoutEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Ciclo 0002: scrub mais suave atenua saltos (trilha da barra); menor em reduced-motion. */
    const scrubSeconds = prefersReducedMotion ? 0.35 : 1.45;
    /** +700% no full-motion para acomodar a Fase 0 (intro do card1) sem comprimir as restantes. */
    const scrollEnd = prefersReducedMotion ? "+=200%" : "+=700%";

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const heroWrap = heroWrapRef.current!;
      const introOverlay = introOverlayRef.current;

      gsap.set(track, { xPercent: 0, yPercent: -50, force3D: true });

      /** Helper: filtra alvos não-nulos (algumas refs em estados condicionais). */
      const elts = <T extends Element>(...refs: (T | null | undefined)[]): T[] =>
        refs.filter((e): e is T => e != null);

      // Posição INICIAL da faixa: card1 centralizado no viewport (porque a
      // Fase 0 vai começar com o overlay fullscreen e encolher para a posição
      // do card1 já centrado). A Fase A depois desliza até "knife centrado".
      const computeStartX = () => {
        const introEl = cardRefs.current[INTRO_INDEX];
        if (!introEl) return 0;
        const trackTransform = gsap.getProperty(track, "x") as number;
        const rect = introEl.getBoundingClientRect();
        const rawIntroLeft = rect.left - trackTransform;
        const targetIntroLeft = (window.innerWidth - rect.width) / 2;
        return targetIntroLeft - rawIntroLeft;
      };

      // Posição FINAL da Fase A: hero (knife) centralizado no viewport.
      const computeShift = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const trackTransform = gsap.getProperty(track, "x") as number;
        const rect = heroEl.getBoundingClientRect();
        const rawHeroLeft = rect.left - trackTransform;
        const targetHeroLeft = (window.innerWidth - rect.width) / 2;
        return targetHeroLeft - rawHeroLeft;
      };

      // Tamanho BASE do hero (knife) — necessário para a Fase B (expansão).
      let heroBaseW = 0;
      let heroBaseH = 0;
      const captureHeroBase = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return;
        const prevX = gsap.getProperty(heroWrap, "scaleX") as number;
        const prevY = gsap.getProperty(heroWrap, "scaleY") as number;
        gsap.set(heroWrap, { scaleX: 1, scaleY: 1 });
        const rect = heroEl.getBoundingClientRect();
        heroBaseW = rect.width;
        heroBaseH = rect.height;
        gsap.set(heroWrap, { scaleX: prevX || 1, scaleY: prevY || 1 });
      };
      captureHeroBase();

      const computeHeroScaleXY = () => {
        if (heroBaseW === 0 || heroBaseH === 0) captureHeroBase();
        return {
          scaleX: (window.innerWidth / heroBaseW) * 1.12,
          scaleY: (window.innerHeight / heroBaseH) * 1.12,
        };
      };

      const computeHeroYOffset = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const rect = heroEl.getBoundingClientRect();
        const heroCenterY = rect.top + rect.height / 2;
        return window.innerHeight / 2 - heroCenterY;
      };

      // FLIP target da Fase 0 — calcula a caixa de destino do overlay
      // (posição/tamanho do card1 dentro do carrossel, em coordenadas do
      // pinRef que é o container `position:relative` do overlay).
      const computeIntroFlip = () => {
        const introEl = cardRefs.current[INTRO_INDEX];
        const pinEl = pinRef.current;
        if (!introEl || !pinEl) {
          return { left: 0, top: 0, width: 0, height: 0 };
        }
        const cardRect = introEl.getBoundingClientRect();
        const pinRect = pinEl.getBoundingClientRect();
        return {
          left: cardRect.left - pinRect.left,
          top: cardRect.top - pinRect.top,
          width: cardRect.width,
          height: cardRect.height,
        };
      };

      // Estado inicial: faixa posicionada para o card1 ficar centrado (Fase 0).
      gsap.set(track, { x: () => computeStartX() });

      // ESTADO INICIAL DO OVERLAY — fullscreen real (CSS-puro, inset:0).
      // Aplicado de forma síncrona via useLayoutEffect, antes do primeiro
      // paint, para que o utilizador veja o card1 já em tela cheia logo que
      // entra na secção. Animar `width/height/left/top` (em vez de scale)
      // permite que o `object-cover` da <Image> recomponha o crop a cada
      // frame e a imagem NUNCA distorça (sem mais "faixa horizontal").
      if (introOverlay && !prefersReducedMotion) {
        gsap.set(introOverlay, {
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          borderRadius: 0,
          opacity: 1,
          force3D: true,
        });
      } else if (introOverlay && prefersReducedMotion) {
        // Reduced-motion: arranca já escondido (não há morph).
        gsap.set(introOverlay, { opacity: 0, pointerEvents: "none" });
      }

      // ============================================================
      // Timeline ÚNICA pinada — uma só ScrollTrigger pinando a secção
      // inteira evita conflitos de pin entre fases.
      //
      // Layout temporal (progress 0..1):
      //   0.00 .. 0.18  Fase 0 — card1 fullscreen → encolhe e vira card
      //                          (textos do título/HUD aparecem em cascata)
      //   0.18 .. 0.45  Fase A — carrossel desliza (card1 centro → knife centro)
      //   0.45 .. 0.85  Fase B — knife expande + frames scrubam EM PARALELO
      //   0.85 .. 1.00  Fase C — fly-through (knife escala + tilt + fade)
      // ============================================================
      const PHASE_INTRO_END = prefersReducedMotion ? 0 : 0.18;
      const PHASE_A_END = 0.45;
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
            // Frame scrub roda durante a fase B; antes da fase B fica em 0,
            // após PHASE_B_END mantém o último frame enquanto a fase C executa.
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

      // ----- FASE 0 — intro: overlay fullscreen → encolhe até virar card1 -----
      // Usa FLIP-style animation: anima `left/top/width/height` (não scale) do
      // overlay para que a imagem com `object-cover` recomponha o crop a cada
      // frame, sem qualquer distorção (problema do "faixa horizontal" anterior).
      // No fim, fade-out revela o card1 real do carrossel POR BAIXO — visual
      // contínuo, sem swap notável.
      if (!prefersReducedMotion && introOverlay) {
        const morphDur = PHASE_INTRO_END * 0.85;
        const fadeOutStart = PHASE_INTRO_END * 0.85;
        const fadeOutDur = PHASE_INTRO_END * 0.15;

        tl.to(
          introOverlay,
          {
            left: () => computeIntroFlip().left,
            top: () => computeIntroFlip().top,
            width: () => computeIntroFlip().width,
            height: () => computeIntroFlip().height,
            borderRadius: 28,
            duration: morphDur,
            ease: "power2.inOut",
          },
          0
        );

        tl.to(
          introOverlay,
          {
            opacity: 0,
            duration: fadeOutDur,
            ease: "power2.in",
          },
          fadeOutStart
        );

        // Título / HUD entram em cascata no FIM do intro (estilo KPR — texto
        // aparece quando o card já está no formato carrossel).
        const fadeInDur = 0.08;
        const fadeInStart = Math.max(0, PHASE_INTRO_END - fadeInDur - 0.02);
        const introTextEls = elts(eyebrowRef.current, titleRef.current, subRef.current);
        if (introTextEls.length) {
          tl.fromTo(
            introTextEls,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: fadeInDur,
              ease: "power2.out",
              stagger: 0.025,
            },
            fadeInStart
          );
        }
        if (hudRef.current) {
          tl.fromTo(
            hudRef.current,
            { opacity: 0 },
            { opacity: 1, duration: fadeInDur, ease: "power2.out" },
            fadeInStart + 0.04
          );
        }
      } else {
        // Reduced-motion: garante texto/HUD visíveis desde o início.
        const introTextEls = elts(
          eyebrowRef.current,
          titleRef.current,
          subRef.current,
          hudRef.current
        );
        if (introTextEls.length) {
          gsap.set(introTextEls, { opacity: 1, y: 0 });
        }
      }

      // ----- FASE A — carrossel desliza card1-centro → knife-centro -----
      // Sem overshoot: a faixa vai direto até o hero ficar centralizado e PARA.
      // Daí em diante a Fase B (expansão 3D + frame scrub) toma o controle.
      const phaseADur = PHASE_A_END - PHASE_INTRO_END;
      tl.to(
        track,
        {
          x: () => computeShift(),
          duration: phaseADur,
          ease: "power3.out",
        },
        PHASE_INTRO_END
      );

      // Sway escalonado nos cards não-hero durante a fase A.
      for (let i = 0; i < HERO_INDEX; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const delay = i * 0.02;
        tl.to(
          card,
          { y: -10, rotation: -0.8, duration: 0.2, ease: "power2.out" },
          PHASE_INTRO_END + delay
        );
        tl.to(
          card,
          { y: 0, rotation: 0, duration: 0.18, ease: "power2.inOut" },
          PHASE_INTRO_END + 0.22 + delay
        );
      }

      // ----- FASE B — expansão hero + frame scrub em PARALELO -----
      // Hero scale anisotrópico → fullscreen exato (cobre viewport inteira
      // independente da proporção). object-cover do <Image> faz o crop natural.
      const phaseBDur = PHASE_B_END - PHASE_A_END;
      tl.fromTo(
        heroWrap,
        { scaleX: 1, scaleY: 1, y: 0, rotationX: 0, rotationY: 0, z: 0 },
        {
          scaleX: () => computeHeroScaleXY().scaleX,
          scaleY: () => computeHeroScaleXY().scaleY,
          y: () => computeHeroYOffset(),
          duration: phaseBDur,
          ease: "power2.inOut",
        },
        PHASE_A_END
      );

      // Border-radius: card (28) → 0 (sem cantos no fullscreen).
      const heroCardEl = heroWrap.firstElementChild as HTMLElement | null;
      if (heroCardEl) {
        tl.fromTo(
          heroCardEl,
          { borderRadius: 28 },
          { borderRadius: 0, duration: phaseBDur, ease: "power2.inOut" },
          PHASE_A_END
        );
      }

      // Film overlay aparece logo no início da fase B.
      if (heroFilmRef.current) {
        tl.fromTo(
          heroFilmRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.04, ease: "power1.inOut" },
          PHASE_A_END
        );
      }

      // Texto principal + HUD desaparecem no início da fase B.
      const exitTextEls = elts(eyebrowRef.current, titleRef.current, subRef.current);
      if (exitTextEls.length) {
        tl.to(
          exitTextEls,
          { opacity: 0, y: -30, duration: 0.12, ease: "power2.in" },
          PHASE_A_END
        );
      }
      if (hudRef.current) {
        tl.to(
          hudRef.current,
          { opacity: 0, duration: 0.1, ease: "power2.in" },
          PHASE_A_END
        );
      }

      // Cards laterais somem deixando o hero ser o protagonista.
      for (let i = 0; i < HERO_INDEX; i++) {
        const c = cardRefs.current[i];
        if (!c) continue;
        tl.to(
          c,
          { opacity: 0, duration: 0.14, ease: "power1.in" },
          PHASE_A_END
        );
      }

      // Labels overlay (canto + headline central) aparecem durante a expansão.
      if (heroLabelRef.current) {
        tl.fromTo(
          heroLabelRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" },
          PHASE_A_END + 0.1
        );
      }

      // ----- FASE C — saída cinematográfica (0.85 .. 1.00) -----
      // Fly-through estilo KPR/peachweb: a hero card que ocupa o ecrã
      // sobre-escala (~1.18×), tilta em rotateX, sobe em Y e desvanece para
      // opacidade 0, revelando a secção "Continua a história" por baixo.
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
      if (heroFilmRef.current) {
        tl.to(
          heroFilmRef.current,
          { opacity: 0, duration: exitDuration, ease: "power2.in" },
          PHASE_B_END
        );
      }
      if (heroLabelRef.current) {
        tl.to(
          heroLabelRef.current,
          { opacity: 0, y: -20, duration: exitDuration, ease: "power2.in" },
          PHASE_B_END
        );
      }
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
        </div>

        <div className="relative z-20 px-[5vw] mt-[3vh] max-w-[60rem]">
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
              opacity: 0,
            }}
          >
            {"SKINS NO PONTO.\nRIFA NA TELA."}
          </h1>
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
                      priority={i === INTRO_INDEX}
                      sizes="(min-width: 1024px) 52vw, 85vw"
                      quality={95}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/*
          Overlay FULLSCREEN da Fase 0 — `card1` em tela cheia logo no início
          da secção. Anima encolhendo até pousar EXATAMENTE sobre o `card1`
          do carrossel (FLIP via width/height/top/left), e faz fade-out
          revelando o card real por baixo.

          - `position:absolute; inset:0` cobre o `pinRef` inteiro (= viewport
            quando pinado).
          - `overflow:hidden` + `<Image fill object-cover>` garantem zero
            distorção em qualquer aspect-ratio.
          - `unoptimized` + `quality={100}` + `sizes="100vw"` servem o ficheiro
            no máximo de fidelidade.
          - `z-[15]` fica POR CIMA do carrossel (`z-10`) durante a Fase 0;
            no fim, opacity:0 → o carrossel toma o controlo visual.
        */}
        <div
          ref={introOverlayRef}
          className="absolute z-[15] pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 0,
            backgroundColor: "#120f0c",
            willChange: "left, top, width, height, opacity",
            // shadow só faz sentido quando o overlay já encolheu para o
            // formato de card; nos primeiros frames (fullscreen) é invisível
            boxShadow:
              "0 28px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
          aria-hidden
        >
          <Image
            src="/gallery/card1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={100}
            unoptimized
            className="object-cover"
            style={{ transform: "translateZ(0)" }}
          />
          {/* mesmos vinhetes do KprCard para que o "morph" para o estado de
              card seja visualmente idêntico ao card1 do carrossel */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)",
            }}
          />
        </div>

        <div
          ref={hudRef}
          className="absolute inset-x-[5vw] bottom-7 z-30 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase pointer-events-none"
          style={{ color: "rgba(255,255,255,0.6)", opacity: 0 }}
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
