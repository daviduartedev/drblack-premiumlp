import Image from "next/image";
import Link from "next/link";
import { Calculator, Gem, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: <Gem size={18} />,
    title: "Ficha tecnica",
    text: "Cada skin nasce com custo, float, raridade e margem em um unico registro.",
  },
  {
    icon: <Calculator size={18} />,
    title: "Lucro claro",
    text: "Preco de bilhete, receita alvo e ponto sem prejuizo antes de publicar.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Roles separados",
    text: "Cliente ve a propria jornada. Admin ve operacao, estoque e financeiro.",
  },
] as const;

export default function RubySapphirePublicSection() {
  return (
    <section
      aria-label="Operacao Ruby Safira"
      className="relative isolate overflow-hidden section-padding"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 18% 28%, rgba(180,16,58,0.24), transparent 64%), radial-gradient(48% 48% at 84% 18%, rgba(91,168,255,0.2), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent 42%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,16,58,0.72), rgba(91,168,255,0.72), transparent)",
        }}
      />

      <div className="content-wrap grid gap-[var(--space-6)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="t-eyebrow">Ruby/Safira · Operacao</p>
          <h2 className="t-h2 mt-[var(--space-3)] max-w-[11ch] text-[var(--foreground)]">
            Skin rara pede painel serio.
          </h2>
          <p className="t-body mt-[var(--space-4)] max-w-[56ch]">
            Uma nova camada visual prepara a area logada sem desmontar a home
            atual: brilho de lamina, dados limpos e decisao financeira antes da
            rifa ir ao ar.
          </p>
          <div className="mt-[var(--space-5)] flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-solid t-cta gap-2">
              <Gem size={15} />
              Dashboard
            </Link>
            <Link href="/admin" className="btn-ghost t-cta gap-2">
              <ShieldCheck size={15} />
              Admin
            </Link>
          </div>
        </div>

        <div
          className="relative min-h-[320px] overflow-hidden rounded-[8px] border p-5"
          style={{
            borderColor: "rgba(91,168,255,0.28)",
            background:
              "linear-gradient(145deg, rgba(180,16,58,0.18), rgba(91,168,255,0.12)), rgba(255,255,255,0.035)",
            boxShadow:
              "0 34px 90px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="t-card-sub">Skin pronta para rifa</p>
              <h3 className="t-h3 mt-2 text-[var(--foreground)]">
                Ruby Core
              </h3>
            </div>
            <div className="relative size-16 overflow-hidden rounded-full border border-white/10 bg-black/30">
              <Image
                src="/new-logo.png"
                alt=""
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Custo" value="R$ 4.200" />
            <MiniMetric label="Alvo" value="R$ 5.460" />
            <MiniMetric label="Margem" value="30%" />
          </div>

          <div className="mt-8 grid gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="grid grid-cols-[32px_1fr] gap-3 rounded-[8px] border border-white/10 bg-black/20 p-3"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[rgba(91,168,255,0.12)] text-[var(--highlight)]">
                  {feature.icon}
                </span>
                <span>
                  <span className="t-card-title block">{feature.title}</span>
                  <span className="t-body-sm mt-1 block">{feature.text}</span>
                </span>
              </div>
            ))}
          </div>

          <Sparkles
            aria-hidden
            className="absolute bottom-5 right-5 text-[rgba(91,168,255,0.55)]"
            size={38}
          />
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/25 p-3">
      <p className="t-card-sub">{label}</p>
      <p className="t-card-title mt-1">{value}</p>
    </div>
  );
}
