"use client";

import { useState } from "react";
import Loader3D from "@/components/Loader3D";
import Hero from "@/components/hero";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";
import Dragon3D from "@/components/Dragon3D";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflowX: "hidden",
        background: "var(--background)",
      }}
    >
      <a
        href="#pos-galeria-scroll"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:border focus:border-[var(--accent)] focus:bg-[var(--background-raised)] focus:px-4 focus:py-2 focus:text-[11px] focus:font-semibold focus:tracking-[0.2em] focus:text-[var(--highlight)] focus:outline-none"
      >
        Pular animação da galeria
      </a>
      <div
        id="hero-mercado"
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        <Hero loading={!revealed} />
      </div>

      <Loader3D onRequestFlip={() => setRevealed(true)} />

      <div id="pos-galeria-scroll" className="scroll-mt-4">
        {revealed ? <ScrollDrivenHeroGallery /> : null}
      </div>
      {revealed ? <Dragon3D /> : null}
    </div>
  );
}
