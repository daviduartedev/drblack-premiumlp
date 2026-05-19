import "server-only";

import { cache } from "react";
import {
  financialEntries,
  purchases,
  raffles,
  salesHistory,
  skins,
  tickets,
  users,
} from "@/lib/ruby-safira-seed";
import type {
  AdminDashboardDTO,
  CustomerDashboardDTO,
  UserRole,
} from "@/lib/ruby-safira-types";

export const getUserByEmail = cache(async (email: string) =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
);

export const getUserById = cache(async (id: string) =>
  users.find((user) => user.id === id) ?? null
);

export const getCustomerDashboard = cache(
  async (userId: string): Promise<CustomerDashboardDTO | null> => {
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
        const skin = skins.find((item) => item.id === raffle.skinId);
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
          tone: "ruby",
        },
        {
          id: "act_002",
          label: "Premio Karambit marcado como ganho",
          date: "2026-05-12",
          tone: "sapphire",
        },
        {
          id: "act_003",
          label: "Indicacao convertida em credito interno",
          date: "2026-05-14",
          tone: "neutral",
        },
      ],
    };
  }
);

export const getAdminDashboard = cache(
  async (): Promise<AdminDashboardDTO> => {
    const admin = users.find((user) => user.role === "admin")!;
    const grossRevenue = financialEntries
      .filter((entry) => entry.kind === "receita")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCost = Math.abs(
      financialEntries
        .filter((entry) => entry.kind === "custo")
        .reduce((sum, entry) => sum + entry.amount, 0)
    );
    const estimatedFees = Math.abs(
      financialEntries
        .filter((entry) => entry.kind === "taxa")
        .reduce((sum, entry) => sum + entry.amount, 0)
    );
    const realizedProfit = financialEntries
      .filter((entry) => entry.kind === "lucro_realizado")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expectedProfit = skins.reduce(
      (sum, skin) => sum + skin.desiredProfitValue,
      0
    );

    return {
      user: {
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
        stockValue: skins
          .filter((skin) => skin.status === "em_estoque")
          .reduce((sum, skin) => sum + skin.estimatedMarketValue, 0),
      },
      skins,
      raffles: raffles.map((raffle) => {
        const skin = skins.find((item) => item.id === raffle.skinId);
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
      financialEntries,
    };
  }
);

export const getPublicRaffles = cache(async () =>
  raffles.map((raffle) => {
    const skin = skins.find((item) => item.id === raffle.skinId);
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
  })
);

export function hasRole(
  user: { role: UserRole } | null,
  allowedRoles: UserRole[]
): boolean {
  return !!user && allowedRoles.includes(user.role);
}
