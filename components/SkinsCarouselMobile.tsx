"use client";

import Image from "next/image";
import type { FeaturedSkin } from "@/components/SkinsCarousel";

type Props = {
  skins: FeaturedSkin[];
};

export default function SkinsCarouselMobile({ skins }: Props) {
  return (
    <div className="md:hidden">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <p
          className="t-eyebrow mb-4"
          style={{ color: "var(--foreground-faint)", letterSpacing: "0.2em" }}
        >
          ARRASTE PARA O LADO
        </p>
      </div>

      <div className="skins-mobile-rail no-scrollbar">
        {skins.map((skin) => (
          <a
            key={skin.id}
            href={skin.href ?? "#"}
            className="skins-mobile-card skin-card-link"
          >
            <div className="skins-mobile-image-wrap">
              <Image
                src={skin.src}
                alt={`${skin.title}, imagem ilustrativa`}
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
              {skin.price ? <p className="skins-mobile-price">{skin.price}</p> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
