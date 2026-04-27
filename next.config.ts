import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Next 16 limita `quality` à lista declarada (default `[75]`). Sem isto, o
     * runtime ignora `quality={95}` e cai para 75 — perde-se nitidez nos
     * cards do carrossel (`card1.jpg`, `knife.png`, etc.) que precisam ler em HD
     * mesmo escalados em fullscreen.
     */
    qualities: [70, 75, 90, 95, 100],
  },
};

export default nextConfig;
