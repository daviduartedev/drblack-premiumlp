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
 * Pin único, scroll-linked, em duas fases — estilo KPR:
 *
 * ▸ FASE A — Carrossel (0 → ~0.45)
 *     Três cartas KPR (mesma shape, propor­ção 3:4, recorte de canto) deslizam
 *     juntas da direita para a esquerda. As cartas 1 e 2 saem de cena; a carta
 *     3 (knife.png, estática) permanece centralizada e cresce até preencher
 *     a tela.
 *
 * ▸ FASE B — Animação por scroll (~0.45 → 1.0)
 *     A carta 3 vira o palco do scrub: a imagem estática faz cross-fade para
 *     o ScrollFilmFrames, que toca os primeiros 101 frames de
 *     `/animacao-frames/` conforme o usuário rola. Estilo KPR puro.
 */
export default function ScrollDrivenHeroGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const card3StaticRef = useRef<HTMLDivElement>(null);
  const card3FilmRef = useRef<HTMLDivElement>(null);
  const card3HeadlineRef = useRef<HTMLHeadingElement>(null);
  const card3LabelRef = useRef<HTMLDivElement>(null);

  const hudRef = useRef<HTMLDivElement>(null);

  // Progress 0..1 of the film scrub phase only (B). Starts ticking past
  // FILM_PHASE_START.
  const [filmProgress, setFilmProgress] = useState(0);
  const [filmActive, setFilmActive] = useState(false);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current) return;

    const FILM_PHASE_START = 0.45;
    const FILM_PHASE_END = 1.0;

    const ctx = gsap.context(() => {
      // ---- Initial layout (centered via xPercent / yPercent) ----------------
      gsap.set([card1Ref.current, card2Ref.current], {
        xPercent: -50,
        yPercent: -50,
        force3D: true,
      });
      gsap.set(card1Ref.current, { rotation: -4 });
      gsap.set(card2Ref.current, { rotation: 3 });

      gsap.set(card3Ref.current, {
        xPercent: -50,
        yPercent: -50,
        rotation: -1,
        scale: 1,
        force3D: true,
      });

      gsap.set(card3FilmRef.current, { opacity: 0 });
      gsap.set(card3HeadlineRef.current, { opacity: 0, y: 20, scale: 0.7 });
      gsap.set(card3LabelRef.current, { opacity: 0 });

      // Sliding distance for the carousel (off-screen left). Function form so
      // it recalculates on resize via invalidateOnRefresh.
      const slideOut = () => -1.4 * window.innerWidth;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=620%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p >= FILM_PHASE_START) {
              const t =
                (p - FILM_PHASE_START) / (FILM_PHASE_END - FILM_PHASE_START);
              setFilmProgress(Math.min(1, Math.max(0, t)));
              if (!filmActiveRef.current) {
                filmActiveRef.current = true;
                setFilmActive(true);
              }
            } else if (filmActiveRef.current) {
              filmActiveRef.current = false;
              setFilmActive(false);
              setFilmProgress(0);
            }
          },
        },
      });

      // =====================================================================
      // PHASE A — KPR carousel (0 → 0.40)
      // The whole "row" travels left together. Cards 1 and 2 keep going and
      // exit; card 3 (hero) stops centered and begins to scale up.
      // =====================================================================
      tl.to(card1Ref.current, { x: slideOut, rotation: -10, duration: 0.4 }, 0);
      tl.to(card2Ref.current, { x: slideOut, rotation: -2, duration: 0.4 }, 0);
      tl.to(
        card3Ref.current,
        { x: 0, rotation: 0, duration: 0.4 },
        0
      );

      // Fade out the row labels as cards leave.
      tl.to(
        [card1Ref.current, card2Ref.current],
        { opacity: 0, duration: 0.08, ease: "power2.in" },
        0.34
      );

      // =====================================================================
      // PHASE A→B handoff (0.40 → 0.45)
      // Hero card scales to fill the viewport, headline/eyebrow fade out so
      // the film scrub takes over the stage.
      // =====================================================================
      tl.to(
        card3Ref.current,
        {
          scale: 4.4,
          duration: 0.05,
          ease: "power2.inOut",
        },
        0.4
      );

      tl.to(
        eyebrowRef.current,
        { opacity: 0, y: -18, duration: 0.18, ease: "power2.in" },
        0.36
      );
      tl.to(
        titleRef.current,
        { opacity: 0, y: -42, duration: 0.22, ease: "power2.in" },
        0.36
      );
      tl.to(
        subRef.current,
        { opacity: 0, y: -18, duration: 0.18, ease: "power2.in" },
        0.36
      );
      tl.to(
        hudRef.current,
        { opacity: 0, duration: 0.18, ease: "power2.in" },
        0.4
      );

      // Static → film cross-fade. The static layer dies just as the film
      // layer wakes up — exactly at FILM_PHASE_START.
      tl.to(
        card3StaticRef.current,
        { opacity: 0, duration: 0.04, ease: "power1.inOut" },
        0.43
      );
      tl.to(
        card3FilmRef.current,
        { opacity: 1, duration: 0.04, ease: "power1.inOut" },
        0.43
      );

      // =====================================================================
      // PHASE B — Frame scrub (0.45 → 1.0)
      // The film progress is driven by onUpdate above; this section reserves
      // the timeline space and brings in the reveal label.
      // =====================================================================
      tl.to({}, { duration: 0.55 }, 0.45); // hold for the scrub

      tl.to(
        card3LabelRef.current,
        { opacity: 1, duration: 0.18, ease: "power2.out" },
        0.5
      );
      tl.to(
        card3HeadlineRef.current,
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power2.out" },
        0.85
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Mirror filmActive into a ref so the scrollTrigger callback doesn't need
  // a re-bound closure on every state change.
  const filmActiveRef = useRef(false);

  return (
    <section ref={rootRef} className="w-full">
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* Ambient gradients + grid */}
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
            03 · ARSENAL
          </div>
        </div>

        {/* Texto */}
        <div className="relative z-20 px-[5vw] mt-[8vh] max-w-[64rem]">
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
              fontSize: "clamp(56px, 9vw, 156px)",
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
            Três cartas. Uma vira o jogo. Compra, concorre e leva — direto, sem
            enrolação.
          </p>
        </div>

        {/* Palco do carrossel KPR */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ perspective: "1600px", perspectiveOrigin: "50% 50%" }}
        >
          {/* Card 1 — left of the row */}
          <KprCard
            ref={card1Ref}
            src="/gallery/env-1.jpg"
            index="01 · MERCADO"
            title="Drop do dia"
            subtitle="Sem enrolação"
            className="absolute"
            style={{
              top: "50%",
              left: "18vw",
              width: "min(280px, 22vw)",
            }}
            sizes="(min-width: 1024px) 22vw, 60vw"
          />

          {/* Card 2 — middle of the row */}
          <KprCard
            ref={card2Ref}
            src="/gallery/card-1.jpg"
            index="02 · MERCADO AO VIVO"
            title="Mercado ao vivo"
            subtitle="Tempo real"
            className="absolute"
            style={{
              top: "50%",
              left: "50vw",
              width: "min(320px, 24vw)",
            }}
            sizes="(min-width: 1024px) 24vw, 70vw"
          />

          {/* Card 3 — hero card. Static initially, becomes the film stage. */}
          <div
            ref={card3Ref}
            className="absolute"
            style={{
              top: "50%",
              left: "82vw",
              width: "min(360px, 26vw)",
              aspectRatio: "3 / 4",
              willChange: "transform",
            }}
          >
            <KprCard
              src="/gallery/knife.png"
              index="03 · CARTA FORTE"
              hideLabels
              priority
              sizes="(min-width: 1024px) 26vw, 80vw"
              className="absolute inset-0"
              style={{ width: "100%", aspectRatio: "3 / 4" }}
              overlay={
                <>
                  {/* Static layer (knife.png) — visible during phase A. */}
                  <div
                    ref={card3StaticRef}
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden
                  />
                  {/* Film layer — fades in for phase B. */}
                  <div
                    ref={card3FilmRef}
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden
                  >
                    {filmActive ? (
                      <ScrollFilmFrames
                        progress={filmProgress}
                        firstIndex={1}
                        lastIndex={101}
                        fallbackColor="#0a0a0a"
                      />
                    ) : null}
                  </div>

                  {/* Headline + label that materialize during the scrub. */}
                  <div
                    ref={card3LabelRef}
                    className="absolute top-6 left-6 text-[10px] tracking-[0.32em] uppercase z-10"
                    style={{ color: "rgba(238,217,196,0.92)", opacity: 0 }}
                  >
                    03 · CARTA FORTE
                  </div>
                  <div
                    className="absolute bottom-[14vh] left-0 right-0 px-[5vw] z-10 pointer-events-none"
                  >
                    <h2
                      ref={card3HeadlineRef}
                      style={{
                        fontFamily: "var(--font-oswald), sans-serif",
                        fontWeight: 700,
                        lineHeight: 0.88,
                        letterSpacing: "-0.025em",
                        fontSize: "clamp(28px, 5vw, 84px)",
                        color: "rgba(255,255,255,0.97)",
                        textTransform: "uppercase",
                        whiteSpace: "pre-line",
                        textShadow: "0 14px 40px rgba(0,0,0,0.45)",
                        maxWidth: "76rem",
                      }}
                    >
                      {"AQUI O PREÇO TÁ EXPOSTO\nE A SKIN TÁ SÓBRIA."}
                    </h2>
                  </div>
                </>
              }
            />
          </div>
        </div>

        {/* HUD inferior */}
        <div
          ref={hudRef}
          className="absolute inset-x-[5vw] bottom-7 z-30 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase pointer-events-none"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <span>SCROLL ↓</span>
          <span style={{ color: "var(--highlight)" }}>03 / 03 · ARSENAL</span>
        </div>
      </div>

      {/* Próxima seção (timeline) */}
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
            04 · TIMELINE
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
