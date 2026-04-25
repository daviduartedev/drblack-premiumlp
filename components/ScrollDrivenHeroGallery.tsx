"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import KprCard from "@/components/KprCard";
import ScrollFilmFrames from "@/components/ScrollFilmFrames";

gsap.registerPlugin(ScrollTrigger);

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
 *
 * Tudo em um único pin scroll-trigger para garantir continuidade visual.
 */

const CARDS = [
  {
    src: "/gallery/env-1.jpg",
    index: "01 · MERCADO",
    title: "Drop do dia",
    subtitle: "Sem enrolação",
  },
  {
    src: "/gallery/env-2.jpg",
    index: "02 · MERCADO AO VIVO",
    title: "Mercado ao vivo",
    subtitle: "Tempo real",
  },
  {
    src: "/gallery/card-1.jpg",
    index: "03 · COMUNIDADE",
    title: "Comunidade ativa",
    subtitle: "Quem joga junto",
  },
  {
    src: "/gallery/env-3.jpg",
    index: "04 · ARSENAL",
    title: "Inventário curado",
    subtitle: "Sem clones",
  },
  {
    src: "/gallery/knife.png",
    index: "05 · CARTA FORTE",
    title: "Carta forte",
    subtitle: "Vira o jogo",
  },
] as const;

const TOTAL_CARDS = CARDS.length;
const HERO_INDEX = TOTAL_CARDS - 1; // último card é o hero

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
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);

  // Progresso 0..1 da fase de expansão (e do scrub das frames). Os dois
  // andam juntos, conforme requisito.
  const [expansionProgress, setExpansionProgress] = useState(0);

  // Mantém uma ref espelhando o state pra ser lida dentro do onUpdate sem
  // criar closures novas.
  const expansionProgressRef = useRef(0);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const PHASE_CAROUSEL_END = 0.5; // 0    -> 0.5  carrossel
    const PHASE_EXPAND_END = 1.0; //   0.5  -> 1.0  expansão + film scrub

    const ctx = gsap.context(() => {
      // Centralizamos a fileira via xPercent/yPercent num wrapper para que
      // possamos animar `x` em pixels sem brigar com translate do GSAP.
      const track = trackRef.current!;
      const heroWrap = heroWrapRef.current!;

      gsap.set(track, { xPercent: 0, yPercent: -50, force3D: true });

      // Calcula deslocamento alvo: trazer o último card ao centro do viewport.
      const computeShift = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const heroRect = heroEl.getBoundingClientRect();
        const viewportCenter = window.innerWidth / 2;
        const heroCenter = heroRect.left + heroRect.width / 2;
        return viewportCenter - heroCenter;
      };

      // Posição inicial e de chegada do último card no viewport (para a
      // transição 3D card → fullscreen).
      const computeHeroFromTo = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return null;
        // No final do carrossel o hero está centralizado no viewport.
        const rect = heroEl.getBoundingClientRect();
        const fromW = rect.width;
        const fromH = rect.height;
        const targetW = window.innerWidth;
        const targetH = window.innerHeight;
        const scaleX = targetW / fromW;
        const scaleY = targetH / fromH;
        return { fromW, fromH, scaleX, scaleY };
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=600%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p >= PHASE_CAROUSEL_END) {
              const t =
                (p - PHASE_CAROUSEL_END) /
                (PHASE_EXPAND_END - PHASE_CAROUSEL_END);
              const clamped = Math.min(1, Math.max(0, t));
              expansionProgressRef.current = clamped;
              setExpansionProgress(clamped);
            } else if (expansionProgressRef.current !== 0) {
              expansionProgressRef.current = 0;
              setExpansionProgress(0);
            }
          },
        },
      });

      // ===================================================================
      // FASE A — Carrossel (0 → 0.5)
      // O trilho inteiro desliza para a esquerda até o último card chegar
      // ao centro do viewport.
      // ===================================================================
      tl.to(
        track,
        {
          x: () => computeShift(),
          duration: 0.5,
          ease: "none",
        },
        0
      );

      // Header/HUD vão sumindo conforme o carrossel avança
      tl.to(
        [eyebrowRef.current, titleRef.current, subRef.current],
        { opacity: 0, y: -30, duration: 0.18, ease: "power2.in" },
        0.34
      );
      tl.to(
        hudRef.current,
        { opacity: 0, duration: 0.16, ease: "power2.in" },
        0.36
      );

      // Cards anteriores (1..n-1) perdem brilho/sat enquanto o hero ganha
      // atenção, mas continuam visíveis (acompanhando o scroll do trilho).
      for (let i = 0; i < HERO_INDEX; i++) {
        tl.to(
          cardRefs.current[i],
          { opacity: 0.32, duration: 0.18 },
          0.42
        );
      }

      // ===================================================================
      // FASE B — Expansão + film scrub (0.5 → 1.0) — paralelos
      // O hero card escala do tamanho dele até cobrir toda a viewport.
      // Em PARALELO, o ScrollFilmFrames recebe expansionProgress (0→1) e
      // scruba frame_001 → frame_101 dentro do mesmo card.
      // ===================================================================
      tl.fromTo(
        heroWrap,
        {
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          rotationZ: 0,
          z: 0,
        },
        {
          // GSAP aceita `scale` único; usamos uma função para retornar o
          // máximo entre scaleX/scaleY (cover-fit). Como o card é quadrado
          // e o viewport é landscape, o eixo dominante é o horizontal.
          scale: () => {
            const ft = computeHeroFromTo();
            if (!ft) return 1;
            return Math.max(ft.scaleX, ft.scaleY);
          },
          rotationY: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        0.5
      );

      // Cross-fade: a textura estática do card vira o film scrubber.
      tl.to(
        heroFilmRef.current,
        { opacity: 1, duration: 0.05, ease: "power1.inOut" },
        0.5
      );

      // Headline da fase final entra junto com a expansão.
      tl.fromTo(
        heroLabelRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
        0.55
      );
      tl.fromTo(
        heroHeadlineRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power2.out" },
        0.78
      );

      // Cards laterais somem completamente quando o hero está dominando.
      for (let i = 0; i < HERO_INDEX; i++) {
        tl.to(
          cardRefs.current[i],
          { opacity: 0, duration: 0.18, ease: "power1.in" },
          0.55
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
        {/* Fundo ambiente */}
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

        {/* Top bar */}
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
            05 · ARSENAL
          </div>
        </div>

        {/* Texto introdutório */}
        <div className="relative z-20 px-[5vw] mt-[6vh] max-w-[64rem]">
          <div
            ref={eyebrowRef}
            className="text-[10px] tracking-[0.32em] uppercase"
            style={{ color: "var(--highlight)" }}
          >
            ESCOLHE TUA CARTA
          </div>
          <h1
            ref={titleRef}
            className="mt-3"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.025em",
              fontSize: "clamp(48px, 7.6vw, 132px)",
              color: "rgba(255,255,255,0.96)",
              textTransform: "uppercase",
              whiteSpace: "pre-line",
            }}
          >
            {"SKINS NO PONTO.\nRIFA NA TELA."}
          </h1>
          <p
            ref={subRef}
            className="mt-5 max-w-md text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Cinco cartas. Uma vira o jogo. Compra, concorre e leva — direto, sem
            enrolação.
          </p>
        </div>

        {/* Carrossel — trilho horizontal de cards iguais */}
        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: "50%",
            perspective: "1600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            ref={trackRef}
            className="relative flex items-center"
            style={{
              gap: "clamp(20px, 2.4vw, 40px)",
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
                    width: "clamp(220px, 22vw, 360px)",
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
                        sizes="(min-width: 1024px) 22vw, 80vw"
                        overlay={
                          <>
                            {/* Camada com o film scrub — fica por cima da
                                imagem estática quando expansion > 0. */}
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

                            {/* Label do card hero (aparece na expansão) */}
                            <div
                              ref={heroLabelRef}
                              className="absolute top-6 left-6 text-[10px] tracking-[0.32em] uppercase z-[3]"
                              style={{
                                color: "rgba(238,217,196,0.92)",
                                opacity: 0,
                              }}
                            >
                              05 · CARTA FORTE
                            </div>

                            {/* Headline da fase fullscreen */}
                            <div className="absolute bottom-[12vh] left-0 right-0 px-[5vw] z-[3] pointer-events-none">
                              <h2
                                ref={heroHeadlineRef}
                                style={{
                                  fontFamily: "var(--font-oswald), sans-serif",
                                  fontWeight: 700,
                                  lineHeight: 0.88,
                                  letterSpacing: "-0.025em",
                                  fontSize: "clamp(24px, 4.4vw, 76px)",
                                  color: "rgba(255,255,255,0.97)",
                                  textTransform: "uppercase",
                                  whiteSpace: "pre-line",
                                  textShadow: "0 14px 40px rgba(0,0,0,0.55)",
                                  maxWidth: "76rem",
                                  opacity: 0,
                                }}
                              >
