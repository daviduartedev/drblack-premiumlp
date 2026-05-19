import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MessageCircle, Ticket } from "lucide-react";
import { formatBRL } from "@/lib/profit-calculator";
import { getPublicRaffles } from "@/lib/ruby-safira-repository";
import type { RaffleStatus } from "@/lib/ruby-safira-types";

const WHATSAPP_URL =
  "https://wa.me/5511999999999?text=Quero%20participar%20das%20rifas%20da%20DR%20Black%20Skins";

const STATUS_LABEL: Record<RaffleStatus, string> = {
  ativa: "Ativa",
  encerrada: "Encerrada",
  ganha: "Ganha",
  perdida: "Perdida",
  aguardando_sorteio: "Aguardando sorteio",
};

export const metadata: Metadata = {
  title: "Rifas | DR Black Skins",
  description:
    "Rifas de skins CS2 da DR Black Skins. Por enquanto, toda participacao acontece pelo WhatsApp.",
};

export default async function RifasPage() {
  const raffles = await getPublicRaffles();
  const activeRaffles = raffles.filter((raffle) => raffle.status === "ativa");
  const displayRaffles = activeRaffles.length ? activeRaffles : raffles;

  return (
    <main className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative isolate overflow-hidden section-padding">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 48% at 18% 12%, rgba(180,16,58,0.28), transparent 66%), radial-gradient(48% 44% at 82% 8%, rgba(91,168,255,0.22), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent 46%)",
          }}
        />

        <div className="content-wrap">
          <div className="flex flex-col gap-[var(--space-5)] md:flex-row md:items-end md:justify-between">
            <div>
              <Link href="/" className="footer-link t-body-sm">
                Voltar ao inicio
              </Link>
              <p className="t-eyebrow mt-[var(--space-5)]">Rifas ao vivo</p>
              <h1 className="t-h2 mt-[var(--space-3)] max-w-[11ch] text-[var(--foreground)]">
                Bilhete no WhatsApp.
              </h1>
              <p className="t-body mt-[var(--space-4)] max-w-[58ch]">
                A vitrine fica aqui. Por enquanto, reserva, pagamento e suporte
                das rifas acontecem direto no WhatsApp.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid t-cta gap-2"
            >
              <MessageCircle size={16} />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="overflow-hidden pb-[var(--section-py)]">
        <div
          className="skins-marquee-mask"
          style={
            {
              "--skins-marquee-duration": "44s",
              "--skins-marquee-gap": "20px",
            } as CSSProperties
          }
        >
          <div className="skins-marquee-track">
            {[...displayRaffles, ...displayRaffles].map((raffle, index) => (
              <RaffleCard
                key={`${raffle.id}-${index}`}
                raffle={raffle}
                duplicate={index >= displayRaffles.length}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function RaffleCard({
  raffle,
  duplicate,
}: {
  raffle: Awaited<ReturnType<typeof getPublicRaffles>>[number];
  duplicate: boolean;
}) {
  const progress = Math.min(
    100,
    Math.round((raffle.soldTickets / raffle.ticketCount) * 100)
  );

  return (
    <article
      aria-hidden={duplicate || undefined}
      className="relative flex w-[min(420px,88vw)] shrink-0 flex-col overflow-hidden rounded-[8px] border border-white/10 bg-[var(--background-raised)]"
      style={{
        boxShadow:
          "0 28px 70px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/35">
        <Image
          src={raffle.skinImage}
          alt={duplicate ? "" : raffle.skinName}
          fill
          sizes="(max-width: 768px) 88vw, 420px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.78)), radial-gradient(60% 60% at 80% 15%, rgba(91,168,255,0.18), transparent 60%)",
          }}
        />
        <span className="absolute left-4 top-4 rounded-full border border-[rgba(91,168,255,0.36)] bg-black/55 px-3 py-1 t-card-sub">
          {STATUS_LABEL[raffle.status]}
        </span>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <p className="t-card-sub">{raffle.rarity}</p>
          <h2 className="t-h3 mt-2 text-[var(--foreground)]">
            {raffle.skinName}
          </h2>
          <p className="t-body-sm mt-2">{raffle.title}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Mini label="Bilhete" value={formatBRL(raffle.ticketPrice)} />
          <Mini label="Total" value={String(raffle.ticketCount)} />
          <Mini label="Vendidos" value={`${progress}%`} />
        </div>

        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, rgba(180,16,58,0.95), rgba(91,168,255,0.95))",
              }}
            />
          </div>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-solid t-cta gap-2"
        >
          <Ticket size={15} />
          Reservar bilhete
        </a>
      </div>
    </article>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/25 p-3">
      <p className="t-card-sub">{label}</p>
      <p className="t-card-title mt-1">{value}</p>
    </div>
  );
}
