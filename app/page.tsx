"use client";

import { useCallback, useEffect, useState } from "react";
import Loader3D from "@/components/Loader3D";
import Hero from "@/components/hero";
import PostLoginWelcomeModal from "@/components/PostLoginWelcomeModal";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";
import SkinsCarousel from "@/components/SkinsCarousel";
import Footer from "@/components/Footer";

function HomeContent() {
  const [revealed, setRevealed] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  /** Fechamento apenas nesta permanência na página; novo carregamento da LP volta a mostrar */
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  /** Depois que o loader termina, a hero está acessível — popup em toda visita à LP */
  const showHeroWelcome = revealed && loaderDone && !welcomeDismissed;

  const closeWelcome = useCallback(() => {
    setWelcomeDismissed(true);
  }, []);

  const handleRequestFlip = useCallback(() => setRevealed(true), []);
  const handleLoaderComplete = useCallback(() => setLoaderDone(true), []);

  /** Depois do loader: alinhar topo da página à viewport (pin da galeria pode mexer em scroll ao montar). */
  useEffect(() => {
    if (!revealed) return;
    const scrollTop = () =>
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scrollTop();
    const t0 = window.setTimeout(scrollTop, 0);
    const t1 = window.setTimeout(scrollTop, 120);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [revealed]);

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
          <Hero loading={!revealed} />
        </div>

        <Loader3D
          onRequestFlip={handleRequestFlip}
          onLoaderComplete={handleLoaderComplete}
        />

        <div id="pos-galeria-scroll" className="scroll-mt-4">
          {revealed ? <ScrollDrivenHeroGallery /> : null}
        </div>

        {/* Skins em destaque — só monta após o reveal para não competir com o GSAP. */}
        {revealed ? <SkinsCarousel /> : null}

        <Footer />

        {showHeroWelcome ? (
          <PostLoginWelcomeModal onClose={closeWelcome} />
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
