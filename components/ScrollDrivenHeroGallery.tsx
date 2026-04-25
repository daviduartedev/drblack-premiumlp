"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import ScrollFilmCoda from "@/components/ScrollFilmCoda";

gsap.registerPlugin(ScrollTrigger);

/**
 * Seção "SKINS NO PONTO. RIFA NA TELA."
 *
 * Fluxo (scroll-linked, single pin):
 *  ▸ Fase A — carrossel contínuo: as três cartas deslizam juntas da direita
 *    para a esquerda. A última carta (knife.png) entra pela direita e termina
 *    centralizada, ainda em "modo carta" (escala reduzida, com tilt 3D).
 *  ▸ Fase B — expansão: a carta hero cresce até preencher a tela enquanto
 *    título/eyebrow/sub e as outras cartas se desvanecem. O frame final faz
 *    handoff visual para o `ScrollFilmCoda` (scrub das frames `frame_001…101`).
 */
export default function ScrollDrivenHeroGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  const card3WrapRef = useRef<HTMLDivElement>(null);
  const card3InnerRef = useRef<HTMLDivElement>(null);
  const card3HeadlineRef = useRef<HTMLHeadingElement>(null);
  const card3LabelRef = useRef<HTMLDivElement>(null);

  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      // Cartas 1 e 2 ficam ancoradas em `top/left` (centro da carta) e o GSAP
      // cuida da centralização real via xPercent/yPercent — isso permite
      // animar `x` (em vw) sem brigar com `translate(-50%, -50%)`.
      gsap.set(card1Ref.current, {
        xPercent: -50,
        yPercent: -50,
        rotation: -3,
        force3D: true,
      });
      gsap.set(card2Ref.current, {
        xPercent: -50,
        yPercent: -50,
        rotation: 2.5,
        force3D: true,
      });

      // Carta hero (knife.png) ocupa `inset-0`. No início aparece reduzida e
      // deslocada para fora da tela à direita — entra no frame durante a fase
      // A do carrossel.
      gsap.set(card3WrapRef.current, {
        scale: 0.34,
        xPercent: 65,
        yPercent: 6,
        rotationY: -10,
        rotationZ: -3,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap.set(card3HeadlineRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.6,
        transformOrigin: "0% 100%",
      });

      // Deslocamento do carrossel em pixels — função para reagir a resize via
      // `invalidateOnRefresh`.
      const carouselShift = () => -0.65 * window.innerWidth;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=380%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ============================================================
      // FASE A — Carrossel contínuo (0 → 0.55)
      // Todas as cartas viajam o mesmo `carouselShift`, criando uma
      // sensação de fileira coesa correndo da direita para a esquerda.
      // ============================================================
      tl.to(
        card1Ref.current,
        { x: carouselShift, rotation: -10, duration: 0.55 },
        0
      );
      tl.to(
        card2Ref.current,
        { x: carouselShift, rotation: -2, duration: 0.55 },
        0
      );
      tl.to(
        card3WrapRef.current,
        {
          xPercent: 0,
          yPercent: 4,
          rotationY: -6,
          rotationZ: -1.5,
          duration: 0.55,
        },
        0
      );

      // ============================================================
      // FASE B — Expansão da carta hero + fade do conteúdo (0.55 → 0.92)
      // ============================================================
      tl.to(
        [card1Ref.current, card2Ref.current],
        { opacity: 0, duration: 0.08, ease: "power2.in" },
        0.55
      );
      tl.to(
        eyebrowRef.current,
        { opacity: 0, y: -16, duration: 0.18, ease: "power2.in" },
        0.55
      );
      tl.to(
        titleRef.current,
        { opacity: 0, y: -42, duration: 0.22, ease: "power2.in" },
        0.55
      );
      tl.to(
        subRef.current,
        { opacity: 0, y: -18, duration: 0.18, ease: "power2.in" },
        0.55
      );

      tl.to(
        card3WrapRef.current,
        {
          scale: 1,
          xPercent: 0,
          yPercent: 0,
          rotationY: 0,
          rotationZ: 0,
          duration: 0.32,
          ease: "power2.inOut",
        },
        0.6
      );

      tl.to(
        card3InnerRef.current,
        {
          borderRadius: 0,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          borderColor: "rgba(255,255,255,0)",
          duration: 0.28,
          ease: "power2.inOut",
        },
        0.62
      );

      tl.to(
        card3HeadlineRef.current,
        { opacity: 0.55, y: 0, scale: 1, duration: 0.28, ease: "power2.out" },
        0.7
      );
      tl.to(card3LabelRef.current, { opacity: 1, duration: 0.18 }, 0.78);

      tl.to(
        hudRef.current,
        { opacity: 0, duration: 0.18, ease: "power2.in" },
        0.6
      );

      // 0.92 → 1.0 — frame final segura para handoff suave ao ScrollFilmCoda.
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
        {/* Ambiente de fundo (gradiente ancorado na paleta). */}
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

        {/* Bloco textual */}
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

        {/* Palco 3D — fileira de cartas em carrossel */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
        >
          {/* Carta 1 — thumb pequena (mercado) */}
          <div
            ref={card1Ref}
            className="absolute"
            style={{
              top: "72vh",
              left: "20vw",
              width: "min(220px, 17vw)",
              aspectRatio: "4 / 3",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
              willChange: "transform, opacity",
              backgroundColor: "#120f0c",
            }}
          >
            <Image
              src="/gallery/env-1.jpg"
              alt=""
              fill
              sizes="220px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            <div
              className="absolute bottom-2 left-3 text-[9px] tracking-[0.28em] uppercase"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              01 · MERCADO
            </div>
          </div>

          {/* Carta 2 — retrato gamer */}
          <div
            ref={card2Ref}
            className="absolute"
            style={{
              top: "60vh",
              left: "55vw",
              width: "min(360px, 22vw)",
              aspectRatio: "3 / 4",
              borderRadius: "22px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 22px 60px rgba(0,0,0,0.58)",
              willChange: "transform, opacity",
              backgroundColor: "#1a1510",
            }}
          >
            <Image
              src="/gallery/card-1.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, 60vw"
              className="object-cover"
            />
            <div
              className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
              style={{
                background:
                  "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)",
              }}
            />
            <div
              className="absolute top-3 left-4 text-[10px] tracking-[0.28em] uppercase"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              02 · MERCADO AO VIVO
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div
                className="text-[15px] font-semibold tracking-tight"
                style={{ color: "rgba(255,255,255,0.96)" }}
              >
                Mercado ao vivo
              </div>
              <div
                className="text-[10px] tracking-[0.18em] uppercase mt-1"
                style={{ color: "rgba(238,217,196,0.78)" }}
              >
                Sem enrolação
              </div>
            </div>
          </div>

          {/* Carta 3 — hero (knife.png), entra pela direita e expande até a tela cheia */}
          <div
            ref={card3WrapRef}
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            <div
              ref={card3InnerRef}
              className="relative w-full h-full overflow-hidden"
              style={{
                borderRadius: "32px",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
                backgroundColor: "#0a0a0a",
              }}
            >
              <Image
                src="/gallery/knife.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ transform: "scale(1.04)" }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div
                ref={card3LabelRef}
                className="absolute top-6 left-6 text-[10px] tracking-[0.32em] uppercase"
                style={{ color: "rgba(238,217,196,0.92)", opacity: 0 }}
              >
                03 · CARTA FORTE
              </div>
              <div className="absolute bottom-[14vh] left-0 right-0 px-[5vw] pointer-events-none">
                <h2
                  ref={card3HeadlineRef}
                  style={{
                    fontFamily: "var(--font-oswald), sans-serif",
                    fontWeight: 700,
                    lineHeight: 0.88,
                    letterSpacing: "-0.025em",
                    fontSize: "clamp(40px, 8vw, 120px)",
                    color: "rgba(255,255,255,0.97)",
                    textTransform: "uppercase",
                    whiteSpace: "pre-line",
                    textShadow: "0 14px 40px rgba(0,0,0,0.45)",
                    maxWidth: "76rem",
                  }}
                >
                  {"CARTA FORTE\nNO SEU TEMPO."}
                </h2>
              </div>
            </div>
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

      <ScrollFilmCoda />

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
