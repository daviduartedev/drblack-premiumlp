import FeaturedSkinsSection from "@/components/FeaturedSkinsSection";
import HomePageClient from "@/components/HomePageClient";

export default function Home() {
  return (
    <HomePageClient featuredSection={<FeaturedSkinsSection />} />
  );
}
