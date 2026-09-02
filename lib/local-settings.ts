import { and, eq, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/database/client";
import { appSettings } from "@/database/schema";
import { priceGuideEntries, type PriceGuideEntry } from "@/lib/price-guide";

export type BusinessSettings = { reserveCents: number; monthlyGoalCents: number; staleDays: number; radarToleranceCents: number };
export const defaultBusinessSettings: BusinessSettings = { reserveCents: 0, monthlyGoalCents: 300000, staleDays: 30, radarToleranceCents: 5000 };
export type PriceHistoryItem = { buyMaxCents: number; saleReferenceCents: number; changedAt: string };
export type PriceOverride = { buyMaxCents: number; saleReferenceCents: number; updatedAt: string; history: PriceHistoryItem[] };

async function row(userId: string, key: string) { return db.select().from(appSettings).where(and(eq(appSettings.userId, userId), eq(appSettings.key, key))).get(); }
export async function getJsonSetting<T>(userId: string, key: string, fallback: T): Promise<T> { const found = await row(userId, key); if (!found) return fallback; try { return JSON.parse(found.value) as T; } catch { return fallback; } }
export async function setJsonSetting(userId: string, key: string, value: unknown) { const now = new Date().toISOString(); await db.insert(appSettings).values({ id: randomUUID(), userId, key, value: JSON.stringify(value), createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: [appSettings.userId, appSettings.key], set: { value: JSON.stringify(value), updatedAt: now } }).run(); }
export const getBusinessSettings = (userId: string) => getJsonSetting(userId, "business", defaultBusinessSettings);
export const getPriceOverrides = (userId: string) => getJsonSetting<Record<string, PriceOverride>>(userId, "price-guide-overrides", {});
export async function getEffectivePriceGuide(userId: string): Promise<PriceGuideEntry[]> { const overrides = await getPriceOverrides(userId); return priceGuideEntries.map((entry) => ({ ...entry, ...overrides[entry.model] })); }
export function getFavoriteIds(userId: string) { return getJsonSetting<string[]>(userId, "favorite-opportunities", []); }
export async function toggleFavoriteId(userId: string, id: string) { const ids = await getFavoriteIds(userId); const next = ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]; await setJsonSetting(userId, "favorite-opportunities", next); return next.includes(id); }
export function settingRows(userId: string, prefix: string) { return db.select().from(appSettings).where(and(eq(appSettings.userId, userId), like(appSettings.key, `${prefix}%`))).all(); }
