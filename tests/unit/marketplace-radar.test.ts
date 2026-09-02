import { describe, expect, it } from "vitest";
import { evaluateMarketplaceOpportunity, rankMarketplaceOpportunities } from "@/lib/marketplace-radar";

const item = { id: "1", title: "PS4 Slim usado", source: "Facebook Marketplace", askingPriceCents: 100000 };

describe("radar do Marketplace", () => {
  it("recomenda item dentro do teto", () => {
    expect(evaluateMarketplaceOpportunity(item)?.status).toBe("DENTRO_DO_TETO");
  });

  it("aceita até R$ 50 acima para negociar", () => {
    const result = evaluateMarketplaceOpportunity({ ...item, askingPriceCents: 105000 });
    expect(result?.status).toBe("NEGOCIAR");
    expect(result?.negotiationNeededCents).toBe(5000);
  });

  it("exclui acima da tolerância, outras fontes e itens proibidos", () => {
    expect(evaluateMarketplaceOpportunity({ ...item, askingPriceCents: 105001 })).toBeNull();
    expect(evaluateMarketplaceOpportunity({ ...item, source: "OLX" })).toBeNull();
    expect(evaluateMarketplaceOpportunity({ ...item, title: "Xbox One Fat" })).toBeNull();
  });

  it("ordena compras antes de negociações", () => {
    const results = rankMarketplaceOpportunities([{ ...item, id: "negociar", askingPriceCents: 105000 }, { ...item, id: "comprar", askingPriceCents: 95000 }]);
    expect(results.map((result) => result.item.id)).toEqual(["comprar", "negociar"]);
  });
});
