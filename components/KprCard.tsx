"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, forwardRef } from "react";

/**
 * KPR-style card shape: vertical card with asymmetric clipped corner (top-right
 * notch) + rounded outer radius. Inspired by the KPR brand reference.
 *
 * The shape is built with `clip-path` so a single CSS variable controls every
 * card uniformly. Children render inside the clipped area; outline border is
 * an absolute SVG so it still hugs the polygon.
 */
export type KprCardProps = {
  src: string;
  alt?: string;
  index?: string;
  title?: string;
  subtitle?: string;
  /** Tailwind/inline width override. */
  className?: string;
  style?: CSSProperties;
  /** Extra content layered on top (e.g. a film-frame buffer). */
  overlay?: ReactNode;
  /** Hide the standard label/title block — used by the hero card during scrub. */
  hideLabels?: boolean;
  priority?: boolean;
  sizes?: string;
};

const KPR_CLIP =
  "polygon(0 6%, 6% 0, 78% 0, 84% 6%, 100% 6%, 100% 94%, 94% 100%, 22% 100%, 16% 94%, 0 94%)";

const KprCard = forwardRef<HTMLDivElement, KprCardProps>(function KprCard(
  {
    src,
    alt = "",
    index,
    title,
    subtitle,
    className,
    style,
    overlay,
    hideLabels = false,
    priority = false,
    sizes = "(min-width: 1024px) 28vw, 70vw",
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        aspectRatio: "3 / 4",
        backgroundColor: "#120f0c",
        clipPath: KPR_CLIP,
        WebkitClipPath: KPR_CLIP,
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ transform: "scale(1.06)" }}
      />

      {/* Top + bottom gradient veils for legibility. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)",
        }}
      />

      {/* Inner thin border that follows the clip path */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: KPR_CLIP,
          WebkitClipPath: KPR_CLIP,
          boxShadow: "inset 0 0 0 1px rgba(238,217,196,0.22)",
        }}
      />

      {!hideLabels && index ? (
        <div
          className="absolute top-4 left-5 text-[10px] tracking-[0.32em] uppercase z-10"
          style={{ color: "rgba(238,217,196,0.92)" }}
        >
          {index}
        </div>
      ) : null}

      {!hideLabels && (title || subtitle) ? (
        <div className="absolute bottom-5 left-5 right-5 z-10">
          {title ? (
            <div
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: "rgba(255,255,255,0.96)" }}
            >
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div
              className="text-[10px] tracking-[0.18em] uppercase mt-1"
              style={{ color: "rgba(238,217,196,0.78)" }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      ) : null}

      {overlay}
    </div>
  );
});

export default KprCard;
export { KPR_CLIP };
