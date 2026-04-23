"use client";

import { useRef, useState } from "react";
import Loader3D from "@/components/Loader3D";
import Hero from "@/components/hero";

export default function Home() {
  // "loading" = loader ainda visível na tela (mesmo durante o flip)
  // "flipped" = rotação concluída → hero pode animar a headline
  const [flipped, setFlipped] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        perspective: "1600px",
        perspectiveOrigin: "50% 50%",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 1.1s cubic-bezier(0.77, 0, 0.175, 1)",
          transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)",
          willChange: "transform",
        }}
      >
        {/* FRENTE: loader */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            minHeight: "100vh",
          }}
        >
          <Loader3D onRequestFlip={() => setFlipped(true)} />
        </div>

        {/* VERSO: hero — rotacionado -180° pra ficar "de frente" quando o wrapper virar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            minHeight: "100vh",
          }}
        >
          <Hero loading={!flipped} />
        </div>
      </div>
    </div>
  );
}
