import { PRICE_GUIDE_UPDATED_AT, priceGuideEntries, priceGuideRules } from "@/lib/price-guide";
import { formatBRL } from "@/lib/money";

export default function ReferencesPage() {
  const categories = [...new Set(priceGuideEntries.map((entry) => entry.category))];
  return <div className="grid gap-6">
    <header><p className="text-sm font-bold text-moss dark:text-lime">SUA REGRA DE COMPRA</p><h1 className="text-3xl font-black">Itens × valores</h1><p className="mt-1 text-sm text-[var(--muted)]">Atualizada em {new Date(`${PRICE_GUIDE_UPDATED_AT}T12:00:00`).toLocaleDateString("pt-BR")}. Valores-base informados por você; confirme o mercado antes de fechar.</p></header>
    {categories.map((category) => <section className="panel overflow-hidden" key={category}><div className="border-b border-[var(--border)] p-5"><h2 className="text-xl font-black">{category}</h2><p className="text-sm text-[var(--muted)]">Teto de compra / referência de venda</p></div><div className="overflow-x-auto"><table><thead><tr><th>Item</th><th>Comprar até</th><th>Venda-base</th><th>Margem bruta-base</th></tr></thead><tbody>{priceGuideEntries.filter((entry) => entry.category === category).map((entry) => <tr key={entry.model}><td className="font-bold">{entry.model}</td><td className="font-black text-moss dark:text-lime">{formatBRL(entry.buyMaxCents)}</td><td>{formatBRL(entry.saleReferenceCents)}</td><td>{formatBRL(entry.saleReferenceCents - entry.buyMaxCents)}</td></tr>)}</tbody></table></div></section>)}
    <section className="panel p-5"><h2 className="text-xl font-black">Regras de decisão</h2><div className="mt-4 grid gap-3">{priceGuideRules.map((rule) => <article className={`rounded-xl border p-4 ${rule.level === "block" ? "border-red-300 bg-red-50 dark:bg-red-950/20" : rule.level === "warn" ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20" : "border-[var(--border)]"}`} key={rule.text}><p className="text-xs font-black uppercase text-[var(--muted)]">{rule.category}</p><p className="mt-1 text-sm font-semibold">{rule.text}</p></article>)}</div></section>
  </div>;
}
