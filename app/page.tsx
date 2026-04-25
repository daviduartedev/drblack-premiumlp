"use client";

import { useRef, useState } from "react";
import Loader3D from "@/components/Loader3D";
import Hero from "@/components/hero";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      <div
        style={{
          height: "100vh",
          width: "100%",
          position: "relative",
          perspective: "1600px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          ref={wrapperRef}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transition: "transform 1.1s cubic-bezier(0.77, 0, 0.175, 1)",
            transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)",
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <Loader3D onRequestFlip={() => setFlipped(true)} />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Hero loading={!flipped} />
          </div>
        </div>
      </div>

      {flipped && <ScrollDrivenHeroGallery />}
    </div>
  );
}
