import type { ProfitMode, TicketConstraintMode } from "@/lib/ruby-safira-types";

export type ProfitCalculatorInput = {
  paidValue: number;
  profitMode: ProfitMode;
  desiredProfitValue?: number;
  desiredProfitPercent?: number;
  ticketConstraintMode: TicketConstraintMode;
  ticketCount?: number;
  ticketPrice?: number;
  estimatedFeePercent?: number;
};

export type ProfitCalculatorResult = {
  targetRevenueBeforeFees: number;
  targetRevenueWithFees: number;
  estimatedFees: number;
  netRevenue: number;
  expectedProfit: number;
  suggestedTicketPrice: number;
  suggestedTicketCount: number;
  marginPercent: number;
  breakEvenTickets: number;
  breakEvenRevenue: number;
};

export type TicketPackageSuggestion = {
  ticketCount: number;
  ticketPrice: number;
  grossRevenue: number;
  expectedProfit: number;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const ceilCurrency = (value: number) => Math.ceil(value * 100) / 100;

function safePositive(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export function calculateRaffleProfit(
  input: ProfitCalculatorInput
): ProfitCalculatorResult {
  const paidValue = safePositive(input.paidValue, 0);
  const feePercent = Math.max(0, input.estimatedFeePercent ?? 0);
  const desiredProfit =
    input.profitMode === "percent"
      ? paidValue * (safePositive(input.desiredProfitPercent, 0) / 100)
      : safePositive(input.desiredProfitValue, 0);

  const targetRevenueBeforeFees = paidValue + desiredProfit;
  const targetRevenueWithFees =
    feePercent >= 100
      ? targetRevenueBeforeFees
      : targetRevenueBeforeFees / (1 - feePercent / 100);

  const suggestedTicketCount =
    input.ticketConstraintMode === "ticketCount"
      ? Math.round(safePositive(input.ticketCount, 1))
      : Math.max(
          1,
          Math.ceil(targetRevenueWithFees / safePositive(input.ticketPrice, 1))
        );

  const suggestedTicketPrice =
    input.ticketConstraintMode === "ticketPrice"
      ? ceilCurrency(safePositive(input.ticketPrice, targetRevenueWithFees))
      : ceilCurrency(targetRevenueWithFees / suggestedTicketCount);

  const grossRevenue = suggestedTicketCount * suggestedTicketPrice;
  const estimatedFees = grossRevenue * (feePercent / 100);
  const netRevenue = grossRevenue - estimatedFees;
  const expectedProfit = netRevenue - paidValue;

  return {
    targetRevenueBeforeFees: roundCurrency(targetRevenueBeforeFees),
    targetRevenueWithFees: roundCurrency(targetRevenueWithFees),
    estimatedFees: roundCurrency(estimatedFees),
    netRevenue: roundCurrency(netRevenue),
    expectedProfit: roundCurrency(expectedProfit),
    suggestedTicketPrice,
    suggestedTicketCount,
    marginPercent:
      netRevenue > 0 ? roundCurrency((expectedProfit / netRevenue) * 100) : 0,
    breakEvenTickets: Math.ceil(paidValue / suggestedTicketPrice),
    breakEvenRevenue: roundCurrency(paidValue),
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)}%`;
}

export function suggestTicketPackages(
  targetRevenue: number,
  paidValue: number,
  ticketCounts: number[]
): TicketPackageSuggestion[] {
  return [...new Set(ticketCounts)]
    .filter((count) => Number.isFinite(count) && count > 0)
    .sort((a, b) => a - b)
    .map((ticketCount) => {
      const ticketPrice = ceilCurrency(targetRevenue / ticketCount);
      const grossRevenue = roundCurrency(ticketCount * ticketPrice);
      return {
        ticketCount,
        ticketPrice,
        grossRevenue,
        expectedProfit: roundCurrency(grossRevenue - paidValue),
      };
    });
}
