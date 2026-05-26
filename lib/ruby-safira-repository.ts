import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  financialEntries,
  purchases,
  raffles,
  salesHistory,
  skins as seedSkins,
  tickets,
  users,
} from "@/lib/ruby-safira-seed";
import type {
  AdminDashboardDTO,
  CustomerDashboardDTO,
  PublicStoreSkin,
  RaffleStatus,
  Skin,
  SkinStatus,
  User,
  UserRole,
} from "@/lib/ruby-safira-types";

type DbSkinRow = {
  id: string;
  name: string;
  weapon: string;
  pattern: string;
  float: number | null;
  rarity: string;
  wear_label: string;
  is_stat_trak: boolean;
  image_url: string;
  list_price: number;
  suggested_price: number | null;
  stickers: string[] | null;
  paid_value: number;
  estimated_market_value: number;
  desired_profit_value: number;
  desired_profit_percent: number;
  ticket_count: number;
  ticket_price: number;
  status: SkinStatus;
  internal_notes: string;
  is_featured: boolean;
  updated_at?: string;
};

type DbProfileRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

const FEATURED_SKINS_LIMIT = 10;

function mapSkinRow(row: DbSkinRow): Skin {
  return {
    id: row.id,
    name: row.name,
    weapon: row.weapon,
    pattern: row.pattern,
    float: row.float,
    rarity: row.rarity,
    image: row.image_url || "/new-logo.png",
    wearLabel: row.wear_label,
    isStatTrak: row.is_stat_trak,
    listPrice: Number(row.list_price),
    suggestedPrice:
      row.suggested_price != null ? Number(row.suggested_price) : null,
    stickers: Array.isArray(row.stickers) ? row.stickers : [],
    paidValue: Number(row.paid_value),
    estimatedMarketValue: Number(row.estimated_market_value),
    desiredProfitValue: Number(row.desired_profit_value),
    desiredProfitPercent: Number(row.desired_profit_percent),
    ticketCount: row.ticket_count,
    ticketPrice: Number(row.ticket_price),
    status: row.status,
    internalNotes: row.internal_notes,
    isFeatured: row.is_featured ?? false,
  };
}

function mapPublicSkinRow(row: DbSkinRow): PublicStoreSkin {
  return {
    id: row.id,
    name: row.name,
    weapon: row.weapon,
    pattern: row.pattern,
    float: row.float,
    rarity: row.rarity,
    wearLabel: row.wear_label,
    isStatTrak: row.is_stat_trak,
    imageUrl: row.image_url || "/new-logo.png",
    listPrice: Number(row.list_price),
    suggestedPrice:
      row.suggested_price != null ? Number(row.suggested_price) : null,
    stickers: Array.isArray(row.stickers) ? row.stickers : [],
  };
}

function mapSeedSkin(skin: Skin): Skin {
  return {
    ...skin,
    wearLabel: skin.wearLabel ?? "",
    isStatTrak: skin.isStatTrak ?? false,
    listPrice: skin.listPrice ?? skin.estimatedMarketValue,
    suggestedPrice: skin.suggestedPrice ?? null,
    stickers: skin.stickers ?? [],
    isFeatured: skin.isFeatured ?? false,
  };
}

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export const getCurrentProfile = cache(async (): Promise<User | null> => {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return null;

  const {
    data: { user: verifiedUser },
  } = await supabase.auth.getUser();
  if (!verifiedUser) return null;

  return resolveProfile(supabase, verifiedUser);
});

async function resolveProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }
): Promise<User> {
  const { ensureProfile } = await import("@/lib/supabase/ensure-profile");
  const profile = await ensureProfile(supabase, authUser as import("@supabase/supabase-js").User);

  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  }

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name:
      (authUser.user_metadata?.name as string | undefined) ??
      authUser.email ??
      "Usuario",
    role: (authUser.user_metadata?.role as UserRole) ?? "customer",
  };
}

export const getUserByEmail = cache(async (email: string) =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
);

export const getUserById = cache(async (id: string) => {
  const profile = await getCurrentProfile();
  if (profile?.id === id) return profile;
  return users.find((user) => user.id === id) ?? null;
});

const INVENTORY_STATUSES: SkinStatus[] = ["em_estoque", "em_rifa"];

function sumInventoryPaidValue(skins: Skin[]): number {
  return skins
    .filter((skin) => INVENTORY_STATUSES.includes(skin.status))
    .reduce((sum, skin) => sum + Number(skin.paidValue || 0), 0);
}

function sumExpectedProfit(skins: Skin[]): number {
  return skins
    .filter((skin) => INVENTORY_STATUSES.includes(skin.status))
    .reduce((sum, skin) => {
      if (skin.desiredProfitValue > 0) {
        return sum + skin.desiredProfitValue;
      }
      return sum + skin.paidValue * (skin.desiredProfitPercent / 100);
    }, 0);
}

function isPublicStoreEligible(skin: Skin): boolean {
  return (
    skin.status === "em_estoque" &&
    skin.name.trim().length > 0 &&
    skin.listPrice > 0 &&
    skin.image.trim().length > 0
  );
}

export const getPublicStoreSkins = cache(async (): Promise<PublicStoreSkin[]> => {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return seedSkins
      .filter((skin) => isPublicStoreEligible(skin as Skin))
      .map((skin) => {
        const mapped = mapSeedSkin(skin as Skin);
        return {
          id: mapped.id,
          name: mapped.name,
          weapon: mapped.weapon,
          pattern: mapped.pattern,
          float: mapped.float,
          rarity: mapped.rarity,
          wearLabel: mapped.wearLabel,
          isStatTrak: mapped.isStatTrak,
          imageUrl: mapped.image,
          listPrice: mapped.listPrice,
          suggestedPrice: mapped.suggestedPrice,
          stickers: mapped.stickers,
        };
      });
  }

  const { data, error } = await supabase
    .from("public_store_skins")
    .select(
      "id, name, weapon, pattern, float, rarity, wear_label, is_stat_trak, image_url, list_price, suggested_price, stickers, status"
    )
    .order("name");

  if (error || !data) return [];

  return (data as DbSkinRow[]).map(mapPublicSkinRow);
});

export const getFeaturedStoreSkins = cache(async (): Promise<PublicStoreSkin[]> => {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return seedSkins
      .filter(
        (skin) =>
          (skin as Skin).isFeatured && isPublicStoreEligible(skin as Skin)
      )
      .map((skin) => {
        const mapped = mapSeedSkin(skin as Skin);
        return {
          id: mapped.id,
          name: mapped.name,
          weapon: mapped.weapon,
          pattern: mapped.pattern,
          float: mapped.float,
          rarity: mapped.rarity,
          wearLabel: mapped.wearLabel,
          isStatTrak: mapped.isStatTrak,
          imageUrl: mapped.image,
          listPrice: mapped.listPrice,
          suggestedPrice: mapped.suggestedPrice,
          stickers: mapped.stickers,
        };
      })
      .slice(0, FEATURED_SKINS_LIMIT);
  }

  const { data, error } = await supabase
    .from("public_featured_skins")
    .select(
      "id, name, weapon, pattern, float, rarity, wear_label, is_stat_trak, image_url, list_price, suggested_price, stickers, status"
    )
    .order("name")
    .limit(FEATURED_SKINS_LIMIT);

  if (error || !data) return [];

  return (data as DbSkinRow[]).map(mapPublicSkinRow);
});

function mapSkinRowsToStoreSales(rows: DbSkinRow[]) {
  return rows
    .filter((row) => row.status === "vendida" || row.status === "entregue")
    .map((row) => ({
      id: row.id,
      skinName: row.name,
      date: (row.updated_at ?? new Date().toISOString()).slice(0, 10),
      amount: Number(row.list_price),
      status: row.status,
    }));
}

export const getCustomerDashboard = cache(
  async (userId: string): Promise<CustomerDashboardDTO | null> => {
    const supabase = await getSupabaseOrNull();
    if (!supabase) {
      const user = users.find((item) => item.id === userId);
      if (!user) return null;

      const customerTickets = tickets.filter((ticket) => ticket.userId === userId);
      const customerPurchases = purchases.filter(
        (purchase) => purchase.userId === userId
      );
      const customerSales = salesHistory.filter((entry) => entry.userId === userId);

      const raffleRows = raffles
        .filter((raffle) =>
          customerTickets.some((ticket) => ticket.raffleId === raffle.id)
        )
        .map((raffle) => {
          const skin = seedSkins.find((item) => item.id === raffle.skinId);
          const raffleTickets = customerTickets.filter(
            (ticket) => ticket.raffleId === raffle.id
          );
          return {
            id: raffle.id,
            title: raffle.title,
            skinName: skin?.name ?? "Skin nao encontrada",
            status: raffle.status,
            tickets: raffleTickets.map((ticket) => ticket.number),
            drawDate: raffle.drawDate,
            ticketPrice: raffle.ticketPrice,
          };
        });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        summary: {
          totalSpent: customerPurchases
            .filter((purchase) => purchase.status === "pago")
            .reduce((sum, purchase) => sum + purchase.total, 0),
          activeRaffles: raffleRows.filter((raffle) => raffle.status === "ativa")
            .length,
          activeTickets: customerTickets.filter(
            (ticket) => ticket.status === "ativa"
          ).length,
          prizesWon: raffleRows.filter((raffle) => raffle.status === "ganha").length,
        },
        raffles: raffleRows,
        purchases: customerPurchases.map((purchase) => {
          const raffle = raffles.find((item) => item.id === purchase.raffleId);
          return {
            id: purchase.id,
            raffleTitle: raffle?.title ?? "Rifa nao encontrada",
            date: purchase.date,
            tickets: purchase.tickets,
            total: purchase.total,
            status: purchase.status,
          };
        }),
        prizes: raffleRows
          .filter((raffle) => raffle.status === "ganha")
          .map((raffle) => ({
            id: raffle.id,
            title: raffle.title,
            skinName: raffle.skinName,
            date: raffle.drawDate,
          })),
        salesHistory: customerSales,
        activities: [
          {
            id: "act_001",
            label: "3 bilhetes ativos no drop AK Ruby Core",
            date: "2026-05-18",
            tone: "ruby" as const,
          },
        ],
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, name, role")
      .eq("id", userId)
      .maybeSingle();

    const row = profile as DbProfileRow | null;
    if (!row) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser || authUser.id !== userId) return null;

      const { ensureProfile } = await import("@/lib/supabase/ensure-profile");
      const ensured = await ensureProfile(supabase, authUser);
      if (!ensured) return null;

      return {
        user: {
          id: ensured.id,
          name: ensured.name,
          email: ensured.email,
          role: ensured.role,
        },
        summary: {
          totalSpent: 0,
          activeRaffles: 0,
          activeTickets: 0,
          prizesWon: 0,
        },
        raffles: [],
        purchases: [],
        prizes: [],
        salesHistory: [],
        activities: [],
      };
    }

    const { data: customerTickets } = await supabase
      .from("tickets")
      .select("id, raffle_id, number, status")
      .eq("user_id", userId);

    const { data: customerPurchases } = await supabase
      .from("purchases")
      .select("id, raffle_id, date, tickets, total, status")
      .eq("user_id", userId);

    const raffleIds = [
      ...new Set([
        ...(customerTickets ?? []).map((t) => t.raffle_id as string),
        ...(customerPurchases ?? []).map((p) => p.raffle_id as string),
      ]),
    ];

    const { data: raffleData } = raffleIds.length
      ? await supabase
          .from("raffles")
          .select("id, title, skin_id, status, draw_date, ticket_price")
          .in("id", raffleIds)
      : { data: [] };

    const skinIds = [...new Set((raffleData ?? []).map((r) => r.skin_id as string))];
    const { data: skinData } = skinIds.length
      ? await supabase.from("skins").select("id, name").in("id", skinIds)
      : { data: [] };

    const skinMap = new Map((skinData ?? []).map((s) => [s.id as string, s.name as string]));

    const raffleRows = (raffleData ?? []).map((raffle) => ({
      id: raffle.id as string,
      title: raffle.title as string,
      skinName: skinMap.get(raffle.skin_id as string) ?? "Skin nao encontrada",
      status: raffle.status as CustomerDashboardDTO["raffles"][0]["status"],
      tickets: (customerTickets ?? [])
        .filter((t) => t.raffle_id === raffle.id)
        .map((t) => t.number as string),
      drawDate: raffle.draw_date as string,
      ticketPrice: Number(raffle.ticket_price),
    }));

    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
      },
      summary: {
        totalSpent: (customerPurchases ?? [])
          .filter((p) => p.status === "pago")
          .reduce((sum, p) => sum + Number(p.total), 0),
        activeRaffles: raffleRows.filter((r) => r.status === "ativa").length,
        activeTickets: (customerTickets ?? []).filter((t) => t.status === "ativa")
          .length,
        prizesWon: raffleRows.filter((r) => r.status === "ganha").length,
      },
      raffles: raffleRows,
      purchases: (customerPurchases ?? []).map((purchase) => {
        const raffle = (raffleData ?? []).find((r) => r.id === purchase.raffle_id);
        return {
          id: purchase.id as string,
          raffleTitle: (raffle?.title as string) ?? "Rifa nao encontrada",
          date: purchase.date as string,
          tickets: purchase.tickets as number,
          total: Number(purchase.total),
          status: purchase.status as "pago" | "pendente" | "cancelado",
        };
      }),
      prizes: raffleRows
        .filter((r) => r.status === "ganha")
        .map((r) => ({
          id: r.id,
          title: r.title,
          skinName: r.skinName,
          date: r.drawDate,
        })),
      salesHistory: [],
      activities: [],
    };
  }
);

export const getAdminDashboard = cache(async (): Promise<AdminDashboardDTO> => {
  const profile = await getCurrentProfile();
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    const admin = users.find((user) => user.role === "admin")!;
    const mappedSkins = seedSkins.map((s) => mapSeedSkin(s as Skin));
    const grossRevenue = financialEntries
      .filter((entry) => entry.kind === "receita")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCost = sumInventoryPaidValue(mappedSkins);
    const estimatedFees = Math.abs(
      financialEntries
        .filter((entry) => entry.kind === "taxa")
        .reduce((sum, entry) => sum + entry.amount, 0)
    );
    const realizedProfit = financialEntries
      .filter((entry) => entry.kind === "lucro_realizado")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expectedProfit = sumExpectedProfit(mappedSkins);

    return {
      user: profile ?? {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      summary: {
        grossRevenue,
        totalCost,
        estimatedFees,
        netRevenue: grossRevenue - estimatedFees,
        expectedProfit,
        realizedProfit,
        stockValue: mappedSkins
          .filter((skin) => skin.status === "em_estoque")
          .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0),
      },
      skins: mappedSkins,
      raffles: raffles.map((raffle) => {
        const skin = mappedSkins.find((item) => item.id === raffle.skinId);
        return {
          ...raffle,
          skinName: skin?.name ?? "Skin nao encontrada",
          skinImage: skin?.image ?? "/new-logo.png",
        };
      }),
      purchases: purchases.map((purchase) => {
        const customer = users.find((user) => user.id === purchase.userId);
        const raffle = raffles.find((item) => item.id === purchase.raffleId);
        return {
          ...purchase,
          customerName: customer?.name ?? "Cliente removido",
          raffleTitle: raffle?.title ?? "Rifa nao encontrada",
        };
      }),
      salesHistory: salesHistory.map((entry) => {
        const customer = users.find((user) => user.id === entry.userId);
        return {
          ...entry,
          customerName: customer?.name ?? "Cliente removido",
        };
      }),
      skinSales: mapSkinRowsToStoreSales(
        mappedSkins.map((skin) => ({
          id: skin.id,
          name: skin.name,
          weapon: skin.weapon,
          pattern: skin.pattern,
          float: skin.float,
          rarity: skin.rarity,
          wear_label: skin.wearLabel,
          is_stat_trak: skin.isStatTrak,
          image_url: skin.image,
          list_price: skin.listPrice,
          suggested_price: skin.suggestedPrice,
          stickers: skin.stickers,
          paid_value: skin.paidValue,
          estimated_market_value: skin.estimatedMarketValue,
          desired_profit_value: skin.desiredProfitValue,
          desired_profit_percent: skin.desiredProfitPercent,
          ticket_count: skin.ticketCount,
          ticket_price: skin.ticketPrice,
          status: skin.status,
          internal_notes: skin.internalNotes,
          is_featured: skin.isFeatured,
          updated_at: new Date().toISOString(),
        }))
      ),
      financialEntries,
    };
  }

  const { data: skinRows } = await supabase.from("skins").select("*").order("name");
  const skinRowList = (skinRows ?? []) as DbSkinRow[];
  const mappedSkins = skinRowList.map(mapSkinRow);

  const { data: raffleRows } = await supabase.from("raffles").select("*");
  const { data: purchaseRows } = await supabase.from("purchases").select("*");
  const { data: financialRows } = await supabase
    .from("financial_entries")
    .select("*");
  const { data: profileRows } = await supabase.from("profiles").select("id, name");

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [p.id as string, p.name as string])
  );

  const grossRevenue = (financialRows ?? [])
    .filter((e) => e.kind === "receita")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCost = sumInventoryPaidValue(mappedSkins);
  const estimatedFees = Math.abs(
    (financialRows ?? [])
      .filter((e) => e.kind === "taxa")
      .reduce((sum, e) => sum + Number(e.amount), 0)
  );
  const realizedProfit = (financialRows ?? [])
    .filter((e) => e.kind === "lucro_realizado")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expectedProfit = sumExpectedProfit(mappedSkins);

  const adminUser = profile ?? {
    id: "",
    name: "Admin",
    email: "",
    role: "admin" as const,
  };

  return {
    user: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    },
    summary: {
      grossRevenue,
      totalCost,
      estimatedFees,
      netRevenue: grossRevenue - estimatedFees,
      expectedProfit,
      realizedProfit,
      stockValue: mappedSkins
        .filter((skin) => skin.status === "em_estoque")
        .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0),
    },
    skins: mappedSkins,
    raffles: (raffleRows ?? []).map((raffle) => {
      const skin = mappedSkins.find((item) => item.id === raffle.skin_id);
      return {
        id: raffle.id as string,
        skinId: raffle.skin_id as string,
        title: raffle.title as string,
        status: raffle.status as AdminDashboardDTO["raffles"][0]["status"],
        ticketCount: raffle.ticket_count as number,
        ticketPrice: Number(raffle.ticket_price),
        soldTickets: raffle.sold_tickets as number,
        drawDate: raffle.draw_date as string,
        skinName: skin?.name ?? "Skin nao encontrada",
        skinImage: skin?.image ?? "/new-logo.png",
      };
    }),
    purchases: (purchaseRows ?? []).map((purchase) => {
      const raffle = (raffleRows ?? []).find((r) => r.id === purchase.raffle_id);
      return {
        id: purchase.id as string,
        userId: purchase.user_id as string,
        raffleId: purchase.raffle_id as string,
        date: purchase.date as string,
        tickets: purchase.tickets as number,
        total: Number(purchase.total),
        status: purchase.status as "pago" | "pendente" | "cancelado",
        customerName:
          profileMap.get(purchase.user_id as string) ?? "Cliente removido",
        raffleTitle: (raffle?.title as string) ?? "Rifa nao encontrada",
      };
    }),
    salesHistory: [],
    skinSales: mapSkinRowsToStoreSales(skinRowList),
    financialEntries: (financialRows ?? []).map((entry) => ({
      id: entry.id as string,
      skinId: (entry.skin_id as string) ?? "",
      raffleId: (entry.raffle_id as string) ?? null,
      kind: entry.kind as "custo" | "receita" | "taxa" | "lucro_realizado",
      label: entry.label as string,
      amount: Number(entry.amount),
      date: entry.date as string,
    })),
  };
});

export const getPublicRaffles = cache(async () => {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return raffles.map((raffle) => {
      const skin = seedSkins.find((item) => item.id === raffle.skinId);
      return {
        id: raffle.id,
        title: raffle.title,
        status: raffle.status,
        ticketCount: raffle.ticketCount,
        ticketPrice: raffle.ticketPrice,
        soldTickets: raffle.soldTickets,
        drawDate: raffle.drawDate,
        skinName: skin?.name ?? "Skin nao encontrada",
        skinImage: skin?.image ?? "/new-logo.png",
        rarity: skin?.rarity ?? "Raridade pendente",
      };
    });
  }

  const { data: raffleRows } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "ativa");

  const skinIds = [...new Set((raffleRows ?? []).map((r) => r.skin_id as string))];
  const { data: skinRows } = skinIds.length
    ? await supabase.from("skins").select("id, name, image_url, rarity").in("id", skinIds)
    : { data: [] };

  const skinMap = new Map(
    (skinRows ?? []).map((s) => [
      s.id as string,
      {
        name: s.name as string,
        image: (s.image_url as string) || "/new-logo.png",
        rarity: (s.rarity as string) || "Raridade pendente",
      },
    ])
  );

  return (raffleRows ?? []).map((raffle) => {
    const skin = skinMap.get(raffle.skin_id as string);
    return {
      id: raffle.id as string,
      title: raffle.title as string,
      status: raffle.status as RaffleStatus,
      ticketCount: raffle.ticket_count as number,
      ticketPrice: Number(raffle.ticket_price),
      soldTickets: raffle.sold_tickets as number,
      drawDate: raffle.draw_date as string,
      skinName: skin?.name ?? "Skin nao encontrada",
      skinImage: skin?.image ?? "/new-logo.png",
      rarity: skin?.rarity ?? "Raridade pendente",
    };
  });
});

export function hasRole(
  user: { role: UserRole } | null,
  allowedRoles: UserRole[]
): boolean {
  return !!user && allowedRoles.includes(user.role);
}

export type SkinUpsertInput = Omit<Skin, "id"> & { id?: string };

export type UpsertSkinResult = {
  skin: Skin | null;
  error?: string;
};

async function countFeaturedSkins(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOrNull>>>,
  excludeSkinId?: string
): Promise<number> {
  let query = supabase
    .from("skins")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  if (excludeSkinId) {
    query = query.neq("id", excludeSkinId);
  }

  const { count } = await query;
  return count ?? 0;
}

async function upsertFinancialEntry(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOrNull>>>,
  entry: {
    skinId: string;
    kind: "custo" | "receita" | "taxa" | "lucro_realizado";
    label: string;
    amount: number;
    date: string;
    raffleId?: string | null;
  }
): Promise<void> {
  const { data: existing } = await supabase
    .from("financial_entries")
    .select("id")
    .eq("skin_id", entry.skinId)
    .eq("kind", entry.kind)
    .maybeSingle();

  const payload = {
    skin_id: entry.skinId,
    raffle_id: entry.raffleId ?? null,
    kind: entry.kind,
    label: entry.label,
    amount: entry.amount,
    date: entry.date,
  };

  if (existing?.id) {
    await supabase
      .from("financial_entries")
      .update(payload)
      .eq("id", existing.id as string);
    return;
  }

  await supabase.from("financial_entries").insert(payload);
}

async function syncFinancialEntriesForSkin(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOrNull>>>,
  skin: Skin
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  if (
    skin.paidValue > 0 &&
    (skin.status === "em_estoque" || skin.status === "em_rifa")
  ) {
    await upsertFinancialEntry(supabase, {
      skinId: skin.id,
      kind: "custo",
      label: `Custo — ${skin.name}`,
      amount: skin.paidValue,
      date: today,
    });
  }

  if (skin.status === "vendida" || skin.status === "entregue") {
    const revenue =
      skin.listPrice > 0 ? skin.listPrice : skin.estimatedMarketValue;
    const profit = Math.max(0, revenue - skin.paidValue);

    await upsertFinancialEntry(supabase, {
      skinId: skin.id,
      kind: "receita",
      label: `Venda — ${skin.name}`,
      amount: revenue,
      date: today,
    });

    await upsertFinancialEntry(supabase, {
      skinId: skin.id,
      kind: "lucro_realizado",
      label: `Lucro — ${skin.name}`,
      amount: profit,
      date: today,
    });
  }
}

export async function upsertSkin(input: SkinUpsertInput): Promise<UpsertSkinResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { skin: null, error: "Supabase nao configurado." };
  }

  if (input.isFeatured) {
    if (!isPublicStoreEligible(input as Skin)) {
      return {
        skin: null,
        error:
          "Somente skins em estoque publicaveis (nome, preco e imagem) podem ir para destaque.",
      };
    }

    const featuredCount = await countFeaturedSkins(supabase, input.id);
    if (featuredCount >= FEATURED_SKINS_LIMIT) {
      return {
        skin: null,
        error: `Limite de ${FEATURED_SKINS_LIMIT} skins em destaque atingido.`,
      };
    }
  }

  const payload = {
    name: input.name,
    weapon: input.weapon,
    pattern: input.pattern,
    float: input.float,
    rarity: input.rarity,
    wear_label: input.wearLabel,
    is_stat_trak: input.isStatTrak,
    image_url: input.image,
    list_price: input.listPrice,
    suggested_price: input.suggestedPrice,
    stickers: input.stickers,
    paid_value: input.paidValue,
    estimated_market_value: input.estimatedMarketValue,
    desired_profit_value: input.desiredProfitValue,
    desired_profit_percent: input.desiredProfitPercent,
    ticket_count: input.ticketCount,
    ticket_price: input.ticketPrice,
    status: input.status,
    internal_notes: input.internalNotes,
    is_featured: input.isFeatured,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("skins")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error || !data) {
      return {
        skin: null,
        error: error?.message ?? "Nao foi possivel atualizar a skin.",
      };
    }
    const skin = mapSkinRow(data as DbSkinRow);
    await syncFinancialEntriesForSkin(supabase, skin);
    return { skin };
  }

  const { data, error } = await supabase
    .from("skins")
    .insert(payload)
    .select("*")
    .single();
  if (error || !data) {
    return {
      skin: null,
      error: error?.message ?? "Nao foi possivel criar a skin.",
    };
  }
  const skin = mapSkinRow(data as DbSkinRow);
  await syncFinancialEntriesForSkin(supabase, skin);
  return { skin };
}

export type CreateRaffleInput = {
  skin: SkinUpsertInput & { id?: string };
  title: string;
  drawDate: string;
};

export type CreateRaffleResult = {
  raffleId?: string;
  skin?: Skin;
  error?: string;
};

export async function createRaffleFromSkin(
  input: CreateRaffleInput
): Promise<CreateRaffleResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { error: "Supabase nao configurado." };
  }

  const skinResult = await upsertSkin({
    ...input.skin,
    status: "em_rifa",
  });
  if (!skinResult.skin) {
    return { error: skinResult.error ?? "Nao foi possivel salvar a skin da rifa." };
  }

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      skin_id: skinResult.skin.id,
      title: input.title.trim() || skinResult.skin.name,
      status: "ativa",
      ticket_count: skinResult.skin.ticketCount,
      ticket_price: skinResult.skin.ticketPrice,
      sold_tickets: 0,
      draw_date: input.drawDate,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Nao foi possivel criar a rifa.",
      skin: skinResult.skin,
    };
  }

  return {
    raffleId: data.id as string,
    skin: skinResult.skin,
  };
}

export type UpdateRaffleInput = {
  raffleId: string;
  title: string;
  drawDate: string;
  ticketCount: number;
  ticketPrice: number;
  status: RaffleStatus;
};

export type UpdateRaffleResult = {
  raffle?: AdminDashboardDTO["raffles"][0];
  error?: string;
};

export async function updateRaffle(
  input: UpdateRaffleInput
): Promise<UpdateRaffleResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { error: "Supabase nao configurado." };
  }

  const { data, error } = await supabase
    .from("raffles")
    .update({
      title: input.title.trim(),
      draw_date: input.drawDate,
      ticket_count: input.ticketCount,
      ticket_price: input.ticketPrice,
      status: input.status,
    })
    .eq("id", input.raffleId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Nao foi possivel atualizar a rifa.",
    };
  }

  const { data: skinRow } = await supabase
    .from("skins")
    .select("id, name, image_url")
    .eq("id", data.skin_id as string)
    .maybeSingle();

  return {
    raffle: {
      id: data.id as string,
      skinId: data.skin_id as string,
      title: data.title as string,
      status: data.status as RaffleStatus,
      ticketCount: data.ticket_count as number,
      ticketPrice: Number(data.ticket_price),
      soldTickets: data.sold_tickets as number,
      drawDate: data.draw_date as string,
      skinName: (skinRow?.name as string) ?? "Skin nao encontrada",
      skinImage: (skinRow?.image_url as string) || "/new-logo.png",
    },
  };
}

export async function updateSkinImageUrl(
  skinId: string,
  imageUrl: string
): Promise<boolean> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) return false;

  const { error } = await supabase
    .from("skins")
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", skinId);
  return !error;
}
