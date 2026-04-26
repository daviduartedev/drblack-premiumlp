"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Loader inicial estilo KPR — paleta preto/branco.
 *
 * Visual:
 *  - Fundo PRETO (#000) com letras BRANCAS (#fff).
 *  - Wordmark uppercase top-left.
 *  - Headline gigante "DR · BLACK SKINS" central.
 *  - Contador grande (000 → 100) + barra fina embaixo à direita.
 *  - Status rotativo embaixo à esquerda.
 *
 * Transição 3D estilo KPR (final do loader):
 *  - O loader é dividido em DUAS metades (esquerda/direita).
 *  - Cada metade gira em rotateY (-90°/+90°) com perspectiva,
 *    como se fossem portas 3D que abrem revelando a hero por trás.
 *  - Simultaneamente, leve scale-down e fade do conteúdo central.
 *  - Easing "expo.inOut" pra dar peso cinematográfico.
 */
export default function Loader3D({
  onRequestFlip,
}: {
  onRequestFlip: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  // Guarda se a sequência principal já rodou — evita execução dupla
  // em React StrictMode (dev) e re-mounts.
  const ranRef = useRef(false);

  const [pct, setPct] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING SYSTEM");

  useEffect(() => {
    const seq = [
      "INITIALIZING SYSTEM",
      "FETCHING ARSENAL",
      "PREPARING MARKET",
      "BOOTING INTERFACE",
      "READY",
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setStatusText(seq[i]);
    }, 520);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    // StrictMode dispara o effect 2x em dev; primeira passagem deixa
    // a timeline rodar normal, segunda apenas faz no-op.
    if (ranRef.current) return;
    ranRef.current = true;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordmarkRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        subRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.12 }
      );
      gsap.fromTo(
        statusRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 0.7, duration: 0.6, ease: "power3.out", delay: 0.2 }
      );

      const counter = { v: 0 };
      const tl = gsap.timeline({
        delay: 0.35,
        onComplete: () => {
          // Transição 3D estilo KPR:
          // 1) Conteúdo central faz fade + scale leve.
          // 2) As duas metades (esquerda/direita) giram em rotateY abrindo
          //    como portas, revelando a hero por trás.
          // onStart dispara onRequestFlip pra hero começar junto.
          const out = gsap.timeline({
            delay: 0.25,
            onStart: () => {
              onRequestFlip();
            },
            onComplete: () => {
              // Garante que o loader não bloqueie a hero ao final.
              if (rootRef.current) {
                rootRef.current.style.pointerEvents = "none";
                rootRef.current.style.visibility = "hidden";
              }
            },
          });

          out.to(
            contentRef.current,
            {
              opacity: 0,
              scale: 0.94,
              duration: 0.5,
              ease: "power2.out",
            },
            0
          );

          out.to(
            leftPanelRef.current,
            {
              rotateY: -92,
              duration: 1.15,
              ease: "expo.inOut",
            },
            0.05
          );

          out.to(
            rightPanelRef.current,
            {
              rotateY: 92,
              duration: 1.15,
              ease: "expo.inOut",
            },
            0.05
          );

          // Pequeno "push" da câmera (z) pra dar profundidade.
          out.to(
            sceneRef.current,
            {
              z: -120,
              duration: 1.15,
              ease: "expo.inOut",
            },
            0.05
          );

          // Fade do root no fim pra não deixar nenhuma sombra residual.
          out.to(
            rootRef.current,
            {
              opacity: 0,
              duration: 0.45,
              ease: "power2.in",
            },
            0.85
          );
        },
      });

      tl.to(counter, {
        v: 100,
        duration: 2.6,
        ease: "power2.inOut",
        onUpdate: () => setPct(Math.round(counter.v)),
      });

      tl.to(
        barFillRef.current,
        { width: "100%", duration: 2.6, ease: "power2.inOut" },
        "<"
      );
    }, rootRef);

    // Não retornamos ctx.revert() aqui: em StrictMode dev o cleanup
    // do 1º mount roda ANTES do 2º mount, e como ranRef.current já está
    // true no 2º, ficaríamos com a animação revertida e nada mais
    // rodando. O contexto será garbage-collected quando o loader for
    // desmontado de vez (após onRequestFlip).
    void ctx;
  }, [onRequestFlip]);

  // Conteúdo de cada metade — duplicado idêntico, mas cada metade
  // mostra apenas sua porção via clip-path. Assim quando giram em 3D
  // o efeito de "porta dupla" fica perfeito.
  const renderHalf = (side: "left" | "right") => {
    const isLeft = side === "left";
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          clipPath: isLeft
            ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
            : "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
          overflow: "hidden",
        }}
      >
        {/* grid sutil */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            pointerEvents: "none",
          }}
        />

        {/* linha vertical central — fica perfeita quando as portas abrem */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: isLeft ? "auto" : 0,
            right: isLeft ? 0 : "auto",
            width: 1,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#000000",
        color: "#ffffff",
        zIndex: 100,
        willChange: "transform, opacity",
        perspective: "1600px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Cena 3D — contém as duas metades que giram como portas */}
      <div
        ref={sceneRef}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <div
          ref={leftPanelRef}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          {renderHalf("left")}
        </div>

        <div
          ref={rightPanelRef}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          {renderHalf("right")}
        </div>
      </div>

      {/* Conteúdo (fica acima das duas metades, faz fade no início da abertura) */}
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "5vh",
            left: "5vw",
            right: "5vw",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <div
            ref={wordmarkRef}
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              letterSpacing: "0.18em",
              fontSize: "13px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            DR · BLACK SKINS
          </div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            00 · BOOT
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5vw",
            right: "5vw",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <div
            ref={subRef}
            style={{
              fontSize: "11px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: "12px",
            }}
          >
            PREPARING THE EXPERIENCE
          </div>

          <h1
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              lineHeight: 0.86,
              letterSpacing: "-0.025em",
              fontSize: "clamp(56px, 11vw, 200px)",
              textTransform: "uppercase",
              color: "#ffffff",
              margin: 0,
            }}
          >
            DR · BLACK
            <br />
            SKINS
          </h1>
        </div>

        <div
          ref={statusRef}
          style={{
            position: "absolute",
            bottom: "8vh",
            left: "5vw",
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              marginRight: 10,
              verticalAlign: "middle",
            }}
          />
          {statusText}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "8vh",
            right: "5vw",
            zIndex: 2,
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(48px, 7vw, 120px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{String(pct).padStart(3, "0")}</span>
            <span
              style={{
                fontSize: "0.42em",
                marginLeft: "0.18em",
                verticalAlign: "top",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              %
            </span>
          </div>
          <div
            style={{
              marginTop: 14,
              width: "clamp(220px, 28vw, 460px)",
              height: 2,
              backgroundColor: "rgba(255,255,255,0.18)",
              position: "relative",
              overflow: "hidden",
              marginLeft: "auto",
            }}
          >
            <div
              ref={barFillRef}
              style={{
                position: "absolute",
                inset: 0,
                width: 0,
                backgroundColor: "#ffffff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
