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

const STATUS_TONE: Record<SkinStatus, string> = {
  em_estoque: "rgba(91,168,255,0.2)",
  em_rifa: "rgba(255,193,7,0.18)",
  vendida: "rgba(180,16,58,0.18)",
  entregue: "rgba(99,255,186,0.14)",
  arquivada: "rgba(255,255,255,0.08)",
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
  const selectedSkin =
    skins.find((skin) => skin.id === selectedSkinId) ?? skins[0];
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

  const syncedSummary = useMemo(() => {
    const stockValue = skins
      .filter((skin) => skin.status === "em_estoque")
      .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0);
    return { ...data.summary, stockValue };
  }, [data.summary, skins]);

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

  return (
    <main className="min-h-[100svh] bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto w-full max-w-[1440px] px-5 py-5 md:px-8 md:py-7">
        <header className="rounded-[8px] border border-white/10 bg-[var(--background-raised)] p-4 md:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="t-card-sub text-[var(--highlight)]">Painel admin</p>
              <h1 className="mt-2 font-display text-[clamp(28px,4vw,54px)] font-bold uppercase leading-[0.95] text-[var(--foreground)]">
                Precifique a rifa antes de publicar
              </h1>
              <p className="t-body-sm mt-3 max-w-[72ch]">
                Escolha a skin, informe custo e margem desejada. O painel
                calcula o valor alvo e sugere pacotes de bilhetes para levar ao
                WhatsApp com menos chute e mais controle.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/rifas" className="btn-ghost t-cta">
                Ver rifas
              </Link>
              <Link href="/" className="btn-ghost t-cta">
                Home
              </Link>
              <form action={logoutAction}>
                <button className="btn-solid t-cta" type="submit">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Coins />} label="Receita bruta" value={formatBRL(syncedSummary.grossRevenue)} />
          <Metric icon={<Package />} label="Custo total" value={formatBRL(syncedSummary.totalCost)} />
          <Metric icon={<Calculator />} label="Lucro esperado" value={formatBRL(syncedSummary.expectedProfit)} />
          <Metric icon={<Gem />} label="Estoque" value={formatBRL(syncedSummary.stockValue)} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <Panel title="Estoque" icon={<Package size={17} />}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <p className="t-body-sm">{skins.length} skins cadastradas</p>
              <button
                type="button"
                onClick={createSkin}
                className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--highlight)] transition hover:bg-white/5"
                aria-label="Criar skin"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="mt-3 grid max-h-[660px] gap-2 overflow-y-auto pr-1">
              {skins.map((skin) => (
                <SkinButton
                  key={skin.id}
                  skin={skin}
                  selected={skin.id === selectedSkin?.id}
                  onClick={() => selectSkin(skin)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Ficha tecnica" icon={<ShieldCheck size={17} />}>
            <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-4 rounded-[8px] border border-[rgba(91,168,255,0.28)] bg-[rgba(91,168,255,0.055)] p-4 lg:grid-cols-3">
                <Field label="Skin">
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
                  <input
                    value={draft.paidValue}
                    onChange={(e) => updateDraft("paidValue", Number(e.target.value))}
                    className="admin-input"
                    type="number"
                    min="0"
                  />
                </Field>
                <Field label="% quero ganhar">
                  <input
                    value={draft.desiredProfitPercent}
                    onChange={(e) =>
                      updateDraft("desiredProfitPercent", Number(e.target.value))
                    }
                    className="admin-input"
                    type="number"
                    min="0"
                  />
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                <div className="grid gap-4">
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
                        onChange={(e) =>
                          updateDraft(
                            "float",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="admin-input"
                        type="number"
                        step="0.0001"
                      />
                    </Field>
                    <Field label="Status">
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          updateDraft("status", e.target.value as SkinStatus)
                        }
                        className="admin-input"
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Mercado estimado">
                      <input
                        value={draft.estimatedMarketValue}
                        onChange={(e) =>
                          updateDraft("estimatedMarketValue", Number(e.target.value))
                        }
                        className="admin-input"
                        type="number"
                        min="0"
                      />
                    </Field>
                    <Field label="Bilhetes desejados">
                      <input
                        value={draft.ticketCount}
                        onChange={(e) => updateDraft("ticketCount", Number(e.target.value))}
                        className="admin-input"
                        type="number"
                        min="1"
                      />
                    </Field>
                  </div>

                  <Field label="Observacoes internas">
                    <textarea
                      value={draft.internalNotes}
                      onChange={(e) => updateDraft("internalNotes", e.target.value)}
                      className="admin-input min-h-28"
                    />
                  </Field>
                </div>

                <div className="grid content-start gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
                    <Image
                      src={draft.image}
                      alt={draft.name || "Skin selecionada"}
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                  <StatusPill status={draft.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={saveDraft} className="btn-solid t-cta gap-2">
                  <Save size={15} /> Salvar
                </button>
                <button type="button" onClick={createSkin} className="btn-ghost t-cta gap-2">
                  <Plus size={15} /> Nova skin
                </button>
                <button type="button" onClick={archiveSelected} className="btn-ghost t-cta gap-2">
                  <Archive size={15} /> Arquivar
                </button>
              </div>
            </form>
          </Panel>

          <CalculatorPanel
            calculation={calculation}
            suggestions={packageSuggestions}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Panel title="Rifas" icon={<Ticket size={17} />}>
            <Table
              rows={data.raffles.map((raffle) => [
                raffle.title,
                raffle.skinName,
                raffle.status,
                `${raffle.soldTickets}/${raffle.ticketCount}`,
              ])}
            />
          </Panel>
          <Panel title="Compras e vendas" icon={<Coins size={17} />}>
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
          <Panel title="Financeiro" icon={<Calculator size={17} />}>
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
      </section>
    </main>
  );
}

function SkinButton({
  skin,
  selected,
  onClick,
}: {
  skin: Skin;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[56px_1fr] gap-3 rounded-[8px] border p-2.5 text-left transition hover:bg-white/[0.04]"
      style={{
        borderColor: selected ? "rgba(91,168,255,0.62)" : "rgba(255,255,255,0.09)",
        background: selected ? "rgba(91,168,255,0.08)" : "rgba(0,0,0,0.18)",
      }}
    >
      <span className="relative aspect-square overflow-hidden rounded-[6px] bg-black/30">
        <Image src={skin.image} alt="" fill sizes="56px" className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[var(--foreground)]">
          {skin.name}
        </span>
        <span className="mt-1 block truncate text-[11px] text-[var(--foreground-muted)]">
          {skin.weapon} · {skin.rarity}
        </span>
        <span
          className="mt-2 inline-flex rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
          style={{ background: STATUS_TONE[skin.status], color: "var(--highlight)" }}
        >
          {STATUS_LABEL[skin.status]}
        </span>
      </span>
    </button>
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
    <article className="rounded-[8px] border border-white/10 bg-[var(--background-raised)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="t-card-sub">{label}</p>
          <p className="mt-2 text-[22px] font-bold leading-none text-[var(--foreground)]">
            {value}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/25 p-2 text-[var(--highlight)] [&>svg]:size-4">
          {icon}
        </div>
      </div>
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
    <section className="rounded-[8px] border border-white/10 bg-[var(--background-raised)] p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-[var(--highlight)]">
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
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: SkinStatus }) {
  return (
    <span
      className="inline-flex w-fit rounded-full border border-white/10 px-3 py-1 t-card-sub"
      style={{ background: STATUS_TONE[status] }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function CalculatorPanel({
  calculation,
  suggestions,
}: {
  calculation: ReturnType<typeof calculateRaffleProfit>;
  suggestions: ReturnType<typeof suggestTicketPackages>;
}) {
  return (
    <aside className="rounded-[8px] border border-[rgba(91,168,255,0.32)] bg-[var(--background-raised)] p-4 xl:sticky xl:top-5 xl:self-start">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-[var(--highlight)]">
        <Calculator size={17} />
        <p className="t-card-sub">Calculadora</p>
      </div>

      <div className="mt-4 rounded-[8px] border border-[rgba(255,193,7,0.22)] bg-[rgba(255,193,7,0.06)] p-4">
        <p className="t-card-sub">Vender por</p>
        <p className="mt-2 text-[34px] font-bold leading-none text-[var(--foreground)]">
          {formatBRL(calculation.targetRevenueBeforeFees)}
        </p>
        <p className="t-body-sm mt-2">
          Lucro esperado: {formatBRL(calculation.expectedProfit)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CalcMetric label="Bilhete" value={formatBRL(calculation.suggestedTicketPrice)} />
        <CalcMetric label="Qtd." value={String(calculation.suggestedTicketCount)} />
        <CalcMetric label="Margem" value={formatPercent(calculation.marginPercent)} />
        <CalcMetric label="Minimo" value={`${calculation.breakEvenTickets}`} />
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="t-card-sub">Sugestoes</p>
        <div className="mt-3 overflow-hidden rounded-[8px] border border-white/10">
          {suggestions.slice(0, 5).map((item) => (
            <div
              key={item.ticketCount}
              className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/10 bg-black/20 p-3 last:border-b-0"
            >
              <span className="text-[12px] text-[var(--foreground)]">
                {item.ticketCount} bilhetes
              </span>
              <span className="text-right text-[12px] font-semibold text-[var(--foreground)]">
                {formatBRL(item.ticketPrice)}
              </span>
              <span className="col-span-2 t-card-sub">
                total {formatBRL(item.grossRevenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CalcMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/20 p-3">
      <p className="t-card-sub">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="max-h-[360px] overflow-hidden rounded-[8px] border border-white/10">
      {rows.map((row) => (
        <div
          key={row.join("-")}
          className="grid gap-1 border-b border-white/10 bg-black/20 p-3 last:border-b-0"
        >
          {row.map((cell, index) => (
            <span
              key={`${cell}-${index}`}
              className={
                index === 0
                  ? "text-[13px] font-medium text-[var(--foreground)]"
                  : "t-card-sub"
              }
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
