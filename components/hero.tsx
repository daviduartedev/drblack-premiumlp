"use client";

import { motion } from "framer-motion";
import ScrollDrivenHeroGallery from "@/components/ScrollDrivenHeroGallery";

/**
 * Hero — Dr. Black Skins (loja premium de skins CS2)
 * Paleta: preto + dourado + off-white.
 */
export default function Hero({ loading }: { loading: boolean }) {
  const show = !loading;

  // Enquanto o loader não terminou o flip, mantemos a hero estática.
  // Assim evitamos inicializar ScrollTrigger/WebGL “por trás” da face do loader.
  if (!show) {
    return (
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {/* base preta profunda com leve gradiente */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 30% 30%, #1a1306 0%, #0b0904 45%, #050505 80%, #000 100%)",
          }}
        />
      </section>
    );
  }

  const headline = ["COMPRE.", "VENDA.", "CONCORRA."];

  return (
    <section className="w-full">
      {/* Topo/branding e primeira impressão (mantém estilo atual) */}
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
      {/* ========== BACKGROUND em camadas ========== */}
      {/* base preta profunda com leve gradiente */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 30%, #1a1306 0%, #0b0904 45%, #050505 80%, #000 100%)",
        }}
      />
      {/* halo dourado quente (spotlight premium) */}
      <div
        aria-hidden
        className="absolute -right-[10%] top-[5%] w-[70%] h-[80%] opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(230,194,119,0.55), rgba(201,162,75,0.18) 45%, transparent 75%)",
        }}
      />
      {/* bronze quente à esquerda/baixo */}
      <div
        aria-hidden
        className="absolute -left-[10%] bottom-[-20%] w-[70%] h-[70%] opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(138,109,44,0.55), transparent 70%)",
        }}
      />
      {/* grid dourado sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #c9a24b 1px, transparent 1px), linear-gradient(to bottom, #c9a24b 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* vinheta nas bordas */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ========== NAV TOPO ========== */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : -12 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex items-center justify-between px-[5vw] py-6 text-[11px] tracking-[0.28em] uppercase"
      >
        <div
          className="font-bold text-sm tracking-[0.2em]"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          DR<span style={{ color: "var(--accent)" }}>·</span>BLACK
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <ul
          className="hidden md:flex items-center gap-10"
          style={{ color: "var(--muted)" }}
        >
          <li className="hover:text-[var(--accent-soft)] cursor-pointer transition">
            Mercado
          </li>
          <li className="hover:text-[var(--accent-soft)] cursor-pointer transition">
            Leilões
          </li>
          <li className="hover:text-[var(--accent-soft)] cursor-pointer transition">
            Coleções
          </li>
          <li className="hover:text-[var(--accent-soft)] cursor-pointer transition">
            Sobre
          </li>
        </ul>

        <button
          className="px-4 py-2 text-[10px] tracking-[0.3em] transition"
          style={{
            border: "1px solid var(--accent)",
            color: "var(--accent-soft)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--accent-soft)";
          }}
        >
          SIGN IN
        </button>
      </motion.nav>

      {/* ========== COLUNA ESQUERDA (descrição) ========== */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: show ? 1 : 0, x: show ? 0 : -20 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="relative z-10 mt-12 md:mt-16 px-[5vw] max-w-md text-[13px] leading-relaxed"
        style={{ color: "rgba(242,237,227,0.78)" }}
      >
        <p
          className="mb-2 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--accent)" }}
        >
          DR BLACK SKINS · CS2 PREMIUM
        </p>
        <p>
          A loja premium de skins de CS2. Negocie os itens mais raros do cenário
          com verificação de autenticidade, leilões ao vivo e curadoria
          especializada — tudo em um só lugar.
        </p>
      </motion.div>

      {/* ========== HEADLINE GIGANTE ========== */}
      <div className="relative z-10 px-[5vw] mt-[6vh] md:mt-[10vh] select-none">
        <h1
          style={{
            fontFamily: "var(--font-oswald), sans-serif",
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: "-0.02em",
            fontSize: "clamp(64px, 12vw, 200px)",
            color: "var(--foreground)",
          }}
        >
          {headline.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{
                opacity: show ? 1 : 0,
                y: show ? 0 : 40,
                scale: show ? 1 : 0.96,
              }}
              transition={{
                duration: 0.8,
                delay: 0.7 + i * 0.15,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className="block"
              // destaca a última palavra em dourado
              style={
                i === headline.length - 1
                  ? {
                      background:
                        "linear-gradient(90deg, #8a6d2c 0%, #c9a24b 40%, #e6c277 55%, #c9a24b 70%, #8a6d2c 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : undefined
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>
      </div>

      {/* ========== RODAPÉ DISCRETO ========== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute bottom-6 left-[5vw] right-[5vw] z-10 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        <span>© 2026 · DR BLACK SKINS</span>
        <span className="hidden md:inline">
          SCROLL <span className="ml-2">↓</span>
        </span>
        <span style={{ color: "var(--accent-soft)" }}>
          LIVE MARKET · ONLINE
        </span>
      </motion.div>
      </section>

      {/* Hero + seção seguinte em narrativa scroll-driven (KPR-like) */}
      <ScrollDrivenHeroGallery />
    </section>
  );
}
