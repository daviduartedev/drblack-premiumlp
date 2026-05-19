"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  TrendingUp,
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

const STATUS_STYLE: Record<SkinStatus, { bg: string; fg: string }> = {
  em_rifa: { bg: "rgba(245,166,35,0.15)", fg: "#F5A623" },
  em_estoque: { bg: "rgba(59,130,246,0.15)", fg: "#3B82F6" },
  vendida: { bg: "rgba(34,197,94,0.15)", fg: "#22C55E" },
  entregue: { bg: "rgba(34,197,94,0.15)", fg: "#22C55E" },
  arquivada: { bg: "rgba(85,85,85,0.2)", fg: "#888888" },
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
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingSkin, setIsSwitchingSkin] = useState(false);

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
    setIsSwitchingSkin(true);
    setSelectedSkinId(skin.id);
    setDraft(stripId(skin));
    window.setTimeout(() => setIsSwitchingSkin(false), 200);
  }

  function saveDraft() {
    if (!selectedSkin || isSaving) return;
    setIsSaving(true);
    setSkins((current) =>
      current.map((skin) =>
        skin.id === selectedSkin.id ? { ...skin, ...draft } : skin
      )
    );
    window.setTimeout(() => setIsSaving(false), 650);
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
    <main className="min-h-[100svh] bg-[#0D0D0D] font-sans text-[#F0F0F0]">
      <section className="mx-auto w-full max-w-[1440px] p-6">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[560px]">
            <p className="text-[12px] font-medium text-[#888888]">
              Admin / Precificacao
            </p>
            <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.04] text-[#F0F0F0]">
              Ficha antes da rifa
            </h1>
            <p className="mt-3 max-w-[480px] text-[14px] leading-6 text-[#888888]">
              Calcule custo, margem e bilhetes antes de levar a skin para o
              WhatsApp. Menos chute, mais decisao financeira.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link href="/rifas" className="admin-nav-button">
              Ver Rifas
            </Link>
            <Link href="/" className="admin-nav-button">
              Home
            </Link>
            <form action={logoutAction}>
              <button className="admin-nav-button hover:text-[#EF4444]" type="submit">
                Sair
              </button>
            </form>
          </nav>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Coins />}
            label="Receita bruta"
            value={syncedSummary.grossRevenue}
            accent="#F5A623"
          />
          <Metric
            icon={<Package />}
            label="Custo total"
            value={syncedSummary.totalCost}
            accent="#EF4444"
          />
          <Metric
            icon={<Calculator />}
            label="Lucro esperado"
            value={syncedSummary.expectedProfit}
            accent="#22C55E"
          />
          <Metric
            icon={<Gem />}
            label="Estoque"
            value={syncedSummary.stockValue}
            accent="#3B82F6"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <Panel title="Estoque" icon={<Package size={17} />}>
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <p className="text-[14px] text-[#888888]">
                {skins.length} skins cadastradas
              </p>
              <button
                type="button"
                onClick={createSkin}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-dashed border-white/15 text-[#F5A623] transition-all duration-150 ease-in-out hover:border-[#F5A623] hover:bg-[rgba(245,166,35,0.08)]"
                aria-label="Criar skin"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="mt-4 grid max-h-[660px] gap-2 overflow-y-auto pr-1">
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
            <form
              className={`grid gap-5 transition-opacity duration-200 ${
                isSwitchingSkin ? "opacity-55" : "opacity-100"
              }`}
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="grid gap-4 rounded-xl border border-[rgba(245,166,35,0.18)] bg-[rgba(245,166,35,0.04)] p-5 lg:grid-cols-3">
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
                    className="admin-input font-medium tabular-nums"
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
                    className="admin-input font-medium tabular-nums"
                    type="number"
                    min="0"
                  />
                </Field>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome">
                      <input
                        value={draft.name}
                        onChange={(e) => updateDraft("name", e.target.value)}
                        className="admin-input"
                      />
                    </Field>
                    <Field label="Tipo/arma">
                      <input
                        value={draft.weapon}
                        onChange={(e) => updateDraft("weapon", e.target.value)}
                        className="admin-input"
                      />
                    </Field>
                    <Field label="Padrao">
                      <input
                        value={draft.pattern}
                        onChange={(e) => updateDraft("pattern", e.target.value)}
                        className="admin-input"
                      />
                    </Field>
                    <Field label="Raridade">
                      <input
                        value={draft.rarity}
                        onChange={(e) => updateDraft("rarity", e.target.value)}
                        className="admin-input"
                      />
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
                        className="admin-input tabular-nums"
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
                        className="admin-input tabular-nums"
                        type="number"
                        min="0"
                      />
                    </Field>
                    <Field label="Bilhetes desejados">
                      <input
                        value={draft.ticketCount}
                        onChange={(e) => updateDraft("ticketCount", Number(e.target.value))}
                        className="admin-input tabular-nums"
                        type="number"
                        min="1"
                      />
                    </Field>
                  </div>

                  <Field label="Observacoes internas">
                    <textarea
                      value={draft.internalNotes}
                      onChange={(e) => updateDraft("internalNotes", e.target.value)}
                      className="admin-input min-h-20"
                    />
                  </Field>

                  <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4">
                    <div className="flex items-center gap-3">
                      <SteamMark />
                      <div>
                        <p className="admin-section-label">Mercado Steam</p>
                        <p className="mt-1 text-[13px] text-[#888888]">
                          Integracao em breve
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-[#1A1A1A]">
                    <Image
                      src={draft.image}
                      alt={draft.name || "Skin selecionada"}
                      fill
                      sizes="230px"
                      className="object-cover"
                    />
                  </div>
                  <StatusPill status={draft.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-5 text-[14px] font-semibold text-black transition-all duration-150 ease-in-out hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-75"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="admin-spinner size-4 rounded-full border-2 border-black/30 border-t-black" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Salvando" : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={createSkin}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#F5A623] px-5 text-[14px] font-semibold text-[#F5A623] transition-all duration-150 ease-in-out hover:bg-[rgba(245,166,35,0.08)] active:scale-[0.98]"
                >
                  <Plus size={16} /> Nova Skin
                </button>
                <button
                  type="button"
                  onClick={archiveSelected}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[14px] font-semibold text-[#888888] transition-all duration-150 ease-in-out hover:text-[#EF4444] active:scale-[0.98]"
                >
                  <Archive size={16} /> Arquivar
                </button>
              </div>
            </form>
          </Panel>

          <CalculatorPanel
            calculation={calculation}
            suggestions={packageSuggestions}
            selectedTicketCount={draft.ticketCount}
            onSelectTicketCount={(ticketCount) => updateDraft("ticketCount", ticketCount)}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
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
      className={`grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/[0.06] p-2.5 text-left transition-all duration-150 ease-in-out hover:border-white/[0.12] hover:bg-white/[0.04] ${
        selected
          ? "border-l-2 border-l-[#F5A623] bg-[#1A1A1A]"
          : "bg-transparent"
      }`}
    >
      <span className="relative size-12 overflow-hidden rounded-lg bg-[#1A1A1A]">
        <Image src={skin.image} alt="" fill sizes="48px" className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium leading-5 text-[#F0F0F0]">
          {skin.name}
        </span>
        <span className="mt-0.5 block truncate text-[12px] leading-4 text-[#888888]">
          {skin.weapon} - {skin.rarity}
        </span>
      </span>
      <StatusPill status={skin.status} compact />
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
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#141414] px-6 py-5 transition-all duration-150 ease-in-out hover:border-white/[0.12]">
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-section-label">{label}</p>
          <p className="mt-3 text-[28px] font-bold leading-none tabular-nums text-[#F0F0F0]">
            <CountUpBRL value={value} />
          </p>
        </div>
        <div className="text-[#555555] [&>svg]:size-5">{icon}</div>
      </div>
    </article>
  );
}

function CountUpBRL({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startTime = performance.now();
    const duration = 800;

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatBRL(displayValue)}</>;
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
    <section className="rounded-xl border border-white/[0.06] bg-[#141414] px-6 py-5 transition-all duration-150 ease-in-out hover:border-white/[0.12]">
      <div className="mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-4 text-[#F5A623]">
        {icon}
        <h2 className="admin-section-label">{title}</h2>
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
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#555555]">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusPill({
  status,
  compact = false,
}: {
  status: SkinStatus;
  compact?: boolean;
}) {
  const tone = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex h-6 w-fit items-center rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        compact ? "whitespace-nowrap" : ""
      }`}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function CalculatorPanel({
  calculation,
  suggestions,
  selectedTicketCount,
  onSelectTicketCount,
}: {
  calculation: ReturnType<typeof calculateRaffleProfit>;
  suggestions: ReturnType<typeof suggestTicketPackages>;
  selectedTicketCount: number;
  onSelectTicketCount: (ticketCount: number) => void;
}) {
  return (
    <aside className="rounded-xl border border-white/[0.06] bg-[#141414] px-6 py-5 transition-all duration-150 ease-in-out hover:border-white/[0.12] xl:sticky xl:top-6 xl:self-start">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 text-[#F5A623]">
        <Calculator size={17} />
        <p className="admin-section-label">Calculadora</p>
      </div>

      <div className="mt-5">
        <p className="admin-section-label">Vender por</p>
        <p className="mt-2 font-display text-[36px] font-bold leading-none text-[#F5A623] tabular-nums">
          {formatBRL(calculation.targetRevenueBeforeFees)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#888888]">
          <TrendingUp size={15} className="text-[#22C55E]" />
          Lucro esperado: {formatBRL(calculation.expectedProfit)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <CalcMetric label="Bilhete" value={formatBRL(calculation.suggestedTicketPrice)} />
        <CalcMetric label="Qtd." value={String(calculation.suggestedTicketCount)} />
        <CalcMetric label="Margem" value={formatPercent(calculation.marginPercent)} />
        <CalcMetric label="Minimo" value={`${calculation.breakEvenTickets}`} />
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="admin-section-label">Sugestoes</p>
        <div className="mt-3 grid gap-2">
          {suggestions.slice(0, 5).map((item) => {
            const selected = item.ticketCount === selectedTicketCount;
            return (
              <button
                type="button"
                key={item.ticketCount}
                onClick={() => onSelectTicketCount(item.ticketCount)}
                className={`grid gap-1 rounded-lg border border-white/[0.06] bg-[#1A1A1A] p-3 text-left transition-all duration-150 ease-in-out hover:border-white/[0.12] hover:bg-white/[0.04] ${
                  selected
                    ? "border-l-2 border-l-[#F5A623] bg-[rgba(245,166,35,0.06)]"
                    : ""
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-[#F0F0F0]">
                    {item.ticketCount} bilhetes
                  </span>
                  <span className="text-[13px] font-semibold text-[#F0F0F0] tabular-nums">
                    {formatBRL(item.ticketPrice)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.08em] text-[#555555]">
                  <span>Total</span>
                  <span className="text-[#F5A623]">
                    {formatBRL(item.grossRevenue)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function CalcMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#1A1A1A] p-3">
      <p className="admin-section-label">{label}</p>
      <p className="mt-2 text-[18px] font-semibold leading-none text-[#F0F0F0] tabular-nums">
        {value}
      </p>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="max-h-[360px] overflow-hidden rounded-lg border border-white/[0.06]">
      {rows.map((row) => (
        <div
          key={row.join("-")}
          className="grid gap-1 border-b border-white/[0.06] bg-[#1A1A1A] p-3 last:border-b-0"
        >
          {row.map((cell, index) => (
            <span
              key={`${cell}-${index}`}
              className={
                index === 0
                  ? "text-[13px] font-medium text-[#F0F0F0]"
                  : "text-[11px] uppercase tracking-[0.08em] text-[#888888]"
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

function SteamMark() {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-lg border border-white/[0.06] bg-[#141414] text-[#888888]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
      >
        <circle cx="15.8" cy="8.3" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="7.4" cy="16.1" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M9.6 14.8l3.7-4M5.2 14.8l-2.6-1.1M9.6 17.3l4.1 1.7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
      </svg>
    </span>
  );
}
