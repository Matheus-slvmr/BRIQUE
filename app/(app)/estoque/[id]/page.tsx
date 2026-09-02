import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/database/client";
import { attachments, costs, inventoryItems, listings, opportunities, sales } from "@/database/schema";
import { addCost, addListing, sellItem } from "@/features/inventory/actions";
import { uploadAttachment } from "@/features/opportunities/extra-actions";
import { requireUser } from "@/lib/auth/session";
import { getBusinessSettings, getEffectivePriceGuide } from "@/lib/local-settings";
import { formatBRL } from "@/lib/money";
import { evaluatePriceGuide } from "@/lib/price-guide";

const today = new Date().toISOString().slice(0, 10);

export default async function InventoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const row = await db.select({ item: inventoryItems, opportunity: opportunities }).from(inventoryItems).innerJoin(opportunities, eq(inventoryItems.opportunityId, opportunities.id)).where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, user.userId))).get();
  if (!row) notFound();
  const [itemCosts, itemListings, sale, photos, guideEntries] = await Promise.all([
    db.select().from(costs).where(eq(costs.inventoryItemId, id)).all(),
    db.select().from(listings).where(eq(listings.inventoryItemId, id)).all(),
    db.select().from(sales).where(eq(sales.inventoryItemId, id)).get(),
    db.select().from(attachments).where(and(eq(attachments.userId, user.userId), eq(attachments.entityType, "inventory"), eq(attachments.entityId, id))).all(),
    getEffectivePriceGuide(user.userId),
  ]);
  const settings = getBusinessSettings(user.userId);
  const guide = evaluatePriceGuide(row.opportunity, guideEntries);
  const ageDays = Math.floor((Date.now() - new Date(row.item.acquiredAt).getTime()) / 86400000);
  const suggestedPrice = guide.reference ? Math.round(guide.reference.saleReferenceCents * (ageDays >= settings.staleDays ? 0.95 : 1)) : null;
  const profit = sale ? sale.receivedCents - row.item.actualCostCents : null;

  return <div className="grid gap-6"><header className="flex flex-wrap items-start justify-between gap-3"><div><Link href="/estoque" className="text-sm text-[var(--muted)]">← Estoque</Link><h1 className="mt-2 text-3xl font-black">{row.opportunity.title}</h1><p className="text-sm text-[var(--muted)]">{row.item.status.replaceAll("_", " ")} · {ageDays} dia(s) em estoque</p></div>{sale && <Link className="button" href={`/recibo/${sale.id}`}>Abrir recibo</Link>}</header>

    {ageDays >= settings.staleDays && !sale && <section className="rounded-2xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-950 dark:bg-orange-950/30 dark:text-orange-100"><b>Estoque parado:</b> este item passou de {settings.staleDays} dias. Revise preço, fotos e descrição.</section>}
    <section className="grid gap-4 sm:grid-cols-4"><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">CUSTO REAL</p><p className="mt-2 text-2xl font-black">{formatBRL(row.item.actualCostCents)}</p></article><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">PREÇO SUGERIDO</p><p className="mt-2 text-2xl font-black">{suggestedPrice ? formatBRL(suggestedPrice) : "Sem referência"}</p></article><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">VALOR RECEBIDO</p><p className="mt-2 text-2xl font-black">{sale ? formatBRL(sale.receivedCents) : "—"}</p></article><article className="panel p-4"><p className="text-xs font-bold text-[var(--muted)]">LUCRO REAL</p><p className={`mt-2 text-2xl font-black ${(profit ?? 0) >= 0 ? "text-moss dark:text-lime" : "text-clay"}`}>{profit == null ? "Não vendido" : formatBRL(profit)}</p></article></section>

    <section className="grid gap-5 lg:grid-cols-2"><div className="panel p-5"><h2 className="text-xl font-black">Gastos adicionais</h2>{itemCosts.length > 0 && <ul className="my-4 divide-y divide-[var(--border)]">{itemCosts.map((cost) => <li key={cost.id} className="flex justify-between py-2 text-sm"><span>{cost.description} <small className="text-[var(--muted)]">({cost.type})</small></span><b>{formatBRL(cost.amountCents)}</b></li>)}</ul>}{!sale && <form action={addCost} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="inventoryItemId" value={id}/><div className="field"><label>Tipo</label><select name="type"><option>REPARO</option><option>PECA</option><option>FRETE</option><option>COMBUSTIVEL</option><option>LIMPEZA</option><option>EMBALAGEM</option><option>OUTRA_DESPESA</option></select></div><div className="field"><label>Valor</label><input className="input" name="amount" required/></div><div className="field"><label>Descrição</label><input className="input" name="description" required/></div><div className="field"><label>Data</label><input className="input" type="date" name="incurredAt" defaultValue={today} required/></div><button className="button sm:col-span-2">Registrar gasto</button></form>}</div>
    <div className="panel p-5"><h2 className="text-xl font-black">Anúncios próprios</h2>{suggestedPrice && <p className="mt-1 text-sm text-[var(--muted)]">Sugestão baseada na sua tabela{ageDays >= settings.staleDays ? ", com redução de 5% por tempo em estoque" : ""}.</p>}{itemListings.length > 0 && <ul className="my-4 divide-y divide-[var(--border)]">{itemListings.map((listing) => <li key={listing.id} className="flex justify-between py-2 text-sm"><span>{listing.source} · {listing.status}</span><b>{formatBRL(listing.currentPriceCents)}</b></li>)}</ul>}{!sale && <form action={addListing} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="inventoryItemId" value={id}/><div className="field"><label>Plataforma</label><select name="source"><option>Facebook Marketplace</option><option>OLX</option><option>Mercado Livre</option><option>Outra</option></select></div><div className="field"><label>Preço anunciado</label><input className="input" name="price" defaultValue={suggestedPrice ? (suggestedPrice / 100).toFixed(2).replace(".", ",") : undefined} required/></div><div className="field"><label>URL</label><input className="input" name="url" type="url"/></div><div className="field"><label>Data</label><input className="input" name="listedAt" type="date" defaultValue={today} required/></div><button className="button sm:col-span-2">Registrar anúncio</button></form>}</div></section>

    {!sale && <section className="panel p-5"><h2 className="text-xl font-black">Registrar venda</h2><p className="text-sm text-[var(--muted)]">O recibo ficará disponível assim que a venda for salva.</p><form action={sellItem} className="mt-4 grid gap-3 sm:grid-cols-3"><input type="hidden" name="inventoryItemId" value={id}/>{[["salePrice", "Preço de venda"], ["platformFee", "Taxa da plataforma"], ["sellerShipping", "Frete pago pelo vendedor"], ["discount", "Desconto negociado"], ["taxes", "Impostos informados"], ["otherSaleCosts", "Outros custos"]].map(([name, label]) => <div className="field" key={name}><label>{label}</label><input className="input" name={name} required={name === "salePrice"} defaultValue={name === "salePrice" ? undefined : "0,00"}/></div>)}<div className="field"><label>Pagamento</label><select name="paymentMethod"><option>PIX</option><option>DINHEIRO</option><option>CARTAO</option><option>TRANSFERENCIA</option><option>OUTRO</option></select></div><div className="field"><label>Data da venda</label><input className="input" name="soldAt" type="date" defaultValue={today} required/></div><div className="field"><label>Comprador</label><input className="input" name="buyerAlias"/></div><div className="field"><label>Garantia combinada até</label><input className="input" name="warrantyUntil" type="date"/></div><div className="sm:col-span-3"><button className="button">Concluir venda</button></div></form></section>}

    <section className="panel p-5"><h2 className="text-xl font-black">Fotos locais</h2><form action={uploadAttachment} className="mt-4 flex flex-wrap gap-3" encType="multipart/form-data"><input type="hidden" name="entityType" value="inventory"/><input type="hidden" name="entityId" value={id}/><input className="input max-w-md" type="file" name="file" accept="image/jpeg,image/png,image/webp" required/><button className="button">Guardar foto</button></form>{photos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.map((photo) => <a href={`/api/attachments/${photo.id}`} target="_blank" key={photo.id}><img className="aspect-square w-full rounded-xl object-cover" src={`/api/attachments/${photo.id}`} alt={photo.fileName}/></a>)}</div>}</section>
  </div>;
}
