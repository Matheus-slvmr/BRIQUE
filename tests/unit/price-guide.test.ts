import { describe, expect, it } from "vitest";
import { evaluatePriceGuide } from "@/lib/price-guide";

describe("tabela pessoal de compra e venda", () => {
  it("encontra o PS4 Slim antes do PS4 genérico", () => {
    const result = evaluatePriceGuide({ title: "Playstation PS4 Slim usado", askingPriceCents: 95000 });
    expect(result.reference?.model).toBe("PS4 Slim");
    expect(result.adjustedBuyMaxCents).toBe(100000);
  });

  it("bloqueia modelos explicitamente proibidos", () => {
    expect(evaluatePriceGuide({ title: "Xbox One Fat 500GB" }).blockedReasons.length).toBeGreaterThan(0);
    expect(evaluatePriceGuide({ title: "iPhone 16e novo" }).blockedReasons.length).toBeGreaterThan(0);
  });

  it("reduz o teto de iPhone com bateria e tela trocadas", () => {
    const result = evaluatePriceGuide({ title: "iPhone 13", defects: "bateria 74% e tela trocada" });
    expect(result.reductionPercent).toBe(45);
    expect(result.adjustedBuyMaxCents).toBe(82500);
  });
});
