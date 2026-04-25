"use client";

import { useState } from "react";
import Loader3D from "@/components/Loader3D";
import Hero from "@/components/hero";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";

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
      {/* Hero fica sempre montada por baixo — quando o loader sobe,
          ela aparece sem precisar de flip 3D. */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        <Hero loading={!revealed} />
      </div>

      {/* Loader sobreposto que faz slide-up (y: -100%) ao terminar.
          Esconde completamente a hero até o término da animação. */}
      <Loader3D onRequestFlip={() => setRevealed(true)} />

      {revealed && <ScrollDrivenHeroGallery />}
    </div>
  );
}
