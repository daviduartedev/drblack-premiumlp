"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, forwardRef } from "react";

/**
 * Card uniforme do carrossel "SKINS NO PONTO".
 *
 * Aspect-ratio 16:9; cantos com raio fixo e subtílio (sem clip-path orgânico).
 */

/** Mesmo valor usado na timeline GSAP (`ScrollDrivenHeroGallery`) para fullscreen/recuo. */
export const KPR_CARD_BORDER_RADIUS = "10px";

export type KprCardProps = {
  src: string;
  alt?: string;
  index?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: CSSProperties;
  overlay?: ReactNode;
  hideLabels?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
};

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
    sizes = "(min-width: 1024px) 28vw, 80vw",
    quality = 95,
    unoptimized = false,
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        backgroundColor: "var(--card-bg, #120f0c)",
        borderRadius: KPR_CARD_BORDER_RADIUS,
        overflow: "hidden",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.08), 0 14px 36px rgba(0,0,0,0.32)",
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
        quality={quality}
        unoptimized={unoptimized}
        className="object-cover"
        style={{ transform: "translateZ(0)" }}
      />

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

      {!hideLabels && index ? (
        <div
          className="absolute z-[3] flex items-center gap-2"
          style={{
            top: "14px",
            left: "14px",
            padding: "6px 12px 6px 10px",
            borderRadius: "10px",
            backgroundColor: "rgba(10,10,10,0.55)",
            border: "1px solid rgba(238,217,196,0.18)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              backgroundColor: "rgba(238,217,196,0.92)",
              borderRadius: 1,
            }}
          />
          <span
            className="t-card-sub"
            style={{ color: "rgba(238,217,196,0.94)" }}
          >
            {index}
          </span>
        </div>
      ) : null}

      {!hideLabels && (title || subtitle) ? (
        <div className="absolute bottom-5 left-5 right-5 z-[2]">
          {title ? <div className="t-card-title">{title}</div> : null}
          {subtitle ? <div className="t-card-sub mt-1">{subtitle}</div> : null}
        </div>
      ) : null}

      {overlay}
    </div>
  );
});

export default KprCard;
