"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Loader fiel ao KPR:
 *   Fase 1 (0 – 2.3s) » LOADING - NN% | barra cresce 0→100% | URL glitch
 *   Fase 2 (2.3 – 2.7s) padrão de pílulas pretas irrompe cobrindo a tela
 *   Fase 3 (2.7 – 3.5s) ruído se contrai e revela a silhueta "DRB"
 *   Fase 4 (3.5 – 4.3s) padrão dissolve; letras pretas limpas sobre paper
 *   Fase 5 (4.3 – 5.2s) scan vertical dourado varre o logo
 *   Fase 6 (5.2s)       dispara o flip 3D — quem rotaciona é o wrapper externo
 *
 * Paleta: preto #050505 · off-white #f2ede3 · dourado #c9a24b / #e6c277
 */
export default function Loader3D({
  onRequestFlip,
}: {
  onRequestFlip: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // fase 1
  const barRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  // fase 2+
  const noiseRef = useRef<SVGGElement>(null);         // pílulas de ruído extras
  const patternFillRef = useRef<SVGRectElement>(null); // retângulo fullscreen com pattern
  const logoGroupRef = useRef<SVGGElement>(null);      // grupo das letras reveladas
  const cleanLogoRef = useRef<SVGGElement>(null);     // grupo do logo limpo preto
  const scanRef = useRef<SVGGElement>(null);           // barra de scan dourada

  const [pct, setPct] = useState(0);
  const [urlFrag, setUrlFrag] = useState(
    "HTTPS://DRBLACKSKINS.COM/KPC0/KAI-14/REACTOR/ISOTOPE-8/404HZ"
  );

  // gera pílulas de ruído extra (fase 2 densa → 3 esparsa)
  // posições fixas (não randomizadas a cada render) pra não vibrar feio
  const noisePills = useMemo<{ x: number; y: number; h: number }[]>(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        // pseudo-random determinístico
        const s = Math.sin(i * 91.37) * 10000;
        const rx = Math.abs(s - Math.floor(s));
        const s2 = Math.sin(i * 47.91) * 10000;
        const ry = Math.abs(s2 - Math.floor(s2));
        const s3 = Math.sin(i * 13.17) * 10000;
        const rh = Math.abs(s3 - Math.floor(s3));
        return {
          x: rx * 1900,
          y: ry * 960,
          h: 28 + rh * 70,
        };
      }),
    []
  );

  // URL rotativa
  useEffect(() => {
    const urls = [
      "HTTPS://DRBLACKSKINS.COM/KPC0/KAI-14/REACTOR/ISOTOPE-8/404HZ",
      "HTTPS://DRBLACKSKINS.COM/KPC0/AREA-SCAN/A/SE_436092",
      "HTTPS://DRBLACKSKINS.COM/SYS/BOOT/AUTH/SESSION-0x4F",
      "HTTPS://DRBLACKSKINS.COM/MARKET/LIVE/BID/OPEN-STREAM",
      "HTTPS://DRBLACKSKINS.COM/VAULT/KNIFE-CACHE/INDEX/71F",
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % urls.length;
      setUrlFrag(urls[i]);
    }, 380);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const counter = { v: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          // logo está grande, estável, scan já passou → dispara o flip 3D
          onRequestFlip();
        },
      });

      // ─── FASE 1: loading bar ──────────────────────────────────
      tl.to(counter, {
        v: 100,
        duration: 2.3,
        ease: "power1.inOut",
        onUpdate: () => setPct(Math.round(counter.v)),
      });
      tl.to(
        barRef.current,
        { width: "100%", duration: 2.3, ease: "power1.inOut" },
        "<"
      );

      // ─── FASE 2: pill-pattern irrompe ────────────────────────
      tl.to(topBarRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      }, "+=0.1");

      // ruído denso aparece
      tl.fromTo(
        noiseRef.current,
        { opacity: 0, scale: 0.92, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" },
        "<"
      );
      tl.fromTo(
        patternFillRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power3.out" },
        "<"
      );

      // ─── FASE 3: logo recortado emerge ──────────────────────
      tl.fromTo(
        logoGroupRef.current,
        { opacity: 0, scale: 0.88, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        "+=0.15"
      );

      // ruído começa a recuar
      tl.to(
        noiseRef.current,
        { opacity: 0.35, duration: 0.6, ease: "power2.inOut" },
        "<0.2"
      );

      // ─── FASE 4: limpa tudo e entra logo preto puro ─────────
      tl.to(
        [noiseRef.current, patternFillRef.current, logoGroupRef.current],
        { opacity: 0, duration: 0.5, ease: "power2.inOut" },
        "+=0.25"
      );
      tl.fromTo(
        cleanLogoRef.current,
        { opacity: 0, scale: 0.96, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
        "<0.1"
      );
      // micro-bump do logo
      tl.to(cleanLogoRef.current, {
        scale: 1.03,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
      });

      // ─── FASE 5: scan dourado ───────────────────────────────
      tl.fromTo(
        scanRef.current,
        { x: -400, opacity: 0 },
        { x: 1600, opacity: 1, duration: 0.9, ease: "power2.inOut" },
        "+=0.1"
      );
      tl.to(scanRef.current, { opacity: 0, duration: 0.2 }, "-=0.15");

      // ─── FASE 6: hold curto com o logo grande estável ───────
      // (antes do flip 3D do wrapper externo)
      tl.to({}, { duration: 0.35 });

      // leve pump final pra "respirar" no momento do flip
      tl.to(cleanLogoRef.current, {
        scale: 1.06,
        duration: 0.45,
        ease: "power2.in",
        transformOrigin: "50% 50%",
      });
    }, rootRef);

    return () => ctx.revert();
  }, [onRequestFlip]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-50 overflow-hidden"
      style={{
        background: "var(--paper)",
        fontFamily: "var(--font-oswald), sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ============ UI DE TOPO (fase 1) ============ */}
      <div ref={topBarRef} className="absolute inset-0 pointer-events-none">
        {/* círculo "click to enable sound" */}
        <div
          className="absolute top-6 right-8 flex flex-col items-center gap-1 text-[9px] tracking-[0.25em] uppercase"
          style={{ color: "rgba(10,10,10,0.75)" }}
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-[10px]"
            style={{ border: "1px solid rgba(10,10,10,0.55)" }}
          >
            ►
          </span>
          <span className="mt-1">Click to enable sound</span>
        </div>

        {/* decor laterais */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "rgba(10,10,10,0.6)" }}
        >
          +
        </div>
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "rgba(10,10,10,0.6)" }}
        >
          |
        </div>

        {/* barra + URL */}
        <div
          className="absolute left-0 right-0 flex items-center gap-6 px-[6vw] text-[11px] tracking-[0.25em] uppercase font-mono"
          style={{ top: "62%", color: "rgba(10,10,10,0.9)" }}
        >
          <span className="shrink-0 whitespace-nowrap">» LOADING – {pct}%</span>

          <div
            className="relative flex-1 h-[1px]"
            style={{ background: "rgba(10,10,10,0.15)" }}
          >
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 w-0"
              style={{ background: "rgba(10,10,10,0.9)", height: "1px" }}
            />
          </div>

          <span className="shrink-0 truncate max-w-[42%]">{urlFrag}</span>
        </div>
      </div>

      {/* ============ SVG principal (fases 2+) ============ */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1900 960"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* padrão de pílulas pretas verticais */}
          <pattern
            id="pillPattern"
            x="0"
            y="0"
            width="44"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="14"
              y="8"
              width="16"
              height="80"
              rx="8"
              ry="8"
              fill="#0a0a0a"
            />
          </pattern>

          {/* máscara: "DR BLACK SKINS" em duas linhas funciona como "buracos" */}
          <mask id="logoMask">
            <rect x="0" y="0" width="1900" height="960" fill="white" />
            <text
              x="950"
              y="420"
              textAnchor="middle"
              fill="black"
              style={{
                fontFamily: "var(--font-oswald), sans-serif",
                fontWeight: 700,
                fontSize: "220px",
                letterSpacing: "-0.02em",
              }}
            >
              DR BLACK
            </text>
            <text
              x="950"
              y="640"
              textAnchor="middle"
              fill="black"
              style={{
                fontFamily: "var(--font-oswald), sans-serif",
                fontWeight: 700,
                fontSize: "220px",
                letterSpacing: "-0.02em",
              }}
            >
              SKINS
            </text>
          </mask>

          {/* faixa dourada metálica com xadrez pro scan */}
          <linearGradient id="goldStripe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="15%" stopColor="#8a6d2c" />
            <stop offset="45%" stopColor="#e6c277" />
            <stop offset="55%" stopColor="#c9a24b" />
            <stop offset="85%" stopColor="#8a6d2c" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <pattern
            id="checkerPattern"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="12" height="12" fill="#f2ede3" />
            <rect x="12" y="12" width="12" height="12" fill="#f2ede3" />
            <rect x="12" y="0" width="12" height="12" fill="#0a0a0a" />
            <rect x="0" y="12" width="12" height="12" fill="#0a0a0a" />
          </pattern>
        </defs>

        {/* 1) retângulo fullscreen preenchido com padrão de pílulas, mascarado pelas letras
              (o que fica visível são as letras "recortadas" em pílulas) */}
        <rect
          ref={patternFillRef}
          x="0"
          y="0"
          width="1900"
          height="960"
          fill="url(#pillPattern)"
          opacity="0"
          style={{ mixBlendMode: "normal" }}
        />

        {/* 2) ruído — pílulas extras espalhadas pra criar a sensação caótica do frame 12 */}
        <g ref={noiseRef} opacity="0">
          {noisePills.map((p, i) => (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width={14}
              height={p.h}
              rx={7}
              ry={7}
              fill="#0a0a0a"
            />
          ))}
        </g>

        {/* 3) grupo do logo "recortado" — letras feitas do padrão de pílulas */}
        <g ref={logoGroupRef} opacity="0">
          <text
            x="950"
            y="420"
            textAnchor="middle"
            fill="url(#pillPattern)"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: "220px",
              letterSpacing: "-0.02em",
            }}
          >
            DR BLACK
          </text>
          <text
            x="950"
            y="640"
            textAnchor="middle"
            fill="url(#pillPattern)"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: "220px",
              letterSpacing: "-0.02em",
            }}
          >
            SKINS
          </text>
        </g>

        {/* 4) logo limpo preto (fase 4) — duas linhas, ref no grupo */}
        <g ref={cleanLogoRef} opacity="0">
          <text
            x="950"
            y="420"
            textAnchor="middle"
            fill="#0a0a0a"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: "220px",
              letterSpacing: "-0.02em",
            }}
          >
            DR BLACK
          </text>
          <text
            x="950"
            y="640"
            textAnchor="middle"
            fill="#0a0a0a"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: "220px",
              letterSpacing: "-0.02em",
            }}
          >
            SKINS
          </text>
        </g>

        {/* 5) scan dourado com xadrez atrás */}
        <g ref={scanRef} opacity="0">
          {/* xadrez (aparece por trás da faixa, efeito "glitch") */}
          <rect
            x="0"
            y="0"
            width="90"
            height="960"
            fill="url(#checkerPattern)"
            opacity="0.65"
          />
          {/* faixa dourada principal */}
          <rect
            x="30"
            y="0"
            width="30"
            height="960"
            fill="url(#goldStripe)"
          />
          {/* brilho central */}
          <rect
            x="42"
            y="0"
            width="6"
            height="960"
            fill="#e6c277"
            opacity="0.8"
          />
        </g>

      </svg>

      {/* marca pequena no rodapé */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase pointer-events-none"
        style={{ color: "rgba(10,10,10,0.5)", fontFamily: "inherit" }}
      >
        DR BLACK SKINS · PREMIUM CS2
      </div>
    </div>
  );
}
