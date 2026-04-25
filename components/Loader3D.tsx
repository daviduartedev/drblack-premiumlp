"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Loader inicial estilo KPR.
 *
 * Visual minimalista:
 *  - Fundo creme (tema da landing).
 *  - Wordmark gigante "DR · BLACK SKINS" no canto superior esquerdo.
 *  - Contador grande (00 → 100) no centro/inferior.
 *  - Barra horizontal fina abaixo do contador, cresce com o progresso.
 *  - Linhas pequenas no rodapé com status.
 *  - Sem ruído, sem glitch — clean.
 *  - Ao chegar em 100, fade-out suave + chama onRequestFlip().
 */
export default function Loader3D({
  onRequestFlip,
}: {
  onRequestFlip: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [pct, setPct] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING SYSTEM");

  // troca de status ao longo do load — sensação KPR de "boot sequence"
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

    const ctx = gsap.context(() => {
      // entrada — wordmark e sub deslizam de baixo
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
        { y: 0, opacity: 0.6, duration: 0.6, ease: "power3.out", delay: 0.2 }
      );

      // counter 0 → 100 e barra preenchendo em paralelo
      const counter = { v: 0 };
      const tl = gsap.timeline({
        delay: 0.35,
        onComplete: () => {
          // Hold breve em 100, então fade-out suave do overlay inteiro
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.55,
            ease: "power2.inOut",
            delay: 0.35,
            onComplete: () => {
              onRequestFlip();
            },
          });
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

    return () => ctx.revert();
  }, [onRequestFlip]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#eed9c4",
        color: "#0a0a0a",
      }}
    >
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1,
        }}
      >
        {/* Grid bg sutil */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              "linear-gradient(to right, #0a0a0a 1px, transparent 1px), linear-gradient(to bottom, #0a0a0a 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            pointerEvents: "none",
          }}
        />

        {/* Topbar — wordmark left, eyebrow right */}
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
              color: "rgba(10,10,10,0.85)",
            }}
          >
            DR · BLACK SKINS
          </div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(10,10,10,0.55)",
            }}
          >
            00 · BOOT
          </div>
        </div>

        {/* Centro: títulos grandes */}
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
              color: "rgba(10,10,10,0.55)",
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
              color: "#0a0a0a",
              margin: 0,
            }}
          >
            DR · BLACK
            <br />
            SKINS
          </h1>
        </div>

        {/* Rodapé esquerdo: status */}
        <div
          ref={statusRef}
          style={{
            position: "absolute",
            bottom: "8vh",
            left: "5vw",
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(10,10,10,0.6)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              backgroundColor: "var(--highlight, #ff5c0a)",
              borderRadius: "50%",
              marginRight: 10,
              verticalAlign: "middle",
            }}
          />
          {statusText}
        </div>

        {/* Rodapé direito: contador + barra */}
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
              color: "#0a0a0a",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span ref={counterRef}>{String(pct).padStart(3, "0")}</span>
            <span
              style={{
                fontSize: "0.42em",
                marginLeft: "0.18em",
                verticalAlign: "top",
                color: "rgba(10,10,10,0.5)",
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
              backgroundColor: "rgba(10,10,10,0.18)",
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
                backgroundColor: "#0a0a0a",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
