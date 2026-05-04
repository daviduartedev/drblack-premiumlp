"use client";

import { useCallback, useEffect, useState } from "react";
import Hero from "@/components/hero";
import MobileOnboardingCarousel from "@/components/MobileOnboardingCarousel";
import PostLoginWelcomeModal from "@/components/PostLoginWelcomeModal";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";
import SkinsCarousel from "@/components/SkinsCarousel";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

function HomeContent() {
  /**
   * Detecta mobile no primeiro paint client-side.
   * Usado para condicionar:
   *  - PostLoginWelcomeModal (popup) — apenas desktop.
   *  - MobileOnboardingCarousel (tela fullscreen 3 vídeos) — apenas mobile.
   */
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  /** Fechamento apenas nesta permanência na página; novo carregamento da LP volta a mostrar. */
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Popup APENAS no desktop. */
  const showHeroWelcome = isMobile === false && !welcomeDismissed;

  /** Tela onboarding APENAS no mobile. */
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
          {/* Hero aparece direto — sem loader. `loading={false}` mantém o contrato
              do componente: as animações de entrada (motion) usam `show=true`. */}
          <Hero loading={false} />
        </div>

        <div id="pos-galeria-scroll" className="scroll-mt-4">
          <ScrollDrivenHeroGallery />
        </div>

        {/* Depoimentos da comunidade — vem ANTES do carrossel agora. */}
        <Testimonials />

        {/* Skins em destaque. */}
        <SkinsCarousel />

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

export default function Home() {
  return <HomeContent />;
}
