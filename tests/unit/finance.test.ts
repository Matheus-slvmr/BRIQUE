import { describe, expect, it } from "vitest";
import { acquisitionCost, buildScenarios, financialResult, maximumPurchasePrice, netRevenue } from "@/lib/finance/calculations";
describe("fórmulas financeiras em centavos",()=>{
  const acquisition={purchasePriceCents:100_000,travelCents:2_000,purchaseShippingCents:3_000,partsCents:5_000,repairCents:10_000,cleaningCents:1_000,packagingCents:500,otherPurchaseCents:500};
  it("soma o custo completo de aquisição",()=>expect(acquisitionCost(acquisition)).toBe(122_000));
  it("subtrai todos os custos da receita",()=>expect(netRevenue({salePriceCents:180_000,platformFeeCents:18_000,sellerShippingCents:5_000,negotiatedDiscountCents:2_000,taxesCents:1_000,otherSaleCents:4_000})).toBe(150_000));
  it("calcula lucro, ROI, margem e equilíbrio",()=>{const result=financialResult(acquisition,{salePriceCents:180_000,platformFeeCents:18_000});expect(result.profitCents).toBe(40_000);expect(result.roi).toBeCloseTo(32.786,2);expect(result.margin).toBeCloseTo(24.691,2);expect(result.breakEvenCents).toBe(140_000)});
  it("calcula preço máximo sem arredondamento de ponto flutuante",()=>expect(maximumPurchasePrice(150_000,22_000,30_000)).toBe(98_000));
  it("gera os três cenários",()=>{const scenarios=buildScenarios(acquisition,{q1Cents:140_000,medianCents:160_000,q3Cents:190_000},20,.1);expect(scenarios.map(s=>s.name)).toEqual(["Pessimista","Provável","Otimista"]);expect(scenarios[1].profitPerDayCents).toBe(1_100)});
  it("não divide por zero",()=>{const result=financialResult({purchasePriceCents:0},{salePriceCents:0});expect(result.roi).toBe(0);expect(result.margin).toBe(0)});
});
