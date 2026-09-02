import Link from "next/link";
import { and, eq, inArray, like } from "drizzle-orm";
import { db } from "@/database/client";
import { opportunities } from "@/database/schema";
import { requireUser } from "@/lib/auth/session";
import { MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS, rankMarketplaceOpportunities } from "@/lib/marketplace-radar";
import { formatBRL } from "@/lib/money";

export default async function MarketplaceRadarPage() {
  const user = await requireUser();
  const marketplaceItems = await db.select().from(opportunities).where(and(
    eq(opportunities.userId, user.userId),
    like(opportunities.source, "%Facebook Marketplace%"),
    inArray(opportunities.status, ["EM_ANALISE", "NEGOCIACAO"]),
  )).all();
  const recommendations = rankMarketplaceOpportunities(marketplaceItems);

  return <div className="grid gap-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-moss dark:text-lime">RADAR DE COMPRA</p><h1 className="text-3xl font-black">Marketplace dentro do preço</h1><p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">Mostra anúncios cadastrados do Facebook Marketplace dentro do seu teto ou até {formatBRL(MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS)} acima para negociação. Itens proibidos são excluídos.</p></div><Link className="button" href="/oportunidades/nova">Adicionar anúncio</Link></header>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3"><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">ANÚNCIOS EM ANÁLISE</p><p className="mt-1 text-3xl font-black">{marketplaceItems.length}</p></article><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">RECOMENDADOS</p><p className="mt-1 text-3xl font-black text-moss dark:text-lime">{recommendations.length}</p></article><article className="panel col-span-2 p-4 sm:col-span-1"><p className="text-xs font-bold text-[var(--muted)]">TOLERÂNCIA</p><p className="mt-1 text-3xl font-black">+ {formatBRL(MARKETPLACE_NEGOTIATION_TOLERANCE_CENTS)}</p></article></section>

    {!recommendations.length ? <section className="panel p-8 text-center"><h2 className="text-xl font-black">Nenhuma recomendação agora</h2><p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">Cadastre ou importe anúncios do Facebook Marketplace. O radar reconhecerá o modelo pela sua tabela e exibirá apenas os que respeitam o limite.</p><Link className="button mt-5 inline-flex" href="/oportunidades/nova">Cadastrar anúncio</Link></section> : <section className="grid gap-3">{recommendations.map((result) => <Link href={`/oportunidades/${result.item.id}`} className="panel grid gap-4 p-5 hover:border-moss sm:grid-cols-[1.4fr_repeat(3,1fr)_auto] sm:items-center" key={result.item.id}><div><span className={`badge ${result.status === "DENTRO_DO_TETO" ? "text-moss dark:text-lime" : "text-orange-700 dark:text-orange-300"}`}>{result.status === "DENTRO_DO_TETO" ? "COMPRAR" : "NEGOCIAR"}</span><h2 className="mt-2 font-black">{result.item.title}</h2><p className="text-xs text-[var(--muted)]">{result.reference.model}</p></div><div><p className="text-xs text-[var(--muted)]">Preço pedido</p><p className="font-black">{formatBRL(result.item.askingPriceCents)}</p></div><div><p className="text-xs text-[var(--muted)]">Seu teto</p><p className="font-black text-moss dark:text-lime">{formatBRL(result.buyMaxCents)}</p>{result.negotiationNeededCents > 0 && <p className="text-xs text-orange-700 dark:text-orange-300">Baixar {formatBRL(result.negotiationNeededCents)}</p>}</div><div><p className="text-xs text-[var(--muted)]">Lucro bruto estimado</p><p className="font-black">{formatBRL(result.estimatedGrossProfitCents)}</p><p className="text-xs text-[var(--muted)]">Venda-base {formatBRL(result.reference.saleReferenceCents)}</p></div><span aria-hidden>→</span></Link>)}</section>}

    <p className="text-xs text-[var(--muted)]">O radar não busca anúncios automaticamente e não confirma disponibilidade. O Facebook Marketplace não oferece uma busca pública adequada para esta finalidade; use cadastro manual, link ou importação.</p>
  </div>;
}
