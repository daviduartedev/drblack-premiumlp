import Link from "next/link";
import { Gem, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20as%20rifas%20Ruby%20e%20Safira";

const FINISHES = [
  {
    name: "Ruby",
    eyebrow: "brilho quente",
    text: "Vermelho profundo, reflexo de lamina e aquela presenca de skin que chama lobby inteiro.",
    color: "rgba(180,16,58,0.92)",
    glow: "rgba(180,16,58,0.34)",
  },
  {
    name: "Safira",
    eyebrow: "neon frio",
    text: "Azul violeta, metal polido e contraste limpo para skin rara aparecer sem virar carnaval.",
    color: "rgba(91,168,255,0.92)",
    glow: "rgba(91,168,255,0.28)",
  },
] as const;

const FAQ = [
  {
    question: "Como entro em uma rifa?",
    answer:
      "Escolhe a skin, chama no WhatsApp e reserva os bilhetes direto com a equipe.",
  },
  {
    question: "Onde acompanho o andamento?",
    answer:
      "A pagina de rifas mostra as skins em destaque; os detalhes finais rolam pelo WhatsApp por enquanto.",
  },
  {
    question: "Como recebo se ganhar?",
    answer:
      "A entrega e combinada no atendimento, com confirmacao antes de qualquer envio.",
  },
  {
    question: "Vai ter mais skin rara?",
    answer:
      "Sim. A ideia e soltar drops com skins mais especiais, sempre com visual e informacao claros.",
  },
] as const;

export default function RubySapphirePublicSection() {
  return (
    <section
      aria-label="Perguntas sobre rifas Ruby e Safira"
      className="relative isolate overflow-hidden section-padding"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 46% at 18% 16%, rgba(180,16,58,0.28), transparent 64%), radial-gradient(44% 42% at 82% 10%, rgba(91,168,255,0.24), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent 46%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,16,58,0.74), rgba(91,168,255,0.74), transparent)",
        }}
      />

      <div className="content-wrap grid gap-[var(--space-6)] lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="t-eyebrow">Ruby/Safira · Rifas</p>
          <h2 className="t-h2 mt-[var(--space-3)] max-w-[10ch] text-[var(--foreground)]">
            Dois brilhos. Uma queda rara.
          </h2>
          <p className="t-body mt-[var(--space-4)] max-w-[54ch]">
            As proximas rifas entram com uma pegada Ruby/Safira: menos barulho,
            mais pele rara, contraste forte e caminho simples para reservar pelo
            WhatsApp.
          </p>

          <div className="mt-[var(--space-5)] flex flex-wrap gap-3">
            <Link href="/rifas" className="btn-solid t-cta gap-2">
              <Gem size={15} />
              Ver rifas
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost t-cta gap-2"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>

          <div className="mt-[var(--space-6)] grid gap-3 sm:grid-cols-2">
            {FINISHES.map((finish) => (
              <article
                key={finish.name}
                className="relative overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035] p-4"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-12 size-32 rounded-full blur-3xl"
                  style={{ background: finish.glow }}
                />
                <p className="t-card-sub">{finish.eyebrow}</p>
                <h3
                  className="t-h3 mt-2"
                  style={{ color: finish.color }}
                >
                  {finish.name}
                </h3>
                <p className="t-body-sm mt-3">{finish.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div
          className="rounded-[8px] border p-5 md:p-6"
          style={{
            borderColor: "rgba(91,168,255,0.26)",
            background:
              "linear-gradient(145deg, rgba(180,16,58,0.12), rgba(91,168,255,0.1)), rgba(255,255,255,0.035)",
            boxShadow:
              "0 34px 90px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="t-eyebrow">FAQ rapido</p>
              <h3 className="t-h3 mt-2 text-[var(--foreground)]">
                Antes de pegar bilhete
              </h3>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 text-[var(--highlight)]">
              <HelpCircle size={20} />
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {FAQ.map((item) => (
              <article
                key={item.question}
                className="rounded-[8px] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex gap-3">
                  <Sparkles
                    aria-hidden
                    className="mt-1 shrink-0 text-[rgba(91,168,255,0.76)]"
                    size={16}
                  />
                  <div>
                    <h4 className="t-card-title">{item.question}</h4>
                    <p className="t-body-sm mt-2">{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-[8px] border border-[rgba(180,16,58,0.28)] bg-[rgba(180,16,58,0.08)] p-4">
            <ShieldCheck
              aria-hidden
              className="mt-1 shrink-0 text-[rgba(255,255,255,0.82)]"
              size={18}
            />
            <p className="t-body-sm">
              Informação primeiro, reserva depois. Sem tela poluida, sem cara de
              cassino, sem empurrar bilhete no escuro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
