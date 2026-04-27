import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { KprCardClipDefs } from "@/components/KprCard";
import "./globals.css";

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
    "Seu ponto de skins e rifas. Compra, venda, concorra — sem enrolacao.",
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
        {/* clip-path SVG global usado por todos os KprCard (shape KPR) */}
        <KprCardClipDefs />
        {children}
      </body>
    </html>
  );
}
