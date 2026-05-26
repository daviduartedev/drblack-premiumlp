"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  createRaffleFromSkin,
  getUserByEmail,
  upsertSkin,
} from "@/lib/ruby-safira-repository";
import { TEST_CREDENTIALS } from "@/lib/ruby-safira-seed";
import { clearSessionCookie, setSessionCookie } from "@/lib/server-session";
import type { Skin, SkinStatus } from "@/lib/ruby-safira-types";

export type LoginState = {
  message: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (isSupabaseConfigured()) {
    return {
      message:
        "Login Supabase indisponivel neste fluxo. Recarregue a pagina e tente novamente.",
    };
  }

  const user = await getUserByEmail(email);
  const credential = Object.values(TEST_CREDENTIALS).find(
    (item) => item.email === email
  );

  if (!user || credential?.password !== password) {
    return { message: "E-mail ou senha invalidos." };
  }

  await setSessionCookie(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } else {
    await clearSessionCookie();
  }
  redirect("/login");
}

export type SaveSkinState = {
  ok: boolean;
  message: string;
  skinId?: string;
};

export async function saveSkinAction(
  _prev: SaveSkinState,
  formData: FormData
): Promise<SaveSkinState> {
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const payload = {
    id,
    name: String(formData.get("name") ?? ""),
    weapon: String(formData.get("weapon") ?? ""),
    pattern: String(formData.get("pattern") ?? ""),
    float: parseOptionalFloat(formData.get("float")),
    rarity: String(formData.get("rarity") ?? ""),
    image: String(formData.get("image") ?? ""),
    wearLabel: String(formData.get("wearLabel") ?? ""),
    isStatTrak: formData.get("isStatTrak") === "on",
    listPrice: Number(formData.get("listPrice") ?? 0),
    suggestedPrice: parseOptionalNumber(formData.get("suggestedPrice")),
    stickers: parseStickers(formData.get("stickers")),
    paidValue: Number(formData.get("paidValue") ?? 0),
    estimatedMarketValue: Number(formData.get("estimatedMarketValue") ?? 0),
    desiredProfitValue: Number(formData.get("desiredProfitValue") ?? 0),
    desiredProfitPercent: Number(formData.get("desiredProfitPercent") ?? 30),
    ticketCount: Number(formData.get("ticketCount") ?? 100),
    ticketPrice: Number(formData.get("ticketPrice") ?? 10),
    status: String(formData.get("status") ?? "em_estoque") as SkinStatus,
    internalNotes: String(formData.get("internalNotes") ?? ""),
  } satisfies Omit<Skin, "id"> & { id?: string };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Salvo localmente (modo seed).", skinId: id };
  }

  const { skin, error } = await upsertSkin(payload);
  if (!skin) {
    return {
      ok: false,
      message: error ?? "Nao foi possivel salvar a skin.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/loja");
  return { ok: true, message: "Skin salva.", skinId: skin.id };
}

export type SaveRaffleState = {
  ok: boolean;
  message: string;
  skinId?: string;
  raffleId?: string;
};

export async function saveRaffleAction(
  _prev: SaveRaffleState,
  formData: FormData
): Promise<SaveRaffleState> {
  const skinPayload = {
    id: String(formData.get("skinId") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? ""),
    weapon: String(formData.get("weapon") ?? ""),
    pattern: String(formData.get("pattern") ?? ""),
    float: parseOptionalFloat(formData.get("float")),
    rarity: String(formData.get("rarity") ?? ""),
    image: String(formData.get("image") ?? ""),
    wearLabel: String(formData.get("wearLabel") ?? ""),
    isStatTrak: formData.get("isStatTrak") === "on",
    listPrice: Number(formData.get("listPrice") ?? 0),
    suggestedPrice: parseOptionalNumber(formData.get("suggestedPrice")),
    stickers: parseStickers(formData.get("stickers")),
    paidValue: Number(formData.get("paidValue") ?? 0),
    estimatedMarketValue: Number(formData.get("estimatedMarketValue") ?? 0),
    desiredProfitValue: Number(formData.get("desiredProfitValue") ?? 0),
    desiredProfitPercent: Number(formData.get("desiredProfitPercent") ?? 30),
    ticketCount: Number(formData.get("ticketCount") ?? 100),
    ticketPrice: Number(formData.get("ticketPrice") ?? 10),
    status: "em_rifa" as SkinStatus,
    internalNotes: String(formData.get("internalNotes") ?? ""),
  } satisfies Omit<Skin, "id"> & { id?: string };

  const title = String(formData.get("raffleTitle") ?? "").trim();
  const drawDate = String(formData.get("drawDate") ?? "").trim();

  if (!drawDate) {
    return { ok: false, message: "Informe a data do sorteio." };
  }
  if (!skinPayload.name.trim()) {
    return { ok: false, message: "Informe o nome da skin." };
  }
  if (skinPayload.ticketCount <= 0 || skinPayload.ticketPrice <= 0) {
    return { ok: false, message: "Bilhetes e preco por bilhete devem ser maiores que zero." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message: "Rifa salva localmente (modo seed).",
      skinId: skinPayload.id,
    };
  }

  const result = await createRaffleFromSkin({
    skin: skinPayload,
    title: title || skinPayload.name,
    drawDate,
  });

  if (!result.skin || !result.raffleId) {
    return {
      ok: false,
      message: result.error ?? "Nao foi possivel salvar a rifa.",
      skinId: result.skin?.id,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/rifas");
  revalidatePath("/loja");
  return {
    ok: true,
    message: "Rifa salva e publicada.",
    skinId: result.skin.id,
    raffleId: result.raffleId,
  };
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseStickers(value: FormDataEntryValue | null): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}
