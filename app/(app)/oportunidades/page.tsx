import Link from "next/link";
import { and, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/database/client";
import { opportunities } from "@/database/schema";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth/session";
import { formatBRL } from "@/lib/money";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user=await requireUser(), filters=await searchParams, clauses=[eq(opportunities.userId,user.userId), eq(opportunities.deletedAt,null as unknown as string)];
  if(filters.q) clauses.push(or(like(opportunities.title,`%${filters.q}%`),like(opportunities.category,`%${filters.q}%`),like(opportunities.brand,`%${filters.q}%`))!); if(filters.status) clauses.push(eq(opportunities.status,filters.status));
  const rows=await db.select().from(opportunities).where(and(...clauses)).orderBy(desc(opportunities.createdAt)).all();
  return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">Oportunidades</h1><p className="text-sm text-[var(--muted)]">Compare antes de comprometer seu caixa.</p></div><Link className="button" href="/oportunidades/nova">Nova oportunidade</Link></div>
    <form className="panel mb-5 grid gap-3 p-3 sm:grid-cols-[1fr_180px_auto]"><input className="input" name="q" defaultValue={filters.q} placeholder="Buscar título, categoria ou marca"/><select name="status" defaultValue={filters.status}><option value="">Todos os status</option><option value="EM_ANALISE">Em análise</option><option value="NEGOCIACAO">Negociação</option><option value="COMPRADO">Comprado</option><option value="VENDIDO">Vendido</option><option value="DESCARTADO">Descartado</option></select><button className="button secondary">Filtrar</button></form>
    {!rows.length?<EmptyState title="Nenhuma oportunidade por aqui" text="Cadastre manualmente um anúncio para comparar preços e calcular cenários." href="/oportunidades/nova" action="Cadastrar primeira oportunidade"/>:<div className="panel overflow-x-auto"><table><thead><tr><th>Oportunidade</th><th>Preço pedido</th><th>Status</th><th>Origem</th><th>Capturada</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><Link className="font-bold hover:underline" href={`/oportunidades/${row.id}`}>{row.title}</Link><p className="text-xs text-[var(--muted)]">{[row.brand,row.model,row.condition].filter(Boolean).join(" · ")}</p></td><td className="font-bold">{formatBRL(row.askingPriceCents)}</td><td><span className="badge">{row.status.replaceAll("_"," ")}</span></td><td>{row.source}</td><td>{new Date(row.capturedAt).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div>}
  </div>;
}
