export type AcquisitionCosts = {
  purchasePriceCents: number; travelCents?: number; purchaseShippingCents?: number; partsCents?: number;
  repairCents?: number; cleaningCents?: number; packagingCents?: number; otherPurchaseCents?: number;
};

export type SaleCosts = {
  salePriceCents: number; platformFeeCents?: number; sellerShippingCents?: number; negotiatedDiscountCents?: number;
  taxesCents?: number; otherSaleCents?: number;
};

const sum = (...values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);

export function acquisitionCost(input: AcquisitionCosts) {
  return sum(input.purchasePriceCents, input.travelCents, input.purchaseShippingCents, input.partsCents, input.repairCents, input.cleaningCents, input.packagingCents, input.otherPurchaseCents);
}

export function netRevenue(input: SaleCosts) {
  return input.salePriceCents - sum(input.platformFeeCents, input.sellerShippingCents, input.negotiatedDiscountCents, input.taxesCents, input.otherSaleCents);
}

export function financialResult(acquisition: AcquisitionCosts, sale: SaleCosts) {
  const costCents = acquisitionCost(acquisition);
  const revenueCents = netRevenue(sale);
  const profitCents = revenueCents - costCents;
  return {
    costCents, revenueCents, profitCents,
    roi: costCents > 0 ? (profitCents / costCents) * 100 : 0,
    margin: revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0,
    breakEvenCents: costCents + sum(sale.platformFeeCents, sale.sellerShippingCents, sale.negotiatedDiscountCents, sale.taxesCents, sale.otherSaleCents)
  };
}

export function maximumPurchasePrice(estimatedNetRevenueCents: number, additionalCostsCents: number, minimumProfitCents: number) {
  return estimatedNetRevenueCents - additionalCostsCents - minimumProfitCents;
}

export type Scenario = ReturnType<typeof financialResult> & { name: "Pessimista" | "Provável" | "Otimista"; salePriceCents: number; profitPerDayCents: number };

export function buildScenarios(acquisition: AcquisitionCosts, market: { q1Cents: number; medianCents: number; q3Cents: number }, daysToSell: number, saleCostRate = 0): Scenario[] {
  const definitions = [["Pessimista", market.q1Cents], ["Provável", market.medianCents], ["Otimista", market.q3Cents]] as const;
  return definitions.map(([name, salePriceCents]) => {
    const result = financialResult(acquisition, { salePriceCents, platformFeeCents: Math.round(salePriceCents * saleCostRate) });
    return { name, salePriceCents, ...result, profitPerDayCents: Math.round(result.profitCents / Math.max(daysToSell, 1)) };
  });
}
