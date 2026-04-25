"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

/**
 * Scroll-linked frame scrub. Receives a normalized progress 0..1 and renders
 * the matching frame from `/animacao-frames/frame_001.jpg` ..
 * `frame_<lastIndex>.jpg`.
 *
 * Uses a double <img> buffer with z-index swap-on-decode to avoid the white
 * flash that affects naive single-img scrubs (KPR-style).
 */
export type ScrollFilmFramesProps = {
  progress: number;
  /** First file index to show (1-based). */
  firstIndex?: number;
  /** Last file index to show (1-based, inclusive). */
  lastIndex?: number;
  /** Total scroll-step granularity. Defaults to (lastIndex - firstIndex + 1). */
  steps?: number;
  fallbackColor?: string;
  className?: string;
};

function frameJpegUrl(fileIndex: number) {
  return `/animacao-frames/frame_${String(fileIndex).padStart(3, "0")}.jpg`;
}

export default function ScrollFilmFrames({
  progress,
  firstIndex = 1,
  lastIndex = 101,
  steps,
  fallbackColor = "#0a0a0a",
  className,
}: ScrollFilmFramesProps) {
  const totalFiles = Math.max(1, lastIndex - firstIndex + 1);
  const stepCount = steps ?? totalFiles;

  const fileIndex = useMemo(() => {
    const t = Math.min(1, Math.max(0, progress));
    const stepped = Math.min(
      stepCount - 1,
      Math.max(0, Math.floor(t * stepCount * (1 - 1e-9)))
    );
    if (totalFiles === 1) return firstIndex;
    const mapped =
      firstIndex +
      Math.round((stepped * (totalFiles - 1)) / (stepCount - 1 || 1));
    return Math.min(lastIndex, Math.max(firstIndex, mapped));
  }, [progress, stepCount, totalFiles, firstIndex, lastIndex]);

  // Pre-warm cache so subsequent decodes are instantaneous.
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = firstIndex; i <= lastIndex; i++) {
      const img = document.createElement("img");
      img.decoding = "async";
      img.src = frameJpegUrl(i);
      imgs.push(img);
    }
    return () => {
      imgs.forEach((img) => {
        img.src = "";
      });
    };
  }, [firstIndex, lastIndex]);

  const url = useMemo(() => frameJpegUrl(fileIndex), [fileIndex]);

  const aRef = useRef<HTMLImageElement | null>(null);
  const bRef = useRef<HTMLImageElement | null>(null);
  const frontIsA = useRef(true);
  const initRef = useRef(false);
  const lastApplied = useRef<string | null>(null);
  const loadGen = useRef(0);

  useLayoutEffect(() => {
    if (lastApplied.current === url) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    if (!initRef.current) {
      a.src = url;
      b.src = url;
      a.style.zIndex = "2";
      b.style.zIndex = "1";
      a.style.opacity = "1";
      b.style.opacity = "1";
      void a.decode?.().catch(() => undefined);
      initRef.current = true;
      lastApplied.current = url;
      return;
    }

    const gen = ++loadGen.current;
    const useAOnTop = frontIsA.current;
    const elUnder = useAOnTop ? b : a;
    const elOver = useAOnTop ? a : b;

    elUnder.src = url;
    const finalize = () => {
      if (gen !== loadGen.current) return;
      elUnder.style.zIndex = "2";
      elOver.style.zIndex = "1";
      frontIsA.current = elUnder === a;
      lastApplied.current = url;
    };

    if (elUnder.decode) {
      elUnder
        .decode()
        .then(() => requestAnimationFrame(finalize))
        .catch(() => {
          elUnder.addEventListener(
            "load",
            () => requestAnimationFrame(finalize),
            { once: true }
          );
        });
    } else if (elUnder.complete && elUnder.naturalWidth) {
      requestAnimationFrame(finalize);
    } else {
      elUnder.addEventListener(
        "load",
        () => requestAnimationFrame(finalize),
        { once: true }
      );
    }
  }, [url]);

  const base: React.CSSProperties = {
    transform: "scale(1.04)",
    backgroundColor: fallbackColor,
    willChange: "auto",
  };

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: fallbackColor,
        isolation: "isolate",
      }}
      aria-hidden
    >
      <img
        ref={aRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        style={{ ...base, zIndex: 2 }}
        decoding="async"
        draggable={false}
      />
      <img
        ref={bRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        style={{ ...base, zIndex: 1 }}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
