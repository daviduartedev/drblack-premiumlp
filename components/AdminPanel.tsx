"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  Calculator,
  Coins,
  Gem,
  Package,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import {
  calculateRaffleProfit,
  formatBRL,
  formatPercent,
  suggestTicketPackages,
  type ProfitCalculatorInput,
} from "@/lib/profit-calculator";
import type {
  AdminDashboardDTO,
  Skin,
  SkinStatus,
} from "@/lib/ruby-safira-types";

const STATUS_LABEL: Record<SkinStatus, string> = {
  em_estoque: "Em estoque",
  em_rifa: "Em rifa",
  vendida: "Vendida",
  entregue: "Entregue",
  arquivada: "Arquivada",
};

const EMPTY_SKIN: Omit<Skin, "id"> = {
  name: "",
  weapon: "",
  pattern: "",
  float: null,
  rarity: "",
  image: "/new-logo.png",
  paidValue: 0,
  estimatedMarketValue: 0,
  desiredProfitValue: 0,
  desiredProfitPercent: 30,
  ticketCount: 100,
  ticketPrice: 10,
  status: "em_estoque",
  internalNotes: "",
};

export default function AdminPanel({ data }: { data: AdminDashboardDTO }) {
  const [skins, setSkins] = useState(data.skins);
  const [selectedSkinId, setSelectedSkinId] = useState(data.skins[0]?.id ?? "");
  const selectedSkin = skins.find((skin) => skin.id === selectedSkinId) ?? skins[0];
  const [draft, setDraft] = useState<Omit<Skin, "id">>(
    selectedSkin ? stripId(selectedSkin) : EMPTY_SKIN
  );

  const calculation = useMemo(() => {
    const calculatorInput: ProfitCalculatorInput = {
      paidValue: draft.paidValue,
      profitMode: "percent",
      desiredProfitPercent: draft.desiredProfitPercent,
      ticketConstraintMode: "ticketCount",
      ticketCount: draft.ticketCount,
      estimatedFeePercent: 0,
    };
    return calculateRaffleProfit(calculatorInput);
  }, [draft.desiredProfitPercent, draft.paidValue, draft.ticketCount]);

  const packageSuggestions = useMemo(
    () =>
      suggestTicketPackages(calculation.targetRevenueBeforeFees, draft.paidValue, [
        draft.ticketCount,
        100,
        130,
        200,
        260,
        500,
      ]),
    [calculation.targetRevenueBeforeFees, draft.paidValue, draft.ticketCount]
  );

  function selectSkin(skin: Skin) {
    setSelectedSkinId(skin.id);
    setDraft(stripId(skin));
  }

  function saveDraft() {
    if (!selectedSkin) return;
    setSkins((current) =>
      current.map((skin) =>
        skin.id === selectedSkin.id ? { ...skin, ...draft } : skin
      )
    );
  }

  function createSkin() {
    const id = `skin_local_${Date.now()}`;
    const next = { ...draft, id, status: "em_estoque" as const };
    setSkins((current) => [next, ...current]);
    setSelectedSkinId(id);
    setDraft(stripId(next));
  }

  function archiveSelected() {
    if (!selectedSkin) return;
    setSkins((current) =>
      current.map((skin) =>
        skin.id === selectedSkin.id ? { ...skin, status: "arquivada" } : skin
      )
    );
    setDraft((current) => ({ ...current, status: "arquivada" }));
  }

  function updateDraft<K extends keyof Omit<Skin, "id">>(
    key: K,
    value: Omit<Skin, "id">[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const syncedSummary = useMemo(() => {
    const stockValue = skins
      .filter((skin) => skin.status === "em_estoque")
      .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0);
    return { ...data.summary, stockValue };
  }, [data.summary, skins]);

  return (
    <main className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <section className="content-wrap section-padding">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-eyebrow">Painel admin</p>
            <h1 className="t-h2 mt-3 max-w-[12ch]">Ficha antes da rifa.</h1>
            <p className="t-body mt-4 max-w-[64ch]">
              Escolha a skin, informe quanto pagou e quanto quer ganhar. O
              painel calcula por quanto vender e sugere bilhetes a valores
              redondos antes de levar para o WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-ghost t-cta">Home</Link>
            <form action={logoutAction}>
              <button className="btn-solid t-cta" type="submit">Sair</button>
            </form>
          </div>
        </header>

        <div className="mt-[var(--space-5)] grid gap-4 md:grid-cols-4">
          <Metric icon={<Coins />} label="Receita bruta" value={formatBRL(syncedSummary.grossRevenue)} />
          <Metric icon={<Package />} label="Custo total" value={formatBRL(syncedSummary.totalCost)} />
          <Metric icon={<Calculator />} label="Lucro esperado" value={formatBRL(syncedSummary.expectedProfit)} />
          <Metric icon={<Gem />} label="Estoque" value={formatBRL(syncedSummary.stockValue)} />
        </div>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-5)] xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Estoque integrado" icon={<Package size={18} />}>
            <div className="grid gap-3">
              {skins.map((skin) => (
                <button
                  key={skin.id}
                  type="button"
                  onClick={() => selectSkin(skin)}
                  className="grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 rounded-[8px] border p-3 text-left transition hover:bg-white/[0.04]"
                  style={{
                    borderColor:
                      skin.id === selectedSkin?.id
                        ? "rgba(91,168,255,0.48)"
                        : "rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="relative aspect-square overflow-hidden rounded-[8px] bg-black/30">
                    <Image src={skin.image} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="t-card-title block truncate">{skin.name}</span>
                    <span className="t-body-sm block truncate">{skin.weapon} · {skin.rarity}</span>
                  </span>
                  <StatusPill status={skin.status} />
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Ficha tecnica para rifa" icon={<ShieldCheck size={18} />}>
            <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
              <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
                <div
                  className="rounded-[8px] border p-4"
                  style={{
                    borderColor: "rgba(91,168,255,0.26)",
                    background:
                      "linear-gradient(145deg, rgba(180,16,58,0.1), rgba(91,168,255,0.08))",
                  }}
                >
                  <p className="t-card-sub">Calculo principal</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <Field label="Qual skin">
                      <select
                        value={selectedSkin?.id ?? ""}
                        onChange={(e) => {
                          const skin = skins.find((item) => item.id === e.target.value);
                          if (skin) selectSkin(skin);
                        }}
                        className="admin-input"
                      >
                        {skins.map((skin) => (
                          <option key={skin.id} value={skin.id}>
                            {skin.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Quanto paguei">
                      <input value={draft.paidValue} onChange={(e) => updateDraft("paidValue", Number(e.target.value))} className="admin-input" type="number" min="0" />
                    </Field>
                    <Field label="% quero ganhar">
                      <input value={draft.desiredProfitPercent} onChange={(e) => updateDraft("desiredProfitPercent", Number(e.target.value))} className="admin-input" type="number" min="0" />
                    </Field>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nome">
                    <input value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} className="admin-input" />
                  </Field>
                  <Field label="Tipo/arma">
                    <input value={draft.weapon} onChange={(e) => updateDraft("weapon", e.target.value)} className="admin-input" />
                  </Field>
                  <Field label="Padrao">
                    <input value={draft.pattern} onChange={(e) => updateDraft("pattern", e.target.value)} className="admin-input" />
                  </Field>
                  <Field label="Raridade">
                    <input value={draft.rarity} onChange={(e) => updateDraft("rarity", e.target.value)} className="admin-input" />
                  </Field>
                  <Field label="Float">
                    <input
                      value={draft.float ?? ""}
                      onChange={(e) => updateDraft("float", e.target.value === "" ? null : Number(e.target.value))}
                      className="admin-input"
                      type="number"
                      step="0.0001"
                    />
                  </Field>
                  <Field label="Status">
                    <select value={draft.status} onChange={(e) => updateDraft("status", e.target.value as SkinStatus)} className="admin-input">
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Mercado estimado">
                    <input value={draft.estimatedMarketValue} onChange={(e) => updateDraft("estimatedMarketValue", Number(e.target.value))} className="admin-input" type="number" min="0" />
                  </Field>
                  <Field label="Bilhetes">
                    <input value={draft.ticketCount} onChange={(e) => updateDraft("ticketCount", Number(e.target.value))} className="admin-input" type="number" min="1" />
                  </Field>
                </div>
                <Field label="Observacoes internas">
                  <textarea
                    value={draft.internalNotes}
                    onChange={(e) => updateDraft("internalNotes", e.target.value)}
                    className="admin-input min-h-24"
                  />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={saveDraft} className="btn-solid t-cta gap-2">
                    <Save size={15} /> Salvar edicao
                  </button>
                  <button type="button" onClick={createSkin} className="btn-ghost t-cta gap-2">
                    <Plus size={15} /> Criar skin
                  </button>
                  <button type="button" onClick={archiveSelected} className="btn-ghost t-cta gap-2">
                    <Archive size={15} /> Arquivar
                  </button>
                </div>
              </form>

              <div className="grid gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
                  <Image src={draft.image} alt={draft.name || "Skin selecionada"} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
                </div>
                <CalculatorCard
                  calculation={calculation}
                  suggestions={packageSuggestions}
                />
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-[var(--space-5)] grid gap-[var(--space-5)] xl:grid-cols-3">
          <Panel title="Rifas" icon={<Ticket size={18} />}>
            <Table
              rows={data.raffles.map((raffle) => [
                raffle.title,
                raffle.skinName,
                raffle.status,
                `${raffle.soldTickets}/${raffle.ticketCount}`,
              ])}
            />
          </Panel>
          <Panel title="Compras e vendas" icon={<Coins size={18} />}>
            <Table
              rows={[
                ...data.purchases.map((purchase) => [
                  purchase.customerName,
                  purchase.raffleTitle,
                  formatBRL(purchase.total),
                  purchase.status,
                ]),
                ...data.salesHistory.map((entry) => [
                  entry.customerName,
                  entry.description,
                  formatBRL(entry.value),
                  entry.type,
                ]),
              ]}
            />
          </Panel>
          <Panel title="Financeiro por skin/rifa" icon={<Calculator size={18} />}>
            <Table
              rows={data.financialEntries.map((entry) => [
                entry.label,
                entry.kind,
                formatBRL(entry.amount),
                entry.date,
              ])}
            />
          </Panel>
        </div>

        <section className="mt-[var(--space-5)] rounded-[8px] border border-[rgba(255,193,7,0.18)] bg-[rgba(255,193,7,0.05)] p-4">
          <p className="t-card-sub">Compliance</p>
          <p className="t-body-sm mt-2">
            Rifas/sorteios exigem validacao juridica antes de operacao real.
            Este painel nao comunica conformidade legal; ele valida fluxo,
            dados e visual localmente.
          </p>
        </section>
      </section>
    </main>
  );
}

function stripId(skin: Skin): Omit<Skin, "id"> {
  return {
    name: skin.name,
    weapon: skin.weapon,
    pattern: skin.pattern,
    float: skin.float,
    rarity: skin.rarity,
    image: skin.image,
    paidValue: skin.paidValue,
    estimatedMarketValue: skin.estimatedMarketValue,
    desiredProfitValue: skin.desiredProfitValue,
    desiredProfitPercent: skin.desiredProfitPercent,
    ticketCount: skin.ticketCount,
    ticketPrice: skin.ticketPrice,
    status: skin.status,
    internalNotes: skin.internalNotes,
  };
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      <div className="text-[var(--highlight)] [&>svg]:size-5">{icon}</div>
      <p className="t-card-sub mt-4">{label}</p>
      <p className="t-h3 mt-1 text-[var(--foreground)]">{value}</p>
    </article>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-[var(--background-raised)] p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2 text-[var(--highlight)]">
        {icon}
        <h2 className="t-card-sub">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="t-card-sub">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: SkinStatus }) {
  return (
    <span className="rounded-full border border-[rgba(91,168,255,0.32)] bg-[rgba(91,168,255,0.08)] px-3 py-1 t-card-sub">
      {STATUS_LABEL[status]}
    </span>
  );
}

function CalculatorCard({
  calculation,
  suggestions,
}: {
  calculation: ReturnType<typeof calculateRaffleProfit>;
  suggestions: ReturnType<typeof suggestTicketPackages>;
}) {
  return (
    <div
      className="rounded-[8px] border p-4"
      style={{
        borderColor: "rgba(91,168,255,0.32)",
        background:
          "linear-gradient(145deg, rgba(180,16,58,0.12), rgba(91,168,255,0.1))",
      }}
    >
      <div className="flex items-center gap-2 text-[var(--highlight)]">
        <Calculator size={18} />
        <p className="t-card-sub">Calculadora</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <CalcMetric label="Vender por" value={formatBRL(calculation.targetRevenueBeforeFees)} />
        <CalcMetric label="Lucro esperado" value={formatBRL(calculation.expectedProfit)} />
        <CalcMetric label="Preco/bilhete" value={formatBRL(calculation.suggestedTicketPrice)} />
        <CalcMetric label="Qtd. bilhetes" value={String(calculation.suggestedTicketCount)} />
        <CalcMetric label="Margem" value={formatPercent(calculation.marginPercent)} />
        <CalcMetric label="Ponto minimo" value={`${calculation.breakEvenTickets} bilhetes`} />
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="t-card-sub">Sugestoes de bilhetes</p>
        <div className="mt-3 grid gap-2">
          {suggestions.slice(0, 5).map((item) => (
            <div
              key={item.ticketCount}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-white/10 bg-black/20 p-3"
            >
              <span className="t-body-sm text-[var(--foreground)]">
                {item.ticketCount} bilhetes a {formatBRL(item.ticketPrice)}
              </span>
              <span className="t-card-sub">
                total {formatBRL(item.grossRevenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalcMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/20 p-3">
      <p className="t-card-sub">{label}</p>
      <p className="t-card-title mt-1">{value}</p>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.join("-")} className="grid gap-1 rounded-[8px] border border-white/10 bg-black/20 p-3">
          {row.map((cell, index) => (
            <span
              key={`${cell}-${index}`}
              className={index === 0 ? "t-body-sm text-[var(--foreground)]" : "t-card-sub"}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
