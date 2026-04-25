"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Loader KPR-style:
 * Fase 1: fundo preto, UI branca, acentos laranja.
 * Fases 2–5: pílulas brancas, logo branco, scan laranja.
 */
export default function Loader3D({
  onRequestFlip,
}: {
  onRequestFlip: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<SVGGElement>(null);
  const patternFillRef = useRef<SVGRectElement>(null);
  const logoGroupRef = useRef<SVGGElement>(null);
  const cleanLogoRef = useRef<SVGGElement>(null);
  const scanRef = useRef<SVGGElement>(null);

  const [pct, setPct] = useState(0);
  const [urlFrag, setUrlFrag] = useState(
    "HTTPS://DRBLACKSKINS.COM/KPC0/KAI-14/REACTOR/ISOTOPE-8/404HZ"
  );

  const noisePills = useMemo<{ x: number; y: number; h: number }[]>(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        let seed = (0x9e3779b9 ^ (i + 1)) >>> 0;
        const rand = () => {
          seed = (seed + 0x6d2b79f5) >>> 0;
          let t = seed;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const rx = rand();
        const ry = rand();
        const rh = rand();
        return {
          x: rx * 1900,
          y: ry * 960,
          h: 28 + rh * 70,
        };
      }),
    []
  );

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
          onRequestFlip();
        },
      });

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

      tl.to(
        topBarRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "+=0.1"
      );

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

      tl.fromTo(
        logoGroupRef.current,
        { opacity: 0, scale: 0.88, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        "+=0.15"
      );

      tl.to(
        noiseRef.current,
        { opacity: 0.35, duration: 0.6, ease: "power2.inOut" },
        "<0.2"
      );

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
      tl.to(cleanLogoRef.current, {
        scale: 1.03,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
      });

      tl.fromTo(
        scanRef.current,
        { x: -400, opacity: 0 },
        { x: 1600, opacity: 1, duration: 0.9, ease: "power2.inOut" },
        "+=0.1"
      );
      tl.to(scanRef.current, { opacity: 0, duration: 0.2 }, "-=0.15");

      tl.to({}, { duration: 0.35 });

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
        background: "var(--background)",
        fontFamily: "var(--font-oswald), sans-serif",
        minHeight: "100vh",
        color: "var(--foreground)",
      }}
    >
      <div ref={topBarRef} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-6 right-8 flex flex-col items-center gap-1 text-[9px] tracking-[0.25em] uppercase"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-[10px]"
            style={{
              border: "1px solid rgba(255,92,10,0.5)",
              color: "#ff5c0a",
            }}
          >
            ►
          </span>
          <span className="mt-1">Click to enable sound</span>
        </div>

        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "rgba(255,92,10,0.7)" }}
        >
          +
        </div>
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "rgba(255,92,10,0.7)" }}
        >
          |
        </div>

        <div
          className="absolute left-0 right-0 flex items-center gap-6 px-[6vw] text-[11px] tracking-[0.25em] uppercase font-mono"
          style={{ top: "62%", color: "rgba(255,255,255,0.9)" }}
        >
          <span className="shrink-0 whitespace-nowrap">
            <span style={{ color: "#ff5c0a" }}>»</span> LOADING –{" "}
            <span style={{ color: "#ff5c0a" }}>{pct}</span>%
          </span>

          <div
            className="relative flex-1 h-[1px]"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 w-0"
              style={{
                background: "#ff5c0a",
                height: "2px",
                top: "-0.5px",
              }}
            />
          </div>

          <span className="shrink-0 truncate max-w-[42%] opacity-80">
            {urlFrag}
          </span>
        </div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1900 960"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
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
              fill="#ffffff"
            />
          </pattern>

          <linearGradient id="accentStripe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="15%" stopColor="#b83d00" />
            <stop offset="45%" stopColor="#ff7a3d" />
            <stop offset="55%" stopColor="#ff5c0a" />
            <stop offset="85%" stopColor="#b83d00" />
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
            <rect x="0" y="0" width="12" height="12" fill="#1a1a1a" />
            <rect x="12" y="12" width="12" height="12" fill="#1a1a1a" />
            <rect x="12" y="0" width="12" height="12" fill="#ffffff" />
            <rect x="0" y="12" width="12" height="12" fill="#ffffff" />
          </pattern>
        </defs>

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
              fill="#ffffff"
            />
          ))}
        </g>

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

        <g ref={cleanLogoRef} opacity="0">
          <text
            x="950"
            y="420"
            textAnchor="middle"
            fill="#ffffff"
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
            fill="#ffffff"
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

        <g ref={scanRef} opacity="0">
          <rect
            x="0"
            y="0"
            width="90"
            height="960"
            fill="url(#checkerPattern)"
            opacity="0.65"
          />
          <rect
            x="30"
            y="0"
            width="30"
            height="960"
            fill="url(#accentStripe)"
          />
          <rect
            x="42"
            y="0"
            width="6"
            height="960"
            fill="#ff7a3d"
            opacity="0.85"
          />
        </g>
      </svg>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase pointer-events-none"
        style={{ fontFamily: "inherit" }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)" }}>DR BLACK SKINS</span>
        <span style={{ color: "rgba(255,255,255,0.35)" }}> · </span>
        <span style={{ color: "#ff5c0a" }}>PREMIUM</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}> CS2</span>
      </div>
    </div>
  );
}
