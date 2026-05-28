"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { logoutAction, saveRaffleAction, saveSkinAction, updateRaffleAction } from "@/app/login/actions";
import {
  CS2_FLOAT_PRESETS,
  CS2_PATTERNS,
  CS2_RARITIES,
  CS2_WEAPONS,
  CS2_WEAR_LABELS,
  suggestFloatForWear,
} from "@/lib/cs2-skin-catalog";
import {
  buildRaffleCalculatorInput,
  calculateRaffleProfit,
  calculateStorePricing,
  formatBRL,
  formatPercent,
  suggestTicketPackages,
} from "@/lib/profit-calculator";
import type {
  AdminDashboardDTO,
  FinancialEntry,
  ProfitMode,
  RaffleStatus,
  Skin,
  SkinStatus,
} from "@/lib/ruby-safira-types";

type PanelMode = "list" | "skin" | "raffle" | "raffle-edit";

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
  wearLabel: "FT",
  isStatTrak: false,
  listPrice: 0,
  suggestedPrice: null,
  stickers: [],
  paidValue: 0,
  estimatedMarketValue: 0,
  desiredProfitValue: 0,
  desiredProfitPercent: 30,
  ticketCount: 100,
  ticketPrice: 10,
  status: "em_estoque",
  internalNotes: "",
  isFeatured: false,
};

function defaultDrawDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function profitModeNeedsChoice(
  desiredProfitPercent: number,
  desiredProfitValue: number
): boolean {
  return desiredProfitPercent > 0 && desiredProfitValue > 0;
}

type PricingTriggers = {
  paidValue: number;
  desiredProfitPercent: number;
  desiredProfitValue: number;
  profitMode: ProfitMode;
};

type SkinFinancialSummary = {
  skinId: string;
  skinName: string;
  cost: number | null;
  sale: number | null;
  lastDate: string | null;
};

function resolveAutoProfitMode(draft: Omit<Skin, "id">): ProfitMode {
  if (draft.desiredProfitValue > 0 && draft.desiredProfitPercent <= 0) {
    return "fixed";
  }
  return "percent";
}

function pricingTriggersFromDraft(
  draft: Omit<Skin, "id">,
  explicitMode: ProfitMode
): PricingTriggers {
  const needsChoice = profitModeNeedsChoice(
    draft.desiredProfitPercent,
    draft.desiredProfitValue
  );
  return {
    paidValue: draft.paidValue,
    desiredProfitPercent: draft.desiredProfitPercent,
    desiredProfitValue: draft.desiredProfitValue,
    profitMode: needsChoice ? explicitMode : resolveAutoProfitMode(draft),
  };
}

function pricingTriggersEqual(a: PricingTriggers, b: PricingTriggers): boolean {
  return (
    a.paidValue === b.paidValue &&
    a.desiredProfitPercent === b.desiredProfitPercent &&
    a.desiredProfitValue === b.desiredProfitValue &&
    a.profitMode === b.profitMode
  );
}

type PanelMessage = {
  tone: "ok" | "err";
  text: string;
  anchor: "footer" | "upload";
};

function skinSaveSuccessMessage(isNewSkin: boolean): string {
  return isNewSkin
    ? "Skin cadastrada. Envie a foto abaixo ou feche o painel."
    : "Skin atualizada com sucesso.";
}

function ActionFeedback({
  message,
  className = "",
}: {
  message: Pick<PanelMessage, "tone" | "text">;
  className?: string;
}) {
  return (
    <p
      className={`rounded-lg border px-3 py-2 text-[13px] leading-snug ${className} ${
        message.tone === "ok"
          ? "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)] text-[#22C55E]"
          : "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] text-[#EF4444]"
      }`}
      role="status"
    >
      {message.text}
    </p>
  );
}

function roundBRL(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseSkinNameFromFinancialLabel(label: string): string {
  return label.replace(/^(Custo|Venda|Lucro)\s*[—–-]\s*/i, "").trim();
}

function groupFinancialEntriesBySkin(
  entries: FinancialEntry[],
  skins: Skin[]
): SkinFinancialSummary[] {
  const skinNameById = new Map(skins.map((skin) => [skin.id, skin.name]));
  const grouped = new Map<string, SkinFinancialSummary>();

  for (const entry of entries) {
    if (!entry.skinId) continue;
    if (entry.kind === "taxa" || entry.kind === "lucro_realizado") continue;

    const existing = grouped.get(entry.skinId) ?? {
      skinId: entry.skinId,
      skinName:
        skinNameById.get(entry.skinId) ??
        parseSkinNameFromFinancialLabel(entry.label),
      cost: null,
      sale: null,
      lastDate: null,
    };

    if (entry.kind === "custo") {
      existing.cost = entry.amount;
    }
    if (entry.kind === "receita") {
      existing.sale = entry.amount;
    }
    if (entry.date && (!existing.lastDate || entry.date > existing.lastDate)) {
      existing.lastDate = entry.date;
    }

    grouped.set(entry.skinId, existing);
  }

  return [...grouped.values()].sort((a, b) =>
    (b.lastDate ?? "").localeCompare(a.lastDate ?? "")
  );
}

function formatFinancialDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export default function AdminPanel({ data }: { data: AdminDashboardDTO }) {
  const router = useRouter();
  const [skins, setSkins] = useState(data.skins);
  const [raffles, setRaffles] = useState(data.raffles);
  const [financialEntries, setFinancialEntries] = useState(data.financialEntries);
  const [panelMode, setPanelMode] = useState<PanelMode>("list");
  const [selectedSkinId, setSelectedSkinId] = useState("");
  const [selectedRaffleId, setSelectedRaffleId] = useState("");
  const selectedSkin = skins.find((skin) => skin.id === selectedSkinId);
  const [draft, setDraft] = useState<Omit<Skin, "id">>(EMPTY_SKIN);
  const [profitMode, setProfitMode] = useState<ProfitMode>("percent");
  const [raffleTitle, setRaffleTitle] = useState("");
  const [drawDate, setDrawDate] = useState(defaultDrawDate);
  const [raffleStatus, setRaffleStatus] = useState<RaffleStatus>("ativa");
  const [saveMessage, setSaveMessage] = useState<PanelMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingSkin, setIsSwitchingSkin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stockFilter, setStockFilter] = useState<SkinStatus | "todas">("em_estoque");
  const pricingBaselineRef = useRef<PricingTriggers | null>(null);

  const activeProfitMode = useMemo((): ProfitMode => {
    if (!profitModeNeedsChoice(draft.desiredProfitPercent, draft.desiredProfitValue)) {
      return draft.desiredProfitValue > 0 ? "fixed" : "percent";
    }
    return profitMode;
  }, [
    draft.desiredProfitPercent,
    draft.desiredProfitValue,
    profitMode,
  ]);

  const storePricing = useMemo(
    () =>
      calculateStorePricing({
        paidValue: draft.paidValue,
        profitMode: activeProfitMode,
        desiredProfitPercent: draft.desiredProfitPercent,
        desiredProfitValue: draft.desiredProfitValue,
      }),
    [
      activeProfitMode,
      draft.desiredProfitPercent,
      draft.desiredProfitValue,
      draft.paidValue,
    ]
  );

  const calculation = useMemo(
    () =>
      calculateRaffleProfit(
        buildRaffleCalculatorInput(
          draft.paidValue,
          activeProfitMode,
          draft.desiredProfitPercent,
          draft.desiredProfitValue,
          draft.ticketCount,
          draft.ticketPrice
        )
      ),
    [
      activeProfitMode,
      draft.desiredProfitPercent,
      draft.desiredProfitValue,
      draft.paidValue,
      draft.ticketCount,
      draft.ticketPrice,
    ]
  );

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
    const inventorySkins = skins.filter(
      (skin) => skin.status === "em_estoque" || skin.status === "em_rifa"
    );
    const totalCost = inventorySkins.reduce(
      (sum, skin) => sum + Number(skin.paidValue || 0),
      0
    );
    const expectedProfit = inventorySkins.reduce((sum, skin) => {
      if (skin.desiredProfitValue > 0) {
        return sum + skin.desiredProfitValue;
      }
      return sum + skin.paidValue * (skin.desiredProfitPercent / 100);
    }, 0);
    const stockValue = skins
      .filter((skin) => skin.status === "em_estoque")
      .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0);
    const grossRevenue = financialEntries
      .filter((entry) => entry.kind === "receita")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const estimatedFees = Math.abs(
      financialEntries
        .filter((entry) => entry.kind === "taxa")
        .reduce((sum, entry) => sum + entry.amount, 0)
    );
    const realizedProfit = financialEntries
      .filter((entry) => entry.kind === "lucro_realizado")
      .reduce((sum, entry) => sum + entry.amount, 0);
    return {
      grossRevenue,
      totalCost,
      estimatedFees,
      netRevenue: grossRevenue - estimatedFees,
      expectedProfit,
      realizedProfit,
      stockValue,
    };
  }, [financialEntries, skins]);

  const financialCards = useMemo(
    () => groupFinancialEntriesBySkin(financialEntries, skins),
    [financialEntries, skins]
  );

  const filteredSkins = useMemo(
    () =>
      stockFilter === "todas"
        ? skins
        : skins.filter((skin) => skin.status === stockFilter),
    [skins, stockFilter]
  );

  function syncPricingBaseline(draftSnapshot: Omit<Skin, "id">) {
    pricingBaselineRef.current = pricingTriggersFromDraft(draftSnapshot, profitMode);
  }

  useEffect(() => {
    if (panelMode === "list") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panelMode]);

  useEffect(() => {
    if (panelMode !== "skin") return;

    const currentTriggers = pricingTriggersFromDraft(draft, profitMode);
    const baseline = pricingBaselineRef.current;

    if (!baseline) {
      pricingBaselineRef.current = currentTriggers;
      return;
    }

    if (pricingTriggersEqual(currentTriggers, baseline)) return;

    pricingBaselineRef.current = currentTriggers;
    setDraft((current) => ({
      ...current,
      listPrice: storePricing.listPrice,
      suggestedPrice: storePricing.suggestedPrice,
    }));
  }, [
    panelMode,
    storePricing.listPrice,
    storePricing.suggestedPrice,
    draft.paidValue,
    draft.desiredProfitPercent,
    draft.desiredProfitValue,
    activeProfitMode,
    profitMode,
  ]);

  useEffect(() => {
    if (panelMode !== "raffle") return;
    setDraft((current) => ({
      ...current,
      ticketCount: calculation.suggestedTicketCount,
      ticketPrice: calculation.suggestedTicketPrice,
    }));
  }, [
    panelMode,
    calculation.suggestedTicketCount,
    calculation.suggestedTicketPrice,
    draft.paidValue,
    draft.desiredProfitPercent,
    draft.desiredProfitValue,
    activeProfitMode,
  ]);

  useEffect(() => {
    setFinancialEntries(data.financialEntries);
  }, [data.financialEntries]);

  function openSkinForm(skin?: Skin) {
    const nextDraft = skin ? stripId(skin) : { ...EMPTY_SKIN };
    if (skin) {
      setSelectedSkinId(skin.id);
    } else {
      setSelectedSkinId("");
    }
    setDraft(nextDraft);
    syncPricingBaseline(nextDraft);
    setSaveMessage(null);
    setPanelMode("skin");
  }

  function openRaffleForm(skin?: Skin) {
    const base = skin ?? skins.find((s) => s.status === "em_estoque") ?? skins[0];
    if (base) {
      setSelectedSkinId(base.id);
      setDraft(stripId(base));
      setRaffleTitle(base.name);
    } else {
      setSelectedSkinId("");
      setDraft({ ...EMPTY_SKIN });
      setRaffleTitle("");
    }
    setSelectedRaffleId("");
    setDrawDate(defaultDrawDate());
    setRaffleStatus("ativa");
    setSaveMessage(null);
    setPanelMode("raffle");
  }

  function openRaffleEdit(raffle: AdminDashboardDTO["raffles"][0]) {
    const skin = skins.find((item) => item.id === raffle.skinId);
    setSelectedRaffleId(raffle.id);
    setSelectedSkinId(raffle.skinId);
    if (skin) {
      setDraft(stripId(skin));
    }
    setRaffleTitle(raffle.title);
    setDrawDate(raffle.drawDate);
    setRaffleStatus(raffle.status);
    setSaveMessage(null);
    setPanelMode("raffle-edit");
  }

  function closePanel() {
    setPanelMode("list");
    setDraft(EMPTY_SKIN);
    setSelectedSkinId("");
    setSelectedRaffleId("");
    setRaffleTitle("");
    setDrawDate(defaultDrawDate());
    setRaffleStatus("ativa");
    setSaveMessage(null);
    pricingBaselineRef.current = null;
  }

  function selectSkin(skin: Skin) {
    setIsSwitchingSkin(true);
    setSelectedSkinId(skin.id);
    const nextDraft = stripId(skin);
    setDraft(nextDraft);
    syncPricingBaseline(nextDraft);
    if (panelMode === "raffle") {
      setRaffleTitle(skin.name);
    }
    window.setTimeout(() => setIsSwitchingSkin(false), 200);
  }

  function startNewSkinDraft() {
    setSelectedSkinId("");
    const nextDraft = { ...EMPTY_SKIN };
    setDraft(nextDraft);
    syncPricingBaseline(nextDraft);
    if (panelMode === "raffle") {
      setRaffleTitle("");
    }
  }

  function handleInventorySkinPick(skinId: string) {
    if (!skinId) {
      startNewSkinDraft();
      return;
    }
    const skin = skins.find((item) => item.id === skinId);
    if (skin) selectSkin(skin);
  }

  function appendSkinFields(formData: FormData) {
    if (selectedSkinId) formData.set("id", selectedSkinId);
    formData.set("name", draft.name);
    formData.set("weapon", draft.weapon);
    formData.set("pattern", draft.pattern);
    if (draft.float != null) formData.set("float", String(draft.float));
    formData.set("rarity", draft.rarity);
    formData.set("image", draft.image);
    formData.set("wearLabel", draft.wearLabel);
    if (draft.isStatTrak) formData.set("isStatTrak", "on");
    formData.set("listPrice", String(draft.listPrice));
    if (draft.suggestedPrice != null) {
      formData.set("suggestedPrice", String(draft.suggestedPrice));
    }
    formData.set("stickers", JSON.stringify(draft.stickers));
    formData.set("paidValue", String(draft.paidValue));
    formData.set("estimatedMarketValue", String(draft.estimatedMarketValue));
    formData.set("desiredProfitValue", String(draft.desiredProfitValue));
    formData.set("desiredProfitPercent", String(draft.desiredProfitPercent));
    formData.set("ticketCount", String(draft.ticketCount));
    formData.set("ticketPrice", String(draft.ticketPrice));
    formData.set("internalNotes", draft.internalNotes);
    if (draft.isFeatured) formData.set("isFeatured", "on");
  }

  async function saveSkinDraft() {
    if (isSaving) return;
    if (profitModeNeedsChoice(draft.desiredProfitPercent, draft.desiredProfitValue)) {
      setSaveMessage({
        tone: "err",
        text: "Escolha se o lucro e percentual ou valor fixo.",
        anchor: "footer",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const formData = new FormData();
    appendSkinFields(formData);
    formData.set("status", draft.status);

    const isNewSkin = !selectedSkinId;
    const result = await saveSkinAction({ ok: false, message: "" }, formData);
    if (!result.ok) {
      setSaveMessage({ tone: "err", text: result.message, anchor: "footer" });
      setIsSaving(false);
      return;
    }

    const persistedId = result.skinId ?? selectedSkinId ?? `skin_local_${Date.now()}`;
    const nextSkin: Skin = { ...draft, id: persistedId, status: draft.status };

    setSkins((current) => {
      const exists = current.some((skin) => skin.id === persistedId);
      if (exists) {
        return current.map((skin) => (skin.id === persistedId ? nextSkin : skin));
      }
      return [nextSkin, ...current];
    });
    setSelectedSkinId(persistedId);
    syncPricingBaseline(stripId(nextSkin));
    setIsSaving(false);
    setSaveMessage({
      tone: "ok",
      text: skinSaveSuccessMessage(isNewSkin),
      anchor: "footer",
    });
    router.refresh();
  }

  async function saveRaffleDraft() {
    if (isSaving) return;
    if (profitModeNeedsChoice(draft.desiredProfitPercent, draft.desiredProfitValue)) {
      setSaveMessage({
        tone: "err",
        text: "Escolha se o lucro e percentual ou valor fixo.",
        anchor: "footer",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const formData = new FormData();
    if (selectedSkinId) formData.set("skinId", selectedSkinId);
    appendSkinFields(formData);
    formData.set("raffleTitle", raffleTitle.trim() || draft.name);
    formData.set("drawDate", drawDate);

    const result = await saveRaffleAction({ ok: false, message: "" }, formData);
    if (!result.ok) {
      setSaveMessage({ tone: "err", text: result.message, anchor: "footer" });
      setIsSaving(false);
      return;
    }

    const persistedId = result.skinId ?? selectedSkinId;
    const nextSkin: Skin = { ...draft, id: persistedId, status: "em_rifa" };

    setSkins((current) => {
      const exists = current.some((skin) => skin.id === persistedId);
      if (exists) {
        return current.map((skin) => (skin.id === persistedId ? nextSkin : skin));
      }
      return [nextSkin, ...current];
    });

    if (result.raffleId) {
      setRaffles((current) => [
        {
          id: result.raffleId!,
          skinId: persistedId,
          title: raffleTitle.trim() || draft.name,
          status: "ativa",
          ticketCount: draft.ticketCount,
          ticketPrice: draft.ticketPrice,
          soldTickets: 0,
          drawDate,
          skinName: draft.name,
          skinImage: draft.image,
        },
        ...current,
      ]);
    }

    setSelectedSkinId(persistedId);
    setIsSaving(false);
    setSaveMessage({
      tone: "ok",
      text: "Rifa cadastrada e publicada em /rifas.",
      anchor: "footer",
    });
    router.refresh();
    closePanel();
  }

  async function saveRaffleEdit(finalize = false) {
    if (isSaving || !selectedRaffleId) return;

    setIsSaving(true);
    setSaveMessage(null);

    const formData = new FormData();
    formData.set("raffleId", selectedRaffleId);
    formData.set("raffleTitle", raffleTitle.trim() || draft.name);
    formData.set("drawDate", drawDate);
    formData.set("ticketCount", String(draft.ticketCount));
    formData.set("ticketPrice", String(draft.ticketPrice));
    formData.set("raffleStatus", raffleStatus);
    if (finalize) formData.set("finalize", "on");

    const result = await updateRaffleAction({ ok: false, message: "" }, formData);
    if (!result.ok) {
      setSaveMessage({ tone: "err", text: result.message, anchor: "footer" });
      setIsSaving(false);
      return;
    }

    const nextStatus = finalize ? "encerrada" : raffleStatus;
    setRaffles((current) =>
      current.map((raffle) =>
        raffle.id === selectedRaffleId
          ? {
              ...raffle,
              title: raffleTitle.trim() || draft.name,
              drawDate,
              ticketCount: draft.ticketCount,
              ticketPrice: draft.ticketPrice,
              status: nextStatus,
            }
          : raffle
      )
    );
    setIsSaving(false);
    setSaveMessage({
      tone: "ok",
      text: finalize ? "Rifa finalizada com sucesso." : "Alteracoes da rifa salvas.",
      anchor: "footer",
    });
    router.refresh();
    closePanel();
  }

  async function saveDraft() {
    if (panelMode === "raffle-edit") {
      await saveRaffleEdit(false);
      return;
    }
    if (panelMode === "raffle") {
      await saveRaffleDraft();
      return;
    }
    await saveSkinDraft();
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

  async function handleImageUpload(file: File) {
    if (!selectedSkinId) {
      setSaveMessage({
        tone: "err",
        text: "Salve a skin primeiro para habilitar o upload.",
        anchor: "footer",
      });
      return;
    }
    setUploading(true);
    setSaveMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("skinId", selectedSkinId);
      const res = await fetch("/api/admin/upload-skin-image", {
        method: "POST",
        body,
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        setSaveMessage({
          tone: "err",
          text: json.error ?? "Falha no upload da imagem.",
          anchor: "upload",
        });
        return;
      }
      if (json.url) {
        const imageUrl = json.url;
        updateDraft("image", imageUrl);
        setSkins((current) =>
          current.map((skin) =>
            skin.id === selectedSkinId ? { ...skin, image: imageUrl } : skin
          )
        );
        setSaveMessage({
          tone: "ok",
          text: "Imagem enviada e salva com sucesso.",
          anchor: "upload",
        });
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#0D0D0D] font-sans text-[#F0F0F0]">
      <section className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
        <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[560px]">
            <p className="text-[12px] font-medium text-[#888888]">Admin / Operacao</p>
            <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.04] text-[#F0F0F0] sm:text-[36px]">
              Painel de estoque
            </h1>
            <p className="mt-3 max-w-[480px] text-[14px] leading-6 text-[#888888]">
              Gerencie skins, rifas e metricas. Cadastros abrem em fluxos
              separados para manter a listagem limpa.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => openSkinForm()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-5 text-[14px] font-semibold text-black transition-all hover:brightness-110"
            >
              <Plus size={16} /> Cadastrar skin
            </button>
            <button
              type="button"
              onClick={() => openRaffleForm()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#F5A623] px-5 text-[14px] font-semibold text-[#F5A623] transition-all hover:bg-[rgba(245,166,35,0.08)]"
            >
              <Ticket size={16} /> Cadastrar rifa
            </button>
            <nav className="flex flex-wrap gap-2">
              <Link href="/rifas" className="admin-nav-button">
                Ver Rifas
              </Link>
              <Link href="/loja" className="admin-nav-button">
                Loja
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
          </div>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Coins />} label="Receita bruta" value={syncedSummary.grossRevenue} accent="#F5A623" />
          <Metric icon={<Package />} label="Custo total" value={syncedSummary.totalCost} accent="#EF4444" />
          <Metric icon={<Calculator />} label="Lucro esperado" value={syncedSummary.expectedProfit} accent="#22C55E" />
          <Metric icon={<Gem />} label="Estoque" value={syncedSummary.stockValue} accent="#3B82F6" />
        </div>

        <div className="mt-5">
          <Panel title="Estoque" icon={<Package size={17} />}>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  "todas",
                  "em_estoque",
                  "em_rifa",
                  "vendida",
                  "entregue",
                  "arquivada",
                ] as const
              ).map((status) => {
                const active = stockFilter === status;
                const label = status === "todas" ? "Todas" : STATUS_LABEL[status];
                const count =
                  status === "todas"
                    ? skins.length
                    : skins.filter((s) => s.status === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStockFilter(status)}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all ${
                      active
                        ? "bg-[#F5A623] text-black"
                        : "border border-white/[0.1] text-[#888888] hover:border-white/20 hover:text-[#F0F0F0]"
                    }`}
                  >
                    {label}
                    <span
                      className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        active
                          ? "bg-black/20 text-black"
                          : "bg-white/[0.08] text-[#888888]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid max-h-[720px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSkins.length === 0 ? (
                <p className="col-span-full text-[13px] text-[#888888]">
                  Nenhuma skin com este status.
                </p>
              ) : (
                filteredSkins.map((skin) => (
                  <SkinButton
                    key={skin.id}
                    skin={skin}
                    selected={false}
                    onClick={() => openSkinForm(skin)}
                  />
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Panel title="Rifas" icon={<Ticket size={17} />}>
            <Table
              rows={raffles.map((raffle) => [
                raffle.title,
                raffle.skinName,
                raffle.status,
                `${raffle.soldTickets}/${raffle.ticketCount}`,
              ])}
              onRowClick={(index) => openRaffleEdit(raffles[index])}
            />
          </Panel>
          <Panel title="Financeiro" icon={<Calculator size={17} />}>
            <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
              {financialCards.length === 0 ? (
                <p className="text-[12px] text-[#888888]">Nenhuma movimentacao ainda.</p>
              ) : (
                financialCards.map((card) => (
                  <SkinFinancialCard key={card.skinId} card={card} />
                ))
              )}
            </div>
          </Panel>
        </div>
      </section>

      {panelMode !== "list" ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            aria-label="Fechar painel"
            onClick={closePanel}
          />
          <div className="relative z-10 flex h-[100svh] w-full max-w-[72rem] flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:h-auto sm:max-h-[min(92svh,880px)] sm:rounded-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5">
              <div className="min-w-0 pr-2">
                <h2 className="font-display text-[20px] font-semibold leading-tight text-[#F0F0F0] sm:text-[22px]">
                  {panelMode === "skin"
                    ? "Ficha tecnica"
                    : panelMode === "raffle-edit"
                      ? "Editar rifa"
                      : "Cadastrar rifa"}
                </h2>
                <p className="mt-1.5 max-w-[520px] text-[13px] leading-relaxed text-[#888888]">
                  {panelMode === "skin"
                    ? "Cadastre ou edite uma skin para a loja. Use a calculadora ao lado para precificar."
                    : panelMode === "raffle-edit"
                      ? "Atualize dados da rifa ou finalize quando o sorteio encerrar."
                      : "Configure a rifa, bilhetes e precificacao. A skin sai da loja ao publicar."}
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Cancelar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-7">
              {panelMode === "skin" ? (
                <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
                  <div className="min-w-0 flex-1">
                  <SkinForm
                    skins={skins}
                    selectedSkinId={selectedSkinId}
                    draft={draft}
                    isSaving={isSaving}
                    isSwitchingSkin={isSwitchingSkin}
                    uploading={uploading}
                    profitMode={profitMode}
                    showProfitModeChoice={profitModeNeedsChoice(
                      draft.desiredProfitPercent,
                      draft.desiredProfitValue
                    )}
                    onProfitModeChange={setProfitMode}
                    onInventorySkinPick={handleInventorySkinPick}
                    onUpdateDraft={updateDraft}
                    onSave={saveDraft}
                    onArchive={archiveSelected}
                    onImageUpload={handleImageUpload}
                    uploadMessage={
                      saveMessage?.anchor === "upload" ? saveMessage : null
                    }
                  />
                  </div>
                  <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-[min(100%,340px)]">
                  <StoreCalculatorPanel pricing={storePricing} />
                  </aside>
                </div>
              ) : panelMode === "raffle-edit" ? (
                <div className="space-y-6">
                  <FormSection
                    title="Dados da rifa"
                    description="Titulo, sorteio, bilhetes e status operacional."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Titulo da rifa">
                        <input
                          value={raffleTitle}
                          onChange={(e) => setRaffleTitle(e.target.value)}
                          className="admin-input min-h-[48px]"
                        />
                      </Field>
                      <Field label="Data do sorteio">
                        <input
                          type="date"
                          value={drawDate}
                          onChange={(e) => setDrawDate(e.target.value)}
                          className="admin-input min-h-[48px]"
                        />
                      </Field>
                      <Field label="Qtd. bilhetes">
                        <input
                          type="number"
                          min={1}
                          value={draft.ticketCount}
                          onChange={(e) =>
                            updateDraft("ticketCount", Number(e.target.value))
                          }
                          className="admin-input min-h-[48px] tabular-nums"
                        />
                      </Field>
                      <Field label="Preco/bilhete (BRL)">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.ticketPrice}
                          onChange={(e) =>
                            updateDraft("ticketPrice", Number(e.target.value))
                          }
                          className="admin-input min-h-[48px] tabular-nums"
                        />
                      </Field>
                      <Field label="Status">
                        <select
                          value={raffleStatus}
                          onChange={(e) =>
                            setRaffleStatus(e.target.value as RaffleStatus)
                          }
                          className="admin-input min-h-[48px]"
                          disabled={raffleStatus === "encerrada"}
                        >
                          <option value="ativa">Ativa</option>
                          <option value="aguardando_sorteio">Aguardando sorteio</option>
                          <option value="encerrada">Encerrada</option>
                          <option value="ganha">Ganha</option>
                          <option value="perdida">Perdida</option>
                        </select>
                      </Field>
                    </div>
                  </FormSection>
                  <p className="text-[13px] text-[#888888]">
                    Skin vinculada: <strong className="text-[#F0F0F0]">{draft.name}</strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
                  <div className="min-w-0 flex-1 space-y-6">
                    <FormSection
                      title="Dados da rifa"
                      description="Titulo publico, data do sorteio e configuracao de bilhetes."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Titulo da rifa">
                        <input
                          value={raffleTitle}
                          onChange={(e) => setRaffleTitle(e.target.value)}
                          className="admin-input min-h-[48px]"
                          placeholder={draft.name || "Nome da skin"}
                        />
                      </Field>
                      <Field label="Data do sorteio">
                        <input
                          type="date"
                          value={drawDate}
                          onChange={(e) => setDrawDate(e.target.value)}
                          className="admin-input min-h-[48px]"
                          required
                        />
                      </Field>
                      <Field label="Qtd. bilhetes">
                        <input
                          type="number"
                          min={1}
                          value={draft.ticketCount}
                          onChange={(e) =>
                            updateDraft("ticketCount", Number(e.target.value))
                          }
                          className="admin-input min-h-[48px] tabular-nums"
                        />
                      </Field>
                      <Field label="Preco/bilhete (BRL)">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.ticketPrice}
                          onChange={(e) =>
                            updateDraft("ticketPrice", Number(e.target.value))
                          }
                          className="admin-input min-h-[48px] tabular-nums"
                        />
                      </Field>
                      </div>
                    </FormSection>
                    <SkinForm
                      skins={skins}
                      selectedSkinId={selectedSkinId}
                      draft={draft}
                      isSaving={isSaving}
                      isSwitchingSkin={isSwitchingSkin}
                      uploading={uploading}
                      compact
                      profitMode={profitMode}
                      showProfitModeChoice={profitModeNeedsChoice(
                        draft.desiredProfitPercent,
                        draft.desiredProfitValue
                      )}
                      onProfitModeChange={setProfitMode}
                      onInventorySkinPick={handleInventorySkinPick}
                      onUpdateDraft={updateDraft}
                      onSave={saveDraft}
                      onArchive={archiveSelected}
                      onImageUpload={handleImageUpload}
                      uploadMessage={
                        saveMessage?.anchor === "upload" ? saveMessage : null
                      }
                    />
                  </div>
                  <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-[min(100%,360px)]">
                  <CalculatorPanel
                    calculation={calculation}
                    suggestions={packageSuggestions}
                    selectedTicketCount={draft.ticketCount}
                    selectedTicketPrice={draft.ticketPrice}
                    onSelectPackage={(item) => {
                      updateDraft("ticketCount", item.ticketCount);
                      updateDraft("ticketPrice", item.ticketPrice);
                    }}
                  />
                  </aside>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-white/10 bg-[#121212] px-5 py-4 sm:gap-4 sm:px-8 sm:py-5">
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 text-[14px] font-semibold text-black disabled:opacity-70 sm:flex-none sm:min-w-[180px]"
              >
                <Save size={16} />
                {isSaving
                  ? "Salvando"
                  : panelMode === "raffle"
                    ? "Salvar rifa"
                    : panelMode === "raffle-edit"
                      ? "Salvar alteracoes"
                      : "Salvar skin"}
              </button>
              {saveMessage?.anchor === "footer" ? (
                <ActionFeedback
                  message={saveMessage}
                  className="min-w-[min(100%,280px)] flex-1 sm:max-w-md"
                />
              ) : null}
              {panelMode === "raffle-edit" && raffleStatus === "ativa" ? (
                <button
                  type="button"
                  onClick={() => saveRaffleEdit(true)}
                  disabled={isSaving}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#F5A623] px-4 text-[14px] font-semibold text-[#F5A623] disabled:opacity-70"
                >
                  Finalizar rifa
                </button>
              ) : null}
              {panelMode === "skin" && selectedSkinId ? (
                <button
                  type="button"
                  onClick={archiveSelected}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-[14px] font-semibold text-[#888888] hover:border-[#EF4444]/40 hover:text-[#EF4444]"
                >
                  <Archive size={16} /> Arquivar
                </button>
              ) : null}
              <button
                type="button"
                onClick={closePanel}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 text-[14px] font-semibold text-[#888888] hover:bg-white/5 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function skinInventoryOptions(skins: Skin[]) {
  return skins
    .filter((skin) => skin.status !== "arquivada")
    .map((skin) => ({
      value: skin.id,
      label: skin.name,
      hint: `${skin.weapon} · ${STATUS_LABEL[skin.status]}`,
    }));
}

function SkinForm({
  skins,
  selectedSkinId,
  draft,
  isSaving,
  isSwitchingSkin,
  uploading,
  compact = false,
  profitMode,
  showProfitModeChoice,
  onProfitModeChange,
  onInventorySkinPick,
  onUpdateDraft,
  onSave,
  onArchive,
  onImageUpload,
  uploadMessage = null,
}: {
  skins: Skin[];
  selectedSkinId: string;
  draft: Omit<Skin, "id">;
  isSaving: boolean;
  isSwitchingSkin: boolean;
  uploading: boolean;
  compact?: boolean;
  profitMode: ProfitMode;
  showProfitModeChoice: boolean;
  onProfitModeChange: (mode: ProfitMode) => void;
  onInventorySkinPick: (skinId: string) => void;
  onUpdateDraft: <K extends keyof Omit<Skin, "id">>(
    key: K,
    value: Omit<Skin, "id">[K]
  ) => void;
  onSave: () => void;
  onArchive: () => void;
  onImageUpload: (file: File) => void;
  uploadMessage?: Pick<PanelMessage, "tone" | "text"> | null;
}) {
  const inventoryOptions = useMemo(
    () => [
      {
        value: "",
        label: "Cadastrar skin nova",
        hint: "Formulario em branco para novo item",
      },
      ...skinInventoryOptions(skins),
    ],
    [skins]
  );

  const floatValue =
    draft.float != null && Number.isFinite(draft.float) ? String(draft.float) : "";
  return (
    <form
      className={`grid gap-6 transition-opacity duration-200 sm:gap-7 ${
        isSwitchingSkin ? "opacity-55" : "opacity-100"
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <FormSection
        title="Estoque e precificacao"
        description={
          compact
            ? "Informe custo e lucro para calcular o preco. Ao editar uma skin existente, os precos salvos permanecem ate voce alterar custo ou lucro."
            : selectedSkinId
              ? "Skin carregada do estoque. Precos de loja refletem o que foi salvo; altere custo ou lucro para recalcular."
              : "Cadastro novo: informe custo e lucro — a calculadora preenche os precos automaticamente."
        }
      >
        <Field
          label={compact ? "Skin do estoque" : "Editar skin do estoque"}
          hint="Primeira opcao sempre e cadastrar skin nova."
        >
          <SearchableCombobox
            value={selectedSkinId}
            onChange={onInventorySkinPick}
            options={inventoryOptions}
            allowCustom={false}
            placeholder="Buscar no estoque ou cadastrar nova"
            searchPlaceholder="Filtrar por nome, arma ou status"
            emptyMessage="Nenhuma skin no estoque"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Quanto paguei (BRL)">
            <input
              value={draft.paidValue}
              onChange={(e) => onUpdateDraft("paidValue", Number(e.target.value))}
              className="admin-input min-h-[48px] font-medium tabular-nums"
              type="number"
              min="0"
              step="0.01"
            />
          </Field>
          <Field label="Lucro desejado (%)">
            <input
              value={draft.desiredProfitPercent}
              onChange={(e) =>
                onUpdateDraft("desiredProfitPercent", Number(e.target.value))
              }
              className="admin-input min-h-[48px] font-medium tabular-nums"
              type="number"
              min="0"
            />
          </Field>
          <Field label="Lucro desejado (R$)">
            <input
              value={draft.desiredProfitValue}
              onChange={(e) =>
                onUpdateDraft("desiredProfitValue", Number(e.target.value))
              }
              className="admin-input min-h-[48px] font-medium tabular-nums"
              type="number"
              min="0"
              step="0.01"
            />
          </Field>
        </div>
        {showProfitModeChoice ? (
          <ProfitModeChoice profitMode={profitMode} onChange={onProfitModeChange} />
        ) : null}
      </FormSection>

      <div
        className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8"}`}
      >
        <div className="grid gap-6">
          <FormSection
            title="Identificacao"
            description="Nome exibido na loja ou rifa e atributos do item no CS2."
          >
            <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <input
                value={draft.name}
                onChange={(e) => onUpdateDraft("name", e.target.value)}
                className="admin-input min-h-[48px]"
              />
            </Field>
            <Field label="Tipo / arma" hint="Item base do CS2 (ex.: AK-47, AWP, Karambit)">
              <SearchableCombobox
                value={draft.weapon}
                onChange={(weapon) => onUpdateDraft("weapon", weapon)}
                options={CS2_WEAPONS}
                placeholder="Buscar arma ou item"
                searchPlaceholder="Filtrar rifles, facas, luvas..."
              />
            </Field>
            <Field label="Padrao / acabamento" hint="Finish da skin (ex.: Fade, Doppler)">
              <SearchableCombobox
                value={draft.pattern}
                onChange={(pattern) => onUpdateDraft("pattern", pattern)}
                options={CS2_PATTERNS}
                placeholder="Buscar padrao"
                searchPlaceholder="Filtrar acabamentos comuns"
              />
            </Field>
            <Field label="Desgaste" hint="FN, MW, FT, WW ou BS">
              <select
                value={draft.wearLabel ?? ""}
                onChange={(e) => {
                  const wearLabel = e.target.value;
                  onUpdateDraft("wearLabel", wearLabel);
                  const suggested = suggestFloatForWear(wearLabel);
                  if (suggested != null && draft.float == null) {
                    onUpdateDraft("float", suggested);
                  }
                }}
                className="admin-input min-h-[48px]"
              >
                <option value="">Selecionar desgaste</option>
                {CS2_WEAR_LABELS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Raridade">
              <SearchableCombobox
                value={draft.rarity}
                onChange={(rarity) => onUpdateDraft("rarity", rarity)}
                options={CS2_RARITIES}
                allowCustom={false}
                placeholder="Selecionar raridade"
                searchPlaceholder="Filtrar raridade"
              />
            </Field>
            <Field label="Float" hint="Valor de 0 a 1 — busque ou digite">
              <SearchableCombobox
                value={floatValue}
                onChange={(raw) => {
                  const n = Number(raw);
                  onUpdateDraft(
                    "float",
                    raw === "" || !Number.isFinite(n) ? null : n
                  );
                }}
                options={CS2_FLOAT_PRESETS}
                placeholder="Ex.: 0.07"
                searchPlaceholder="Filtrar floats tipicos"
              />
            </Field>
            <label className="flex min-h-[48px] items-center gap-2 rounded-lg border border-white/[0.06] bg-[#141414] px-4 text-[13px] text-[#F0F0F0] sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.isStatTrak}
                onChange={(e) => onUpdateDraft("isStatTrak", e.target.checked)}
              />
              StatTrak
            </label>
            </div>
          </FormSection>

          {!compact ? (
          <FormSection
            title="Precos e publicacao"
            description="Preco sugerido (riscado na loja) e promo sobre o preco loja. Na edicao, valores salvos permanecem ate alterar custo ou lucro."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Preco loja (BRL)">
                <input
                  value={draft.listPrice}
                  onChange={(e) => onUpdateDraft("listPrice", Number(e.target.value))}
                  className="admin-input min-h-[48px] tabular-nums"
                  type="number"
                  min="0"
                />
              </Field>
              <Field label="Preco sugerido">
                <input
                  value={draft.suggestedPrice ?? ""}
                  onChange={(e) =>
                    onUpdateDraft(
                      "suggestedPrice",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="admin-input min-h-[48px] tabular-nums"
                  type="number"
                  min="0"
                />
              </Field>
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    onUpdateDraft("status", e.target.value as SkinStatus)
                  }
                  className="admin-input min-h-[48px]"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex min-h-[48px] items-center gap-2 rounded-lg border border-white/[0.06] bg-[#141414] px-4 text-[13px] text-[#F0F0F0] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.isFeatured}
                  onChange={(e) => onUpdateDraft("isFeatured", e.target.checked)}
                  disabled={draft.status !== "em_estoque"}
                />
                Exibir em Skins em destaque (max. 10)
              </label>
            </div>
          </FormSection>
          ) : null}

          <FormSection title="Midia" description="URL manual ou upload Blob apos salvar a skin.">
          <Field label="URL da imagem">
            <input
              value={draft.image}
              onChange={(e) => onUpdateDraft("image", e.target.value)}
              className="admin-input min-h-[48px]"
            />
          </Field>

          <Field label="Upload de foto">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="file"
                accept="image/*"
                disabled={!selectedSkinId || uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageUpload(file);
                }}
                className="min-h-[44px] w-full text-[13px] text-[#888888] file:mr-3 file:rounded-md file:border-0 file:bg-[#F5A623] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-black sm:min-w-[200px] sm:flex-1"
              />
              {uploadMessage ? (
                <ActionFeedback
                  message={uploadMessage}
                  className="w-full sm:min-w-[220px] sm:flex-1"
                />
              ) : null}
            </div>
            {!selectedSkinId ? (
              <p className="mt-2 text-[12px] text-[#888888]">
                Salve a skin para habilitar upload Blob.
              </p>
            ) : null}
          </Field>
          </FormSection>

          <FormSection title="Notas internas" description="Nunca exibido na loja ou rifas publicas.">
            <Field label="Observacoes">
              <textarea
                value={draft.internalNotes}
                onChange={(e) => onUpdateDraft("internalNotes", e.target.value)}
                className="admin-input min-h-[120px]"
              />
            </Field>
          </FormSection>
        </div>

        {!compact ? (
          <div className="grid content-start gap-4 lg:sticky lg:top-0">
            <div className="relative aspect-[4/5] min-h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1A1A1A]">
              <Image
                src={draft.image}
                alt={draft.name || "Skin selecionada"}
                fill
                sizes="(max-width: 1024px) 100vw, 200px"
                className="object-cover"
              />
            </div>
            <StatusPill status={draft.status} />
          </div>
        ) : null}
      </div>

    </form>
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
      className={`grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/[0.06] p-2.5 text-left transition-all duration-150 ease-in-out hover:border-white/[0.12] hover:bg-white/[0.04] min-h-[56px] ${
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
          {skin.weapon} - {formatBRL(skin.listPrice)}
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
    wearLabel: skin.wearLabel,
    isStatTrak: skin.isStatTrak,
    listPrice: skin.listPrice,
    suggestedPrice: skin.suggestedPrice,
    stickers: skin.stickers,
    paidValue: skin.paidValue,
    estimatedMarketValue: skin.estimatedMarketValue,
    desiredProfitValue: skin.desiredProfitValue,
    desiredProfitPercent: skin.desiredProfitPercent,
    ticketCount: skin.ticketCount,
    ticketPrice: skin.ticketPrice,
    status: skin.status,
    internalNotes: skin.internalNotes,
    isFeatured: skin.isFeatured,
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
    <section className="rounded-xl border border-white/[0.06] bg-[#141414] px-4 py-5 sm:px-6 transition-all duration-150 ease-in-out hover:border-white/[0.12]">
      <div className="mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-4 text-[#F5A623]">
        {icon}
        <h2 className="admin-section-label">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SkinFinancialCard({ card }: { card: SkinFinancialSummary }) {
  return (
    <article className="rounded-lg border border-white/[0.06] bg-[#1A1A1A] p-4">
      <h3 className="text-[14px] font-semibold text-[#F0F0F0]">{card.skinName}</h3>
      <div className="mt-3 grid gap-2 text-[13px]">
        <p>
          <span className="text-[#888888]">Custo </span>
          <span className="font-medium tabular-nums text-[#EF4444]">
            {card.cost != null ? formatBRL(card.cost) : "—"}
          </span>
        </p>
        <p>
          <span className="text-[#888888]">Venda </span>
          <span className="font-medium tabular-nums text-[#22C55E]">
            {card.sale != null ? formatBRL(card.sale) : "—"}
          </span>
        </p>
        {card.lastDate ? (
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#555555]">
            Data: {formatFinancialDate(card.lastDate)}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#1A1A1A]/60 p-5 sm:p-6">
      <div className="mb-5 border-b border-white/[0.06] pb-4">
        <h3 className="text-[15px] font-semibold text-[#F0F0F0]">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-[#888888]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-2.5 ${className}`}>
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#555555]">
        {label}
      </span>
      {hint ? (
        <span className="text-[12px] leading-5 text-[#888888]">{hint}</span>
      ) : null}
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

function ProfitModeChoice({
  profitMode,
  onChange,
  className = "",
}: {
  profitMode: ProfitMode;
  onChange: (mode: ProfitMode) => void;
  className?: string;
}) {
  return (
    <fieldset className={`grid gap-2 ${className}`}>
      <legend className="admin-section-label">Modo de lucro ativo</legend>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-[44px] items-center gap-2 text-[13px] text-[#F0F0F0]">
          <input
            type="radio"
            name="profitMode"
            checked={profitMode === "percent"}
            onChange={() => onChange("percent")}
          />
          Percentual
        </label>
        <label className="flex min-h-[44px] items-center gap-2 text-[13px] text-[#F0F0F0]">
          <input
            type="radio"
            name="profitMode"
            checked={profitMode === "fixed"}
            onChange={() => onChange("fixed")}
          />
          Valor fixo (R$)
        </label>
      </div>
    </fieldset>
  );
}

function StoreCalculatorPanel({
  pricing,
}: {
  pricing: ReturnType<typeof calculateStorePricing>;
}) {
  return (
    <aside className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A]/80 px-5 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-5 text-[#F5A623]">
        <Calculator size={17} />
        <p className="admin-section-label">Calculadora (loja)</p>
      </div>
      <div className="mt-6">
        <p className="admin-section-label">Vender por</p>
        <p className="mt-3 font-display text-[34px] font-bold leading-none text-[#F5A623] tabular-nums sm:text-[38px]">
          {formatBRL(pricing.targetRevenue)}
        </p>
        <p className="mt-2 text-[13px] text-[#888888]">
          Lucro: {formatBRL(pricing.expectedProfit)}
        </p>
      </div>
      <div className="mt-5 grid gap-3">
        <CalcMetric label="Preco lista" value={formatBRL(pricing.listPrice)} />
        {pricing.suggestedPrice != null ? (
          <CalcMetric
            label="Preco sugerido (promo)"
            value={formatBRL(pricing.suggestedPrice)}
          />
        ) : null}
      </div>
      <p className="mt-4 text-[12px] leading-5 text-[#888888]">
        Preco sugerido = preco loja + margem promocional. Ao alterar custo ou lucro,
        os precos da ficha sao recalculados. Na edicao, precos ja salvos so mudam
        quando esses campos mudam.
      </p>
    </aside>
  );
}

function CalculatorPanel({
  calculation,
  suggestions,
  selectedTicketCount,
  selectedTicketPrice,
  onSelectPackage,
}: {
  calculation: ReturnType<typeof calculateRaffleProfit>;
  suggestions: ReturnType<typeof suggestTicketPackages>;
  selectedTicketCount: number;
  selectedTicketPrice: number;
  onSelectPackage: (item: ReturnType<typeof suggestTicketPackages>[number]) => void;
}) {
  const actualRevenue = roundBRL(selectedTicketCount * selectedTicketPrice);
  const actualProfit = roundBRL(actualRevenue - calculation.breakEvenRevenue);
  const actualMargin =
    actualRevenue > 0 ? Math.round((actualProfit / actualRevenue) * 100 * 100) / 100 : 0;

  return (
    <aside className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A]/80 px-5 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-5 text-[#F5A623]">
        <Calculator size={17} />
        <p className="admin-section-label">Calculadora (rifa)</p>
      </div>

      <div className="mt-6">
        <p className="admin-section-label">Receita total</p>
        <p className="mt-3 font-display text-[34px] font-bold leading-none text-[#F5A623] tabular-nums sm:text-[38px]">
          {formatBRL(actualRevenue)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#888888]">
          <TrendingUp size={15} className="text-[#22C55E]" />
          Lucro esperado: {formatBRL(actualProfit)}
        </p>
        {actualRevenue < calculation.targetRevenueBeforeFees ? (
          <p className="mt-1 text-[12px] text-[#EF4444]">
            Abaixo da meta ({formatBRL(calculation.targetRevenueBeforeFees)})
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <CalcMetric label="Bilhete" value={formatBRL(selectedTicketPrice)} />
        <CalcMetric label="Qtd." value={String(selectedTicketCount)} />
        <CalcMetric label="Margem" value={formatPercent(actualMargin)} />
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
                onClick={() => onSelectPackage(item)}
                className={`grid min-h-[44px] gap-1 rounded-lg border border-white/[0.06] bg-[#1A1A1A] p-3 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04] ${
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

function Table({
  rows,
  onRowClick,
}: {
  rows: string[][];
  onRowClick?: (index: number) => void;
}) {
  return (
    <div className="max-h-[360px] overflow-hidden rounded-lg border border-white/[0.06]">
      {rows.length === 0 ? (
        <p className="bg-[#1A1A1A] p-3 text-[12px] text-[#888888]">
          Nenhum registro ainda.
        </p>
      ) : null}
      {rows.map((row, rowIndex) => (
        <div
          key={row.join("-")}
          role={onRowClick ? "button" : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          onClick={onRowClick ? () => onRowClick(rowIndex) : undefined}
          onKeyDown={
            onRowClick
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(rowIndex);
                  }
                }
              : undefined
          }
          className={`grid gap-1 border-b border-white/[0.06] bg-[#1A1A1A] p-3 last:border-b-0 ${
            onRowClick ? "cursor-pointer hover:bg-white/[0.04]" : ""
          }`}
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
