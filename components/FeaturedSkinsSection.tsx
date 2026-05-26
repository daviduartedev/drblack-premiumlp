import { formatBRL } from "@/lib/profit-calculator";
import { getFeaturedStoreSkins } from "@/lib/ruby-safira-repository";
import SkinsCarousel, { type FeaturedSkin } from "@/components/SkinsCarousel";

export default async function FeaturedSkinsSection() {
  const skins = await getFeaturedStoreSkins();
  const featured: FeaturedSkin[] = skins.map((skin, index) => ({
    id: skin.id,
    src: skin.imageUrl,
    index: `${String(index + 1).padStart(2, "0")} · ${skin.weapon.toUpperCase()}`,
    title: skin.name,
    subtitle: skin.wearLabel,
    price: formatBRL(skin.listPrice),
    href: "/loja",
  }));

  return <SkinsCarousel skins={featured} />;
}
