"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Hero from "@/components/hero";
import MobileOnboardingCarousel from "@/components/MobileOnboardingCarousel";
import PostLoginWelcomeModal from "@/components/PostLoginWelcomeModal";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function HomePageClient({
  featuredSection,
}: {
  featuredSection: ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const showHeroWelcome = isMobile === false && !welcomeDismissed;
  const showMobileOnboarding = isMobile === true && !welcomeDismissed;

  const closeWelcome = useCallback(() => {
    setWelcomeDismissed(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100svh",
        width: "100%",
        position: "relative",
        overflowX: "hidden",
        background: "var(--background)",
      }}
    >
      <div className="relative z-[1]">
        <a
          href="#pos-galeria-scroll"
          className="skip-gallery-link t-cta sr-only focus:not-sr-only focus:absolute focus:left-[var(--gutter)] focus:top-4 focus:z-[200] focus:rounded focus:border focus:border-[var(--accent)] focus:bg-[var(--background-raised)] focus:px-4 focus:py-2 focus:outline-none"
        >
          Pular animação da galeria
        </a>
        <div
          id="hero-mercado"
          style={{
            minHeight: "100svh",
            width: "100%",
            position: "relative",
          }}
        >
          <Hero loading={false} />
        </div>

        <div id="pos-galeria-scroll" className="scroll-mt-4">
          <ScrollDrivenHeroGallery />
        </div>

        <Testimonials />

        {featuredSection}

        <Footer />

        {showHeroWelcome ? (
          <PostLoginWelcomeModal onClose={closeWelcome} />
        ) : null}

        {showMobileOnboarding ? (
          <MobileOnboardingCarousel onClose={closeWelcome} />
        ) : null}
      </div>
    </div>
  );
}
