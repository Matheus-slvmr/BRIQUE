import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/database/client";
import { inventoryItems, opportunities } from "@/database/schema";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth/session";
import { formatBRL } from "@/lib/money";

export default async function InventoryPage(){const user=await requireUser();const rows=await db.select({item:inventoryItems,opportunity:opportunities}).from(inventoryItems).innerJoin(opportunities,eq(inventoryItems.opportunityId,opportunities.id)).where(and(eq(inventoryItems.userId,user.userId))).orderBy(desc(inventoryItems.acquiredAt)).all();return <div><div className="mb-6"><h1 className="text-3xl font-black">Estoque</h1><p className="text-sm text-[var(--muted)]">Do que foi comprado ao resultado final.</p></div>{!rows.length?<EmptyState title="Estoque vazio" text="Quando uma oportunidade for comprada, ela aparecerá aqui." href="/oportunidades" action="Ver oportunidades"/>:<div className="grid gap-3">{rows.map(({item,opportunity})=><Link href={`/estoque/${item.id}`} className="panel flex flex-wrap items-center justify-between gap-3 p-4 hover:border-moss" key={item.id}><div><h2 className="font-black">{opportunity.title}</h2><p className="text-sm text-[var(--muted)]">{opportunity.category} · {item.location||"Local não informado"}</p></div><div className="text-right"><span className="badge">{item.status.replaceAll("_"," ")}</span><p className="mt-1 font-bold">{formatBRL(item.actualCostCents)} investidos</p></div></Link>)}</div>}</div>}
