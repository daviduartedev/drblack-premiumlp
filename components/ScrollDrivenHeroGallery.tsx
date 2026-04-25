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
  const heroHeadlineRef = useRef<HTMLDivElement>(null);

  const [expansionProgress, setExpansionProgress] = useState(0);
  const expansionProgressRef = useRef(0);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current || !trackRef.current) return;

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
        return {
          scaleX: (targetW / heroBaseW) * 1.02,
          scaleY: (targetH / heroBaseH) * 1.02,
        };
      };

      // Estado inicial: faixa empurrada para a direita — hero colado à
      // borda direita do viewport, demais cards fora da tela.
      gsap.set(track, { x: () => computeStartX() });

      // ============================================================
      // Timeline ÚNICA pinada — evita conflito de múltiplas ScrollTriggers
      // pinando o mesmo elemento.
      //
      // Layout temporal (progress 0..1):
      //   0.00 .. 0.45  Fase A — carrossel desliza direita → centro
      //   0.45 .. 1.00  Fase B — hero expande + frames scrubam EM PARALELO
      // ============================================================
      const PHASE_A_END = 0.45;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=600%",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // Frame scrub roda durante TODA a fase B (paralelo à expansão).
            if (p >= PHASE_A_END) {
              const t = (p - PHASE_A_END) / (1 - PHASE_A_END);
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

      // ----- FASE A — carrossel direita → centro (0 .. 0.45) -----
      // Sem overshoot: a faixa vai direto até o hero ficar centralizado
      // e PARA. Daí em diante a fase B (expansão 3D + frame scrub) toma
      // o controle. Easing suave para sensação band sem ultrapassar.
      tl.to(
        track,
        {
          x: () => computeShift(),
          duration: 0.45,
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

      // ----- FASE B — expansão hero + frame scrub em PARALELO (0.45 .. 1.0) -----
      // Hero scale anisotrópico → fullscreen exato (cobre viewport inteira
      // independente da proporção da tela). object-cover do <Image>
      // interno faz o crop natural para preencher sem distorcer.
      tl.fromTo(
        heroWrap,
        { scaleX: 1, scaleY: 1, rotationX: 0, rotationY: 0, z: 0 },
        {
          scaleX: () => computeHeroScaleXY().scaleX,
          scaleY: () => computeHeroScaleXY().scaleY,
          duration: 0.55,
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
          { borderRadius: 0, duration: 0.55, ease: "power2.inOut" },
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

                            {/* headline overlay removido a pedido do usuário */}
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
