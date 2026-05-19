export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const RAFFLE_STATUSES = [
  "ativa",
  "encerrada",
  "ganha",
  "perdida",
  "aguardando_sorteio",
] as const;
export type RaffleStatus = (typeof RAFFLE_STATUSES)[number];

export const SKIN_STATUSES = [
  "em_estoque",
  "em_rifa",
  "vendida",
  "entregue",
  "arquivada",
] as const;
export type SkinStatus = (typeof SKIN_STATUSES)[number];

export type ProfitMode = "percent" | "fixed";
export type TicketConstraintMode = "ticketCount" | "ticketPrice";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type TestCredential = {
  email: string;
  password: string;
};

export type Skin = {
  id: string;
  name: string;
  weapon: string;
  pattern: string;
  float: number | null;
  rarity: string;
  image: string;
  paidValue: number;
  estimatedMarketValue: number;
  desiredProfitValue: number;
  desiredProfitPercent: number;
  ticketCount: number;
  ticketPrice: number;
  status: SkinStatus;
  internalNotes: string;
};

export type Raffle = {
  id: string;
  skinId: string;
  title: string;
  status: RaffleStatus;
  ticketCount: number;
  ticketPrice: number;
  soldTickets: number;
  drawDate: string;
};

export type Ticket = {
  id: string;
  raffleId: string;
  userId: string;
  number: string;
  status: RaffleStatus;
};

export type Purchase = {
  id: string;
  userId: string;
  raffleId: string;
  date: string;
  tickets: number;
  total: number;
  status: "pago" | "pendente" | "cancelado";
};

export type SaleHistoryEntry = {
  id: string;
  userId: string;
  date: string;
  type: "revenda" | "indicacao";
  description: string;
  value: number;
};

export type FinancialEntry = {
  id: string;
  skinId: string;
  raffleId: string | null;
  kind: "custo" | "receita" | "taxa" | "lucro_realizado";
  label: string;
  amount: number;
  date: string;
};

export type Activity = {
  id: string;
  label: string;
  date: string;
  tone: "ruby" | "sapphire" | "neutral";
};

export type CustomerDashboardDTO = {
  user: Pick<User, "id" | "name" | "email" | "role">;
  summary: {
    totalSpent: number;
    activeRaffles: number;
    activeTickets: number;
    prizesWon: number;
  };
  raffles: Array<{
    id: string;
    title: string;
    skinName: string;
    status: RaffleStatus;
    tickets: string[];
    drawDate: string;
    ticketPrice: number;
  }>;
  purchases: Array<{
    id: string;
    raffleTitle: string;
    date: string;
    tickets: number;
    total: number;
    status: Purchase["status"];
  }>;
  prizes: Array<{
    id: string;
    title: string;
    skinName: string;
    date: string;
  }>;
  salesHistory: SaleHistoryEntry[];
  activities: Activity[];
};

export type AdminDashboardDTO = {
  user: Pick<User, "id" | "name" | "email" | "role">;
  summary: {
    grossRevenue: number;
    totalCost: number;
    estimatedFees: number;
    netRevenue: number;
    expectedProfit: number;
    realizedProfit: number;
    stockValue: number;
  };
  skins: Skin[];
  raffles: Array<Raffle & { skinName: string; skinImage: string }>;
  purchases: Array<Purchase & { customerName: string; raffleTitle: string }>;
  salesHistory: Array<SaleHistoryEntry & { customerName: string }>;
  financialEntries: FinancialEntry[];
};
