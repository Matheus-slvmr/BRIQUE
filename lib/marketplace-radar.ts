import { evaluatePriceGuide } from "@/lib/price-guide";

export const MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS = 5_000;

export type RadarOpportunity = {
  id: string;
  title: string;
  source: string;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  version?: string | null;
  description?: string | null;
  defects?: string | null;
  specifications?: string | null;
  askingPriceCents: number;
};

export function evaluateMarketplaceOpportunity(item: RadarOpportunity) {
  const guide = evaluatePriceGuide(item);
  const buyMaxCents = guide.adjustedBuyMaxCents;

  if (!item.source.toLowerCase().includes("facebook marketplace")) return null;
  if (!guide.reference || buyMaxCents === null || guide.blockedReasons.length > 0) return null;

  const differenceFromLimitCents = item.askingPriceCents - buyMaxCents;
  if (differenceFromLimitCents > MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS) return null;

  return {
    item,
    reference: guide.reference,
    buyMaxCents,
    maximumRadarPriceCents: buyMaxCents + MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS,
    differenceFromLimitCents,
    negotiationNeededCents: Math.max(0, differenceFromLimitCents),
    estimatedGrossProfitCents: guide.reference.saleReferenceCents - Math.min(item.askingPriceCents, buyMaxCents),
    status: differenceFromLimitCents <= 0 ? "DENTRO_DO_TETO" as const : "NEGOCIAR" as const,
  };
}

export function rankMarketplaceOpportunities(items: RadarOpportunity[]) {
  return items
    .map(evaluateMarketplaceOpportunity)
    .filter((result): result is NonNullable<typeof result> => result !== null)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "DENTRO_DO_TETO" ? -1 : 1;
      return b.estimatedGrossProfitCents - a.estimatedGrossProfitCents;
    });
}
