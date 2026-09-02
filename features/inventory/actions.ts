"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/database/client";
import { auditLogs, costs, inventoryItems, ledgerEntries, listings, opportunities, purchases, sales } from "@/database/schema";
import { requireUser } from "@/lib/auth/session";
import { parseBRL } from "@/lib/money";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function buyOpportunity(form: FormData) {
  const user = await requireUser(), opportunityId = s(form,"opportunityId"), opportunity = db.select().from(opportunities).where(and(eq(opportunities.id,opportunityId),eq(opportunities.userId,user.userId))).get();
  if (!opportunity) throw new Error("Oportunidade não encontrada");
  const purchasePriceCents = parseBRL(form.get("purchasePrice")), date = new Date(s(form,"purchasedAt")).toISOString(), purchaseId = randomUUID(), inventoryId = randomUUID();
  const acquisitionCosts = opportunity.travelCostCents + opportunity.purchaseShippingCents + opportunity.partsCostCents + opportunity.repairCostCents + opportunity.cleaningCostCents + opportunity.packagingCostCents + opportunity.otherPurchaseCostsCents;
  db.transaction((tx) => {
    tx.insert(purchases).values({ id: purchaseId, opportunityId, purchasePriceCents, purchasedAt: date, sellerAlias: s(form,"sellerAlias") || null }).run();
    tx.insert(inventoryItems).values({ id: inventoryId, userId: user.userId, purchaseId, opportunityId, status: "COMPRADO", location: s(form,"location") || null, actualCostCents: purchasePriceCents + acquisitionCosts, acquiredAt: date }).run();
    tx.insert(ledgerEntries).values({ id: randomUUID(), userId: user.userId, inventoryItemId: inventoryId, type: "COMPRA", direction: "SAIDA", description: `Compra: ${opportunity.title}`, amountCents: purchasePriceCents, originalAmountCents: purchasePriceCents, occurredAt: date, settledAt: date }).run();
    tx.update(opportunities).set({ status: "COMPRADO", negotiatedPriceCents: purchasePriceCents, updatedAt: new Date().toISOString() }).where(eq(opportunities.id,opportunityId)).run();
    tx.insert(auditLogs).values({ id: randomUUID(), userId: user.userId, entityType: "Opportunity", entityId: opportunityId, action: "BUY", afterJson: JSON.stringify({ purchaseId, inventoryId, purchasePriceCents }), occurredAt: new Date().toISOString() }).run();
  });
  redirect(`/estoque/${inventoryId}`);
}

export async function addCost(form: FormData) {
  const user = await requireUser(), inventoryItemId = s(form,"inventoryItemId"), item = db.select().from(inventoryItems).where(and(eq(inventoryItems.id,inventoryItemId),eq(inventoryItems.userId,user.userId))).get();
  if (!item) throw new Error("Item não encontrado");
  const amountCents = parseBRL(form.get("amount")), date = new Date(s(form,"incurredAt")).toISOString(), type = s(form,"type"), description = s(form,"description");
  db.transaction((tx) => { tx.insert(costs).values({ id:randomUUID(),userId:user.userId,inventoryItemId,type,description,amountCents,incurredAt:date }).run(); tx.insert(ledgerEntries).values({id:randomUUID(),userId:user.userId,inventoryItemId,type,direction:"SAIDA",description,amountCents,originalAmountCents:amountCents,occurredAt:date,settledAt:date}).run(); tx.update(inventoryItems).set({actualCostCents:item.actualCostCents+amountCents,updatedAt:new Date().toISOString()}).where(eq(inventoryItems.id,inventoryItemId)).run(); });
  revalidatePath(`/estoque/${inventoryItemId}`);
}

export async function addListing(form: FormData) {
  const user=await requireUser(), inventoryItemId=s(form,"inventoryItemId"), item=db.select().from(inventoryItems).where(and(eq(inventoryItems.id,inventoryItemId),eq(inventoryItems.userId,user.userId))).get(); if(!item) throw new Error("Item não encontrado");
  const price=parseBRL(form.get("price")); db.transaction((tx)=>{ tx.insert(listings).values({id:randomUUID(),inventoryItemId,source:s(form,"source"),url:s(form,"url")||null,initialPriceCents:price,currentPriceCents:price,status:"ATIVO",listedAt:new Date(s(form,"listedAt")).toISOString()}).run(); tx.update(inventoryItems).set({status:"ANUNCIADO",updatedAt:new Date().toISOString()}).where(eq(inventoryItems.id,inventoryItemId)).run(); }); revalidatePath(`/estoque/${inventoryItemId}`);
}

export async function sellItem(form: FormData) {
  const user=await requireUser(), inventoryItemId=s(form,"inventoryItemId"), item=db.select().from(inventoryItems).where(and(eq(inventoryItems.id,inventoryItemId),eq(inventoryItems.userId,user.userId))).get(); if(!item) throw new Error("Item não encontrado");
  const salePriceCents=parseBRL(form.get("salePrice")), platformFeeCents=parseBRL(form.get("platformFee")), sellerShippingCents=parseBRL(form.get("sellerShipping")), discountCents=parseBRL(form.get("discount")), taxesCents=parseBRL(form.get("taxes")), otherSaleCostsCents=parseBRL(form.get("otherSaleCosts")); const receivedCents=salePriceCents-platformFeeCents-sellerShippingCents-discountCents-taxesCents-otherSaleCostsCents, soldAt=new Date(s(form,"soldAt")).toISOString();
  db.transaction((tx)=>{tx.insert(sales).values({id:randomUUID(),inventoryItemId,buyerAlias:s(form,"buyerAlias")||null,salePriceCents,platformFeeCents,sellerShippingCents,discountCents,taxesCents,otherSaleCostsCents,receivedCents,paymentMethod:s(form,"paymentMethod"),soldAt,warrantyUntil:s(form,"warrantyUntil")||null}).run();tx.insert(ledgerEntries).values({id:randomUUID(),userId:user.userId,inventoryItemId,type:"VENDA",direction:"ENTRADA",description:"Venda de item",amountCents:receivedCents,originalAmountCents:receivedCents,occurredAt:soldAt,settledAt:soldAt}).run();tx.update(inventoryItems).set({status:"VENDIDO",soldAt,updatedAt:new Date().toISOString()}).where(eq(inventoryItems.id,inventoryItemId)).run();tx.update(opportunities).set({status:"VENDIDO",updatedAt:new Date().toISOString()}).where(eq(opportunities.id,item.opportunityId)).run();}); redirect(`/estoque/${inventoryItemId}`);
}
