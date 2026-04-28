"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * `useLayoutEffect` corre antes do paint — necessário para a Fase 0 aplicar o
 * estado fullscreen do `card1` SEM flicker (entre o paint inicial e o set GSAP).
 * Em SSR cai para `useEffect` (este componente é `"use client"`, mas o guard
 * evita warnings em qualquer build chamada server-side).
 */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import KprCard, { KPR_CARD_BORDER_RADIUS } from "@/components/KprCard";
import LightPillar from "@/components/LightPillar";
import ScrollFilmFrames from "@/components/ScrollFilmFrames";

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NARRATIVA_BG_SPRING = { stiffness: 140, damping: 26, mass: 0.5 };

function useNarrativaBackdropMotion(reducedMotion: boolean | null) {
  const enabled = reducedMotion === false;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, NARRATIVA_BG_SPRING);
  const sy = useSpring(y, NARRATIVA_BG_SPRING);
  // Parallax 3D do background (pillar de luz) — bem leve para não distrair
  const rotateY = useTransform(sx, [-1, 1], [3.5, -3.5]);
  const rotateX = useTransform(sy, [-1, 1], [-3, 3]);
  // Translação leve da AWP — segue o cursor com amplitude pequena (px)
  const awpX = useTransform(sx, [-1, 1], [-14, 14]);
  const awpY = useTransform(sy, [-1, 1], [-10, 10]);

  const onSectionPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches
      ) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      x.set(Math.max(-1, Math.min(1, nx)));
      y.set(Math.max(-1, Math.min(1, ny)));
    },
    [enabled, x, y]
  );

  const onSectionPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    enabled,
    rotateX,
    rotateY,
    awpX,
    awpY,
    onSectionPointerMove,
    onSectionPointerLeave,
  };
}

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

  const titleRef = useRef<HTMLHeadingElement>(null);
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
  const introOverlayMediaRef = useRef<HTMLDivElement>(null);
  const introOverlayCopyRef = useRef<HTMLDivElement>(null);
  const introInteractiveEnabledRef = useRef(true);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const heroFilmRef = useRef<HTMLDivElement>(null);
  const heroLabelRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);

  const [expansionProgress, setExpansionProgress] = useState(0);
  const expansionProgressRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const narrativaBackdrop = useNarrativaBackdropMotion(reducedMotion);

  useIsoLayoutEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Ciclo 0002: scrub mais suave atenua saltos (trilha da barra); menor em reduced-motion. */
    const scrubSeconds = prefersReducedMotion ? 0.35 : 1.05;
    /** Distância pinada — valores altos esticam demais a saída após o film/card sumir. */
    const scrollEnd = prefersReducedMotion ? "+=200%" : "+=520%";

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

        if (introOverlayMediaRef.current) {
          gsap.set(introOverlayMediaRef.current, {
            x: 0,
            y: 0,
            scale: 1.015,
            transformOrigin: "50% 50%",
          });
        }

        if (introOverlayCopyRef.current) {
          gsap.set(introOverlayCopyRef.current, { opacity: 1, y: 0 });
        }

        if (introOverlayMediaRef.current) {
          const mediaEl = introOverlayMediaRef.current;
          const moveX = gsap.quickTo(mediaEl, "x", { duration: 0.45, ease: "power3.out" });
          const moveY = gsap.quickTo(mediaEl, "y", { duration: 0.45, ease: "power3.out" });
          const handlePointerMove = (ev: PointerEvent) => {
            if (!introInteractiveEnabledRef.current) return;
            const rect = introOverlay.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const nx = (ev.clientX - rect.left) / rect.width - 0.5;
            const ny = (ev.clientY - rect.top) / rect.height - 0.5;
            moveX(nx * 18);
            moveY(ny * 12);
          };
          const handlePointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          introOverlay.addEventListener("pointermove", handlePointerMove);
          introOverlay.addEventListener("pointerleave", handlePointerLeave);
          gsap.delayedCall(0, () => {
            // Cleanup com o contexto GSAP quando a secção desmonta.
            ctx.add(() => {
              introOverlay.removeEventListener("pointermove", handlePointerMove);
              introOverlay.removeEventListener("pointerleave", handlePointerLeave);
            });
          });
        }
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
      //   0.45 .. 0.88  Fase B — knife expande + frames scrubam EM PARALELO
      //   0.88 .. 1.00  Fase C — fly-through (curta: menos scroll morto antes da próxima secção)
      // ============================================================
      const PHASE_INTRO_END = prefersReducedMotion ? 0 : 0.18;
      const PHASE_A_END = 0.4;
      /** Mais tempo ao film + menos fatia à saída 3D = menos arrasto após o card sumir. */
      const PHASE_B_END = 0.88;

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
            introInteractiveEnabledRef.current = p < 0.08;
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
            borderRadius: 0,
            duration: morphDur,
            ease: "expo.inOut",
          },
          0
        );

        if (introOverlayCopyRef.current) {
          tl.to(
            introOverlayCopyRef.current,
            {
              opacity: 0,
              y: -10,
              duration: PHASE_INTRO_END * 0.32,
              ease: "power1.out",
            },
            0.01
          );
        }

        tl.to(
          introOverlay,
          {
            borderRadius: KPR_CARD_BORDER_RADIUS,
            duration: morphDur * 0.35,
            ease: "expo.inOut",
          },
          morphDur * 0.62
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
            ease: "expo.out",
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
          ease: "quart.inOut",
        },
        PHASE_A_END
      );

      // Cantos subtis até ~95% da Fase B; depois raio 0 para o knife cobrir a
      // tela como retângulo (fullscreen).
      const heroCardEl = heroWrap.firstElementChild as HTMLElement | null;
      const clipReleaseAt = PHASE_A_END + phaseBDur * 0.95;
      if (heroCardEl) {
        tl.set(
          heroCardEl,
          {
            clipPath: "none",
            webkitClipPath: "none",
            borderRadius: "0",
          },
          clipReleaseAt
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

      // ----- FASE C — saída cinematográfica (PHASE_B_END .. 1.00, ~12% do progress) -----
      // Em vez de "sumir" (sobre-escalar + fade), o hero RECUA em Z: encolhe
      // de fullscreen de volta para um card arredondado flutuante, ganhando
      // sombra/borda à medida que se afasta, com tilt 3D suave e leve
      // translação vertical para cima — revelando a secção "Continua a
      // história" que emerge POR BAIXO num parallax sutil.
      //
      // Trecho temporal (com PHASE_B_END = 0.88):
      //   0.88 .. ~0.94  (sub-fase C1) — hero solta do fullscreen, recua em Z,
      //   ~0.94 .. 1.00  (sub-fase C2) — saída por cima + fade
      const exitDuration = 1 - PHASE_B_END;
      /** C2 um pouco mais curta para o fade/zero-opacity chegar antes ao fim do pin */
      const C1_RATIO = 0.5;
      const C1_DUR = exitDuration * C1_RATIO;
      const C2_START = PHASE_B_END + C1_DUR;
      const C2_DUR = exitDuration - C1_DUR;

      // Sub-fase C1 — recuo 3D: hero encolhe ~38%, tilta ~8° em X (eixo
      // horizontal — como uma janela inclinando para trás), sobe um pouco
      // e ganha border-radius. EASE pesado (expo.out) dá o "snap" KPR.
      tl.to(
        heroWrap,
        {
          scaleX: () => computeHeroScaleXY().scaleX * 0.62,
          scaleY: () => computeHeroScaleXY().scaleY * 0.62,
          y: () => computeHeroYOffset() - 60,
          rotationX: -8,
          rotationY: 0,
          z: -180,
          duration: C1_DUR,
          ease: "expo.out",
        },
        PHASE_B_END
      );
      // Volta o raio subtílio do card ao recuar (instantâneo; mascarado pelo
      // scale + tilt + sombra que crescem).
      if (heroCardEl) {
        tl.set(
          heroCardEl,
          {
            borderRadius: KPR_CARD_BORDER_RADIUS,
          },
          PHASE_B_END
        );
        tl.to(
          heroCardEl,
          {
            boxShadow:
              "0 36px 86px rgba(0,0,0,0.52), 0 12px 28px rgba(0,0,0,0.34), inset 0 0 0 1px rgba(255,255,255,0.045)",
            duration: C1_DUR,
            ease: "expo.out",
          },
          PHASE_B_END
        );
      }
      // O film NÃO desvanece durante a Fase C — ele permanece no último
      // frame (progress=1) enquanto o hero recolhe. A saída inteira é feita
      // pela transformação do heroWrap (scale/translate/opacity).

      // Sub-fase C2 — saída por cima: hero continua a subir + roda mais um
      // pouco em X e desvanece, cedendo o palco. A próxima secção ("Continua
      // a história") fica visível ANTES do hero sumir totalmente, criando o
      // overlap cinematográfico estilo peachweb.
      tl.to(
        heroWrap,
        {
          scaleX: () => computeHeroScaleXY().scaleX * 0.5,
          scaleY: () => computeHeroScaleXY().scaleY * 0.5,
          y: () => computeHeroYOffset() - window.innerHeight * 0.55,
          rotationX: -14,
          rotationZ: 0,
          z: -260,
          opacity: 0,
          duration: C2_DUR,
          ease: "quart.in",
        },
        C2_START
      );
      if (heroLabelRef.current) {
        tl.to(
          heroLabelRef.current,
          { opacity: 0, y: -30, duration: C2_DUR, ease: "quart.in" },
          C2_START
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
              "radial-gradient(80% 60% at 28% 22%, rgba(247,147,0,0.12) 0%, rgba(10,10,10,0) 60%), radial-gradient(60% 50% at 80% 90%, rgba(255,193,7,0.06) 0%, rgba(10,10,10,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f79300 1px, transparent 1px), linear-gradient(to bottom, #f79300 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div
          aria-hidden
          className="relative z-30 section-padding-x"
          style={{ paddingTop: "var(--space-4)" }}
        />

        <div
          className="relative z-20 section-padding-x"
          style={{ marginTop: "3vh" }}
        >
          {/* Mesmo padrão horizontal das secções (cycle 0005): gutter + content-wrap */}
          <div className="content-wrap">
            <h2
              ref={titleRef}
              className="hero-min-black-outline t-h2"
              style={{
                opacity: 0,
              }}
            >
              DÊ O UPGRADE QUE VOCÊ MERECE.
            </h2>
          </div>
        </div>

        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: "58%",
            perspective: "2400px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            ref={trackRef}
            className="relative flex items-center"
            style={{
              gap: "var(--space-5)",
              paddingLeft: "var(--gutter)",
              paddingRight: "var(--gutter)",
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
                    <div
                      ref={heroWrapRef}
                      style={{
                        transformOrigin: "50% 50%",
                        transformStyle: "preserve-3d",
                        willChange: "transform, opacity",
                      }}
                    >
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
            backgroundColor: "var(--card-bg)",
            willChange: "left, top, width, height, opacity",
            // shadow só faz sentido quando o overlay já encolheu para o
            // formato de card; nos primeiros frames (fullscreen) é invisível
            boxShadow:
              "0 28px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
          aria-hidden
        >
          <div ref={introOverlayMediaRef} className="absolute inset-0">
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
          </div>
          <div
            ref={introOverlayCopyRef}
            className="absolute z-[2] pointer-events-none"
            style={{
              top: "clamp(var(--space-6), 7vh, var(--space-8))",
              left: "var(--gutter)",
              maxWidth: "min(680px, calc(100vw - 2 * var(--gutter)))",
            }}
          >
            <p
              className="hero-min-black-outline"
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.96)",
                fontFamily: "var(--font-oswald), sans-serif",
                fontSize: "clamp(30px, 5.1vw, 78px)",
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                textShadow: "0 12px 36px rgba(0,0,0,0.42)",
              }}
            >
              Se o seu inventário é básico…
            </p>
          </div>
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
          className="pointer-events-none absolute inset-x-0 bottom-7 z-30 section-padding-x"
          style={{ opacity: 0 }}
        >
          <div className="content-wrap">
            <span
              className="hero-min-black-outline t-card-sub"
              style={{ color: "var(--foreground-faint)" }}
            >
              SCROLL ↓
            </span>
          </div>
        </div>
      </div>

      <motion.section
        id="continua-narrativa"
        aria-label="Continua a história"
        className="relative isolate block w-full overflow-hidden section-padding"
        style={{
          minHeight: "min(100vh, 760px)",
          background: "var(--background)",
          color: "var(--foreground)",
          transformOrigin: "50% 0%",
        }}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.96 }}
        whileInView={
          reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
        }
        viewport={{ once: false, margin: "-10%" }}
        transition={{
          duration: reducedMotion ? 0.3 : 0.95,
          ease: EASE_OUT_EXPO,
        }}
        onPointerMoveCapture={narrativaBackdrop.onSectionPointerMove}
        onPointerLeave={narrativaBackdrop.onSectionPointerLeave}
      >
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          style={{ perspective: "1400px", WebkitPerspective: "1400px" }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{
              rotateX: narrativaBackdrop.rotateX,
              rotateY: narrativaBackdrop.rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <LightPillar
                topColor="#5227FF"
                bottomColor="#FF9FFC"
                intensity={1}
                rotationSpeed={0.3}
                glowAmount={0.002}
                pillarWidth={3}
                pillarHeight={0.4}
                noiseIntensity={0.5}
                pillarRotation={25}
                interactive={false}
                mixBlendMode="screen"
                quality="high"
              />
            </div>
          </motion.div>
        </div>
        {/*
          AWP Light — centralizada na seção, escala 1.5x com upscale lossless.
          Animação leve no pointer move (parallax sutil em translateX/Y) sem
          efeitos pesados no mouse.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
        >
          <motion.div
            className="relative"
            style={{
              width: "min(90%, 1140px)",
              aspectRatio: "5760 / 1116",
              x: narrativaBackdrop.awpX,
              y: narrativaBackdrop.awpY,
              filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))",
            }}
          >
            <Image
              src="/gallery/AWP Light (1)@1.5x.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 90vw, 95vw"
              quality={100}
              unoptimized
              priority={false}
              className="object-contain object-center [image-rendering:high-quality]"
            />
          </motion.div>
        </div>
      </motion.section>
    </section>
  );
}
