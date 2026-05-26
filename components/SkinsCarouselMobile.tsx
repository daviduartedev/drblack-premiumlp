"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { FeaturedSkin } from "@/components/SkinsCarousel";

type Props = {
  skins: FeaturedSkin[];
};

/**
 * Carrossel mobile contínuo (marquee).
 *
 * - Diferente do desktop, não há scroll manual: a faixa anda sozinha em loop.
 * - Cards otimizados para mobile: imagem grande no topo, info compacta abaixo.
 * - Pausa em :hover/active para permitir toque no card.
 * - Respeita prefers-reduced-motion (CSS abaixo) — sem animação.
 * - Duplicamos a lista 2x para o loop contínuo sem "salto".
 */
export default function SkinsCarouselMobile({ skins }: Props) {
  return (
    <div className="md:hidden">
      <div
        className="skins-mobile-marquee"
        style={
          ({
            "--skins-mobile-marquee-duration": "32s",
            "--skins-mobile-marquee-gap": "14px",
          } as CSSProperties)
        }
      >
        <div className="skins-mobile-marquee-track">
          {(skins.length > 1 ? [...skins, ...skins] : skins).map((skin, index) => (
            <SkinMobileCard
              key={`${skin.id}-${index}`}
              skin={skin}
              duplicate={skins.length > 1 && index >= skins.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkinMobileCard({
  skin,
  duplicate = false,
}: {
  skin: FeaturedSkin;
  duplicate?: boolean;
}) {
  const cardInner = (
    <>
      <div className="skins-mobile-image-wrap">
        <Image
          src={skin.src}
          alt={duplicate ? "" : `${skin.title}, imagem ilustrativa`}
          fill
          sizes="(max-width: 767px) 70vw, 260px"
          className="object-cover"
          quality={86}
        />
      </div>

      <div className="mt-4 min-w-0">
        <p className="skins-mobile-index">{skin.index}</p>
        <h3 className="skins-mobile-title">{skin.title}</h3>
        <p className="skins-mobile-subtitle">{skin.subtitle}</p>
        {skin.price ? (
          <p className="skins-mobile-price">{skin.price}</p>
        ) : null}
      </div>
    </>
  );

  if (duplicate) {
    return (
      <div
        className="skins-mobile-card skins-mobile-card-duplicate"
        aria-hidden
      >
        {cardInner}
      </div>
    );
  }

  return (
    <a
      href={skin.href ?? "/loja"}
      className="skins-mobile-card skin-card-link"
    >
      {cardInner}
    </a>
  );
}
