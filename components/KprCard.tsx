"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, forwardRef } from "react";

/**
 * Card uniforme do carrossel "SKINS NO PONTO".
 *
 * Shape (referência ANIMUS CHARACTER enviada pelo usuário):
 *  - Aspect-ratio 16:9 — bate com o tamanho dos frames (1920x1080) para
 *    preservar HD máximo, sem distorcer.
 *  - Cantos arredondados generosos (28px).
 *  - "Plate" flutuante no canto superior-esquerdo simula o notch onde
 *    fica o label tipo "ANIMUS CHARACTER".
 */
export type KprCardProps = {
  src: string;
  alt?: string;
  index?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: CSSProperties;
  /** Conteudo extra empilhado por cima da imagem (ex: scrubber de frames). */
  overlay?: ReactNode;
  /** Esconde o indice/titulo - usado pelo card hero durante a expansao. */
  hideLabels?: boolean;
  priority?: boolean;
  sizes?: string;
  /**
   * Qualidade JPEG/AVIF do `next/image`. Default 95.
   * Requer que o valor esteja registado em `next.config.ts` → `images.qualities`.
   */
  quality?: number;
  /**
   * Desliga totalmente a otimização — serve o ficheiro original sem
   * recompressão. Usar quando a imagem é exibida em fullscreen e qualquer
   * artefacto de compressão fica visível (ex.: o `card1.jpg` na Fase 0).
   */
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
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid rgba(238,217,196,0.22)",
        boxShadow:
          "0 28px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.05)",
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
