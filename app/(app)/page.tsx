import Link from "next/link";
import { eq } from "drizzle-orm";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { db } from "@/database/client";
import { inventoryItems, ledgerEntries, opportunities, sales } from "@/database/schema";
import { requireUser } from "@/lib/auth/session";
import { getBusinessSettings } from "@/lib/local-settings";
import { formatBRL, formatPercent } from "@/lib/money";

export default async function Dashboard() {
  const user = await requireUser();
  const [ops, inventory, ledger, sold] = await Promise.all([
    db.select().from(opportunities).where(eq(opportunities.userId, user.userId)).all(),
    db.select().from(inventoryItems).where(eq(inventoryItems.userId, user.userId)).all(),
    db.select().from(ledgerEntries).where(eq(ledgerEntries.userId, user.userId)).all(),
    db.select({ sale: sales, item: inventoryItems, opportunity: opportunities }).from(sales).innerJoin(inventoryItems, eq(sales.inventoryItemId, inventoryItems.id)).innerJoin(opportunities, eq(inventoryItems.opportunityId, opportunities.id)).where(eq(inventoryItems.userId, user.userId)).all(),
  ]);
  const settings = getBusinessSettings(user.userId);
  const entries = ledger.filter((entry) => entry.direction === "ENTRADA" && entry.settledAt).reduce((sum, entry) => sum + entry.amountCents, 0);
  const exits = ledger.filter((entry) => entry.direction === "SAIDA" && entry.settledAt).reduce((sum, entry) => sum + entry.amountCents, 0);
  const balance = entries - exits;
  const available = Math.max(0, balance - settings.reserveCents);
  const invested = inventory.filter((item) => item.status !== "VENDIDO").reduce((sum, item) => sum + item.actualCostCents, 0);
  const profit = sold.reduce((sum, row) => sum + row.sale.receivedCents - row.item.actualCostCents, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyProfit = ledger.filter((entry) => entry.occurredAt.startsWith(currentMonth)).reduce((sum, entry) => sum + (entry.direction === "ENTRADA" ? entry.amountCents : -entry.amountCents), 0);
  const goalPercent = settings.monthlyGoalCents ? Math.max(0, monthlyProfit / settings.monthlyGoalCents * 100) : 0;
  const now = Date.now();
  const stale = inventory.filter((item) => item.status !== "VENDIDO" && (now - new Date(item.acquiredAt).getTime()) / 86400000 >= settings.staleDays);
  const warrantyAlerts = sold.filter((row) => row.sale.warrantyUntil && new Date(row.sale.warrantyUntil).getTime() >= now && new Date(row.sale.warrantyUntil).getTime() - now <= 14 * 86400000);
  const avgRoi = sold.length ? sold.reduce((sum, row) => sum + ((row.sale.receivedCents - row.item.actualCostCents) / row.item.actualCostCents) * 100, 0) / sold.length : 0;

  return <div className="grid gap-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-moss dark:text-lime">VISÃO DO NEGÓCIO</p><h1 className="text-3xl font-black">Seu brique, nos números.</h1><p className="text-sm text-[var(--muted)]">Tudo calculado localmente com os dados deste computador.</p></div><Link className="button" href="/oportunidades/nova">Analisar oportunidade</Link></header>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard label="Saldo de caixa" value={formatBRL(balance)} note="Lançamentos liquidados"/><MetricCard label="Disponível para comprar" value={formatBRL(available)} note={`Reserva preservada: ${formatBRL(settings.reserveCents)}`} tone="good"/><MetricCard label="Capital em estoque" value={formatBRL(invested)} tone="warn"/><MetricCard label="Lucro realizado" value={formatBRL(profit)} tone="good"/><MetricCard label="Em análise" value={String(ops.filter((item) => item.status === "EM_ANALISE").length)}/><MetricCard label="Estoque parado" value={String(stale.length)} tone={stale.length ? "warn" : undefined}/><MetricCard label="Vendidos" value={String(sold.length)}/><MetricCard label="ROI médio" value={sold.length ? formatPercent(avgRoi) : "—"}/></section>

    <section className="panel p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-black">Meta do mês</h2><p className="text-sm text-[var(--muted)]">Resultado líquido {formatBRL(monthlyProfit)} de {formatBRL(settings.monthlyGoalCents)}</p></div><Link className="button secondary" href="/configuracoes">Editar meta</Link></div><div className="mt-4 h-4 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full bg-moss" style={{ width: `${Math.min(100, goalPercent)}%` }}/></div><p className="mt-2 text-sm font-bold">{formatPercent(goalPercent)} atingido</p></section>

    {(stale.length > 0 || warrantyAlerts.length > 0) && <section className="grid gap-4 lg:grid-cols-2">{stale.length > 0 && <article className="panel p-5"><h2 className="text-xl font-black">Estoque parado</h2><p className="text-sm text-[var(--muted)]">Itens acima de {settings.staleDays} dias.</p><div className="mt-3 grid gap-2">{stale.slice(0, 6).map((item) => { const opportunity = ops.find((op) => op.id === item.opportunityId); return <Link className="rounded-xl border border-[var(--border)] p-3 text-sm font-bold" href={`/estoque/${item.id}`} key={item.id}>{opportunity?.title ?? "Item"} · {Math.floor((now - new Date(item.acquiredAt).getTime()) / 86400000)} dias</Link>; })}</div></article>}{warrantyAlerts.length > 0 && <article className="panel p-5"><h2 className="text-xl font-black">Garantias próximas</h2><p className="text-sm text-[var(--muted)]">Prazos que vencem nos próximos 14 dias.</p><div className="mt-3 grid gap-2">{warrantyAlerts.map((row) => <Link className="rounded-xl border border-[var(--border)] p-3 text-sm" href={`/estoque/${row.item.id}`} key={row.sale.id}><b>{row.opportunity.title}</b> · até {new Date(row.sale.warrantyUntil!).toLocaleDateString("pt-BR")}</Link>)}</div></article>}</section>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Link className="panel p-5 hover:border-moss" href="/captura"><b>Captura em lote</b><p className="mt-1 text-sm text-[var(--muted)]">Cole vários anúncios de uma vez.</p></Link><Link className="panel p-5 hover:border-moss" href="/favoritos"><b>Favoritos</b><p className="mt-1 text-sm text-[var(--muted)]">Reveja oportunidades salvas.</p></Link><Link className="panel p-5 hover:border-moss" href="/relatorios"><b>Relatórios</b><p className="mt-1 text-sm text-[var(--muted)]">Fechamento e resultado por produto.</p></Link><Link className="panel p-5 hover:border-moss" href="/backup"><b>Backup local</b><p className="mt-1 text-sm text-[var(--muted)]">Proteja todos os seus dados.</p></Link></section>

    {!ops.length && <EmptyState title="Comece por uma oportunidade real" text="Cadastre um anúncio e use sua tabela para descobrir o limite de compra." href="/oportunidades/nova" action="Cadastrar oportunidade"/>}
  </div>;
}
