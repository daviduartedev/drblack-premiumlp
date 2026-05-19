import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";
import "./mobile.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DR Black Skins | Skins de CS2, rifa, direto",
  description:
    "Seu ponto de skins e rifas. Compra, venda, concorra, sem enrolacao.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

/**
 * Viewport mobile-first com `viewport-fit=cover` para que o `env(safe-area-inset-*)`
 * funcione nos iPhones com notch/dynamic island. `themeColor` casa com a paleta da
 * marca para a barra de URL do Safari/Chrome mobile.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        {/* Banner de consentimento LGPD — aparece em todas as páginas
            na primeira visita. */}
        <CookieBanner />
      </body>
    </html>
  );
}
