import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import LojaSkinCard from "@/components/LojaSkinCard";
import { getPublicStoreSkins } from "@/lib/ruby-safira-repository";
import { whatsappStoreEmptyUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Loja | DR Black Skins",
  description:
    "Skins de CS2 disponiveis para venda direta. Veja estoque, float e chame no WhatsApp.",
};

export default async function LojaPage() {
  const skins = await getPublicStoreSkins();

  return (
    <div className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <header className="section-padding-x border-b border-white/10 py-[var(--space-5)]">
        <div className="content-wrap flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="footer-link t-body-sm">
              Voltar ao inicio
            </Link>
            <p className="t-eyebrow mt-[var(--space-4)]">Catalogo</p>
            <h1 className="t-h2 mt-[var(--space-2)]">Loja de skins</h1>
            <p className="t-body mt-3 max-w-[52ch] text-[var(--foreground-muted)]">
              Skins em estoque prontas para venda direta. Sem checkout aqui —
              chama no WhatsApp e a gente fecha contigo.
            </p>
          </div>
        </div>
      </header>

      <main className="section-padding-x section-padding pb-[var(--space-10)]">
        <div className="content-wrap">
          {skins.length ? (
            <ul className="grid auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {skins.map((skin) => (
                <li key={skin.id} className="flex min-h-[520px] sm:min-h-[540px]">
                  <LojaSkinCard skin={skin} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[12px] border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
              <p className="t-body max-w-[42ch] mx-auto">
                Nenhuma skin disponivel no momento. Volte em breve ou chama no
                WhatsApp.
              </p>
              <a
                href={whatsappStoreEmptyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid t-cta mt-6 inline-flex min-h-[44px] items-center justify-center px-6"
              >
                Chamar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
