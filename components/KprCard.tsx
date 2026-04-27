"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, forwardRef } from "react";

/**
 * Card uniforme do carrossel "SKINS NO PONTO".
 *
 * Shape (referência KPR — sticker/badge orgânico):
 *  - Aspect-ratio 16:9
 *  - Cantos largamente arredondados
 *  - Recorte subtil no lado esquerdo (miolo)
 *  - Canto inferior-direito com tratamento próprio (sem "mordida" agressiva)
 *
 * Implementação: clip-path: url(#kpr-card-shape) referenciando um
 * <clipPath clipPathUnits="objectBoundingBox"> injetado uma unica vez via
 * <KprCardClipDefs /> no app/layout. O path e definido em coordenadas
 * normalizadas (0..1) — escala automaticamente com qualquer tamanho.
 *
 * Referência visual desta calibragem (cycle 0004):
 * `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png`
 */
export const KPR_CARD_CLIP_ID = "kpr-card-shape";

/**
 * Shape dos cards (cycle 0004 refinado por feedback):
 * Baseado em path manual fornecido pelo usuário:
 * M24,0 H276 Q300,0 300,24 V240 L240,300 H24 Q0,300 0,276 V24 Q0,0 24,0 Z
 * (normalizado para objectBoundingBox 0..1)
 */
export const KPR_CARD_PATH =
  "M 0.08 0 " +
  "H 0.92 " +
  "Q 1 0 1 0.08 " +
  "V 0.8 " +
  "L 0.8 1 " +
  "H 0.08 " +
  "Q 0 1 0 0.92 " +
  "V 0.08 " +
  "Q 0 0 0.08 0 " +
  "Z";

export function KprCardClipDefs() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        <clipPath id={KPR_CARD_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={KPR_CARD_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

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
        backgroundColor: "#120f0c",
        clipPath: `url(#${KPR_CARD_CLIP_ID})`,
        WebkitClipPath: `url(#${KPR_CARD_CLIP_ID})`,
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
            className="text-[10px] tracking-[0.32em] uppercase"
            style={{ color: "rgba(238,217,196,0.94)" }}
          >
            {index}
          </span>
        </div>
      ) : null}

      {!hideLabels && (title || subtitle) ? (
        <div className="absolute bottom-5 left-5 right-5 z-[2]">
          {title ? (
            <div
              className="text-[16px] font-semibold tracking-tight"
              style={{ color: "rgba(255,255,255,0.97)" }}
            >
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div
              className="text-[10px] tracking-[0.22em] uppercase mt-1"
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
