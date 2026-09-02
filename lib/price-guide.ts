export type PriceGuideEntry = {
  category: "Videogames" | "iPhones" | "Televisões" | "Bicicletas";
  model: string;
  buyMaxCents: number;
  saleReferenceCents: number;
  keywords: string[];
};

export const PRICE_GUIDE_UPDATED_AT = "2026-08-05";

export const priceGuideEntries: PriceGuideEntry[] = [
  { category: "Videogames", model: "PS4 Pro", buyMaxCents: 130000, saleReferenceCents: 160000, keywords: ["ps4 pro", "playstation 4 pro"] },
  { category: "Videogames", model: "PS4 Slim", buyMaxCents: 100000, saleReferenceCents: 128000, keywords: ["ps4 slim", "playstation 4 slim"] },
  { category: "Videogames", model: "PS4 Fat", buyMaxCents: 90000, saleReferenceCents: 120000, keywords: ["ps4 fat", "playstation 4 fat", "ps4"] },
  { category: "Videogames", model: "PS5", buyMaxCents: 250000, saleReferenceCents: 295000, keywords: ["ps5", "playstation 5"] },
  { category: "Videogames", model: "PS3", buyMaxCents: 48000, saleReferenceCents: 70000, keywords: ["ps3", "playstation 3"] },
  { category: "Videogames", model: "PS2", buyMaxCents: 20000, saleReferenceCents: 35000, keywords: ["ps2", "playstation 2"] },
  { category: "Videogames", model: "Xbox Series S", buyMaxCents: 110000, saleReferenceCents: 150000, keywords: ["xbox series s"] },
  { category: "Videogames", model: "Xbox One S", buyMaxCents: 70000, saleReferenceCents: 90000, keywords: ["xbox one s"] },
  { category: "Videogames", model: "Xbox 360", buyMaxCents: 40000, saleReferenceCents: 65000, keywords: ["xbox 360"] },
  { category: "iPhones", model: "iPhone 16", buyMaxCents: 320000, saleReferenceCents: 360000, keywords: ["iphone 16"] },
  { category: "iPhones", model: "iPhone 15", buyMaxCents: 240000, saleReferenceCents: 290000, keywords: ["iphone 15"] },
  { category: "iPhones", model: "iPhone 14", buyMaxCents: 190000, saleReferenceCents: 210000, keywords: ["iphone 14"] },
  { category: "iPhones", model: "iPhone 13", buyMaxCents: 150000, saleReferenceCents: 180000, keywords: ["iphone 13"] },
  { category: "iPhones", model: "iPhone 12", buyMaxCents: 85000, saleReferenceCents: 110000, keywords: ["iphone 12"] },
  { category: "iPhones", model: "iPhone 11", buyMaxCents: 70000, saleReferenceCents: 90000, keywords: ["iphone 11"] },
  { category: "iPhones", model: "iPhone XR", buyMaxCents: 50000, saleReferenceCents: 70000, keywords: ["iphone xr"] },
  { category: "Televisões", model: "Smart TV 50 pol.", buyMaxCents: 85000, saleReferenceCents: 115000, keywords: ["tv 50", "smart 50", "50 polegadas", "50 pol"] },
  { category: "Televisões", model: "Smart TV 43 pol.", buyMaxCents: 55000, saleReferenceCents: 85000, keywords: ["tv 43", "smart 43", "43 polegadas", "43 pol"] },
  { category: "Televisões", model: "Smart TV 32 pol.", buyMaxCents: 40000, saleReferenceCents: 55000, keywords: ["tv 32", "smart 32", "32 polegadas", "32 pol"] },
  { category: "Bicicletas", model: "Aro 29 — quadro chato", buyMaxCents: 45000, saleReferenceCents: 70000, keywords: ["aro 29 quadro chato", "quadro chato"] },
  { category: "Bicicletas", model: "Aro 29 — quadro redondo", buyMaxCents: 40000, saleReferenceCents: 60000, keywords: ["aro 29 quadro redondo", "quadro redondo"] },
];

export const priceGuideRules = [
  { category: "Videogames", level: "block", text: "Não comprar PS4 sem leitor de disco." },
  { category: "Videogames", level: "block", text: "Não comprar Xbox One Fat: baixa saída." },
  { category: "Videogames", level: "info", text: "Bloqueado/desbloqueado, memória, controles e jogos não alteram esta tabela-base." },
  { category: "iPhones", level: "block", text: "Não comprar iPhone Mini, 16e, SE, com chip off ou bloqueado." },
  { category: "iPhones", level: "warn", text: "Bateria trocada ou até 75% reduz o teto em 15%; tela trocada reduz em 30%." },
  { category: "iPhones", level: "warn", text: "iPhone 13 e anteriores somente com bateria acima de 75%." },
  { category: "iPhones", level: "info", text: "Memória só altera o valor a partir de 512 GB; caixa, nota e carregador agregam, mas não mudam a base." },
  { category: "iPhones", level: "warn", text: "Pro/Pro Max exigem média local. Cores vermelho, rosa, amarelo e laranja têm saída pior; do 15 em diante a saída é menor." },
  { category: "Motos", level: "warn", text: "Comprar com pelo menos R$ 3.000 de margem abaixo da média/FIPE." },
  { category: "Carros", level: "warn", text: "Comprar no mínimo 20% abaixo da Tabela FIPE." },
] as const;

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function evaluatePriceGuide(input: { title?: string | null; category?: string | null; brand?: string | null; model?: string | null; version?: string | null; description?: string | null; defects?: string | null; specifications?: string | null; askingPriceCents?: number | null }, entries: PriceGuideEntry[] = priceGuideEntries) {
  const text = normalize([input.title, input.category, input.brand, input.model, input.version, input.description, input.defects, input.specifications].filter(Boolean).join(" "));
  const reference = entries.find((entry) => entry.keywords.some((keyword) => text.includes(normalize(keyword))));
  const blockedReasons: string[] = [];
  const warnings: string[] = [];
  let reduction = 0;

  if ((text.includes("ps4") || text.includes("playstation 4")) && /sem\s+leitor|leitor\s+(nao\s+funciona|defeito|quebrado)/.test(text)) blockedReasons.push("PS4 sem leitor de disco não entra na compra.");
  if (text.includes("xbox one fat")) blockedReasons.push("Xbox One Fat não entra na compra por baixa saída.");
  if (/iphone\s*(mini|16e|se)\b/.test(text)) blockedReasons.push("Este modelo de iPhone está na lista de não comprar.");
  if (text.includes("iphone") && (text.includes("chip off") || text.includes("bloqueado"))) blockedReasons.push("iPhone com chip off ou bloqueado não entra na compra.");

  if (text.includes("iphone")) {
    const battery = text.match(/bateria\D{0,18}(\d{2,3})\s*%/);
    if (text.includes("bateria trocada") || (battery && Number(battery[1]) <= 75)) reduction += 0.15;
    if (text.includes("tela trocada")) reduction += 0.30;
    if (reference && ["iPhone XR", "iPhone 11", "iPhone 12", "iPhone 13"].includes(reference.model) && !battery) warnings.push("Confirme bateria acima de 75% antes de comprar.");
    if (/iphone\s*(15|16)\b/.test(text)) warnings.push("Saída de venda menor a partir do iPhone 15.");
    if (/vermelh|rosa|amarel|laranj/.test(text)) warnings.push("Esta cor costuma ter saída pior.");
    if (/pro\s*max|\bpro\b/.test(text)) warnings.push("Modelos Pro e Pro Max precisam da média atual da sua cidade.");
  }

  const adjustedBuyMaxCents = reference ? Math.round(reference.buyMaxCents * Math.max(0, 1 - reduction)) : null;
  if (reference && input.askingPriceCents && adjustedBuyMaxCents && input.askingPriceCents > adjustedBuyMaxCents) warnings.push("O preço pedido está acima do seu teto de compra.");
  return { reference, adjustedBuyMaxCents, reductionPercent: Math.round(reduction * 100), blockedReasons, warnings };
}
