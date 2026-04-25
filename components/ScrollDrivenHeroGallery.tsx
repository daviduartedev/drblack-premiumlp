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
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);

  const [expansionProgress, setExpansionProgress] = useState(0);
  const expansionProgressRef = useRef(0);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const heroWrap = heroWrapRef.current!;

      gsap.set(track, { xPercent: 0, yPercent: -50, force3D: true });

      const computeShift = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 0;
        const heroRect = heroEl.getBoundingClientRect();
        const viewportCenter = window.innerWidth / 2;
        const heroCenter = heroRect.left + heroRect.width / 2;
        return viewportCenter - heroCenter;
      };

      const computeHeroScale = () => {
        const heroEl = cardRefs.current[HERO_INDEX];
        if (!heroEl) return 1;
        const rect = heroEl.getBoundingClientRect();
        const targetW = window.innerWidth;
        const targetH = window.innerHeight;
        const scaleX = targetW / rect.width;
        const scaleY = targetH / rect.height;
        return Math.max(scaleX, scaleY);
      };

      // ============================================================
      // FASE A — Carrossel: faixa desliza até hero centralizar.
      // Timeline própria com elastic/band + sway escalonado.
      // ============================================================
      const tlCarousel = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          pinSpacing: true,
          scrub: 1.0, // inércia / elastic feel
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // overshoot 4% e volta — sensação band
      tlCarousel.to(
        track,
        {
          x: () => computeShift() * 1.04,
          duration: 0.78,
          ease: "power2.out",
        },
        0
      );
      tlCarousel.to(
        track,
        {
          x: () => computeShift(),
          duration: 0.22,
          ease: "power2.inOut",
        },
        0.78
      );

      // sway escalonado nos cards não-hero
      for (let i = 0; i < HERO_INDEX; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const delay = i * 0.04;
        tlCarousel.to(
          card,
          { y: -10, rotation: -0.8, duration: 0.42, ease: "power2.out" },
          delay
        );
        tlCarousel.to(
          card,
          { y: 0, rotation: 0, duration: 0.36, ease: "power2.inOut" },
          0.5 + delay
        );
      }

      // ============================================================
      // FASE B — Expansão hero até fullscreen + scrub frames 1..101
      // EM PARALELO. Timeline própria, segunda ScrollTrigger,
      // começa exatamente onde a Fase A termina.
      // ============================================================
      const tlExpand = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top-=200%", // logo após o fim da Fase A
          end: "+=400%",
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // Os 65% iniciais da fase B controlam a expansão de escala;
            // de 35% pra 100% rola o film scrub (1→101) — porém ambos
            // permanecem no MESMO trecho de scroll. O scrub das frames
            // começa quando a expansão atinge ~25% (paralelismo real).
            const filmStart = 0.25;
            if (p >= filmStart) {
              const t = (p - filmStart) / (1 - filmStart);
              const clamped = Math.min(1, Math.max(0, t));
              if (expansionProgressRef.current !== clamped) {
                expansionProgressRef.current = clamped;
                setExpansionProgress(clamped);
              }
            } else if (expansionProgressRef.current !== 0) {
              expansionProgressRef.current = 0;
              setExpansionProgress(0);
            }
          },
        },
      });

      // hero scale → fullscreen
      tlExpand.fromTo(
        heroWrap,
        { scale: 1 },
        {
          scale: () => computeHeroScale(),
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      // film overlay aparece junto
      tlExpand.fromTo(
        heroFilmRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: "power1.inOut" },
        0.05
      );

      // texto principal e HUD somem assim que a fase B começa
      tlExpand.to(
        [eyebrowRef.current, titleRef.current, subRef.current],
        { opacity: 0, y: -30, duration: 0.25, ease: "power2.in" },
        0
      );
      tlExpand.to(
        hudRef.current,
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        0
      );

      // demais cards somem para deixar o hero protagonizar
      for (let i = 0; i < HERO_INDEX; i++) {
        tlExpand.to(
          cardRefs.current[i],
          { opacity: 0, duration: 0.3, ease: "power1.in" },
          0
        );
      }

      // labels overlay aparecem ao longo da expansão
      tlExpand.fromTo(
        heroLabelRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        0.15
      );
      tlExpand.fromTo(
        heroHeadlineRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
        0.55
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
            05 · ARSENAL
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
            Cinco cartas. Uma vira o jogo. Compra, concorre e leva — direto, sem
            enrolação.
          </p>
        </div>

        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: "62%",
            perspective: "1600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            ref={trackRef}
            className="relative flex items-center"
            style={{
              gap: "clamp(16px, 1.8vw, 32px)",
              paddingLeft: "6vw",
              paddingRight: "6vw",
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
                    width: "clamp(380px, 38vw, 620px)",
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
                        sizes="(min-width: 1024px) 38vw, 90vw"
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
                                {"AQUI O PRECO TA EXPOSTO\nE A SKIN TA SOBRIA."}
                              </h2>
                            </div>
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
                      sizes="(min-width: 1024px) 38vw, 80vw"
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
          <span style={{ color: "var(--highlight)" }}>05 / 05 · ARSENAL</span>
        </div>
      </div>

      <section
        className="relative w-full"
        style={{
          minHeight: "100vh",
          background: "#eed9c4",
          color: "#0a0a0a",
        }}
      >
        <div className="mx-auto max-w-6xl px-[5vw] py-24">
          <div
            className="text-[11px] tracking-[0.28em] uppercase"
            style={{ color: "rgba(10,10,10,0.55)" }}
          >
            06 · TIMELINE
          </div>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              fontSize: "clamp(42px, 6vw, 92px)",
              lineHeight: 0.95,
            }}
          >
            Continua a narrativa
          </h2>
          <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-black/70">
            Do arquivo vivo para o mercado real. Da promessa para a entrega.
          </p>
        </div>
      </section>
    </section>
  );
}