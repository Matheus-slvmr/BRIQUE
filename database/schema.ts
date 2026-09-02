import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at")
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(), name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(), ...timestamps
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), subcategory: text("subcategory"), brand: text("brand"), model: text("model"), ...timestamps
}, (t) => [index("products_user_category_idx").on(t.userId, t.category)]);

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(), productId: text("product_id").notNull().references(() => products.id),
  version: text("version"), color: text("color"), specifications: text("specifications", { mode: "json" }).$type<Record<string,string>>(), ...timestamps
});

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  productId: text("product_id").references(() => products.id), variantId: text("variant_id").references(() => productVariants.id),
  title: text("title").notNull(), originalUrl: text("original_url"), source: text("source").notNull(),
  category: text("category").notNull(), subcategory: text("subcategory"), brand: text("brand"), model: text("model"), version: text("version"),
  color: text("color"), specifications: text("specifications"), condition: text("condition").notNull(), defects: text("defects"), accessories: text("accessories"), description: text("description"),
  askingPriceCents: integer("asking_price_cents").notNull(), negotiatedPriceCents: integer("negotiated_price_cents"),
  city: text("city").notNull().default("Goiânia"), neighborhood: text("neighborhood"), distanceKm: real("distance_km"),
  travelCostCents: integer("travel_cost_cents").notNull().default(0), purchaseShippingCents: integer("purchase_shipping_cents").notNull().default(0),
  partsCostCents: integer("parts_cost_cents").notNull().default(0), repairCostCents: integer("repair_cost_cents").notNull().default(0),
  cleaningCostCents: integer("cleaning_cost_cents").notNull().default(0), packagingCostCents: integer("packaging_cost_cents").notNull().default(0), otherPurchaseCostsCents: integer("other_purchase_costs_cents").notNull().default(0),
  publishedAt: text("published_at"), capturedAt: text("captured_at").notNull(), notes: text("notes"), contact: text("contact"),
  status: text("status").notNull().default("EM_ANALISE"), riskLevel: text("risk_level").notNull().default("MEDIO"),
  expectedDaysToSell: integer("expected_days_to_sell").notNull().default(30), minimumProfitCents: integer("minimum_profit_cents").notNull().default(0), ...timestamps
}, (t) => [index("opportunities_user_status_idx").on(t.userId, t.status), index("opportunities_search_idx").on(t.userId, t.category, t.source)]);

export const marketComparables = sqliteTable("market_comparables", {
  id: text("id").primaryKey(), opportunityId: text("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  source: text("source").notNull(), url: text("url"), title: text("title").notNull(), priceCents: integer("price_cents").notNull(),
  condition: text("condition").notNull(), location: text("location"), shippingCents: integer("shipping_cents").notNull().default(0),
  collectedAt: text("collected_at").notNull(), status: text("status").notNull().default("DESCONHECIDO"),
  priceType: text("price_type").notNull().default("ANUNCIADO"), notes: text("notes"), included: integer("included", { mode: "boolean" }).notNull().default(true),
  outlier: integer("outlier", { mode: "boolean" }).notNull().default(false), ...timestamps
}, (t) => [index("comparables_opportunity_idx").on(t.opportunityId)]);

export const priceSnapshots = sqliteTable("price_snapshots", {
  id: text("id").primaryKey(), comparableId: text("comparable_id").references(() => marketComparables.id),
  listingId: text("listing_id"), priceCents: integer("price_cents").notNull(), priceType: text("price_type").notNull(), capturedAt: text("captured_at").notNull(), ...timestamps
});

export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(), opportunityId: text("opportunity_id").notNull().references(() => opportunities.id),
  purchasePriceCents: integer("purchase_price_cents").notNull(), purchasedAt: text("purchased_at").notNull(), sellerAlias: text("seller_alias"), notes: text("notes"), ...timestamps
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), purchaseId: text("purchase_id").notNull().references(() => purchases.id),
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id), status: text("status").notNull().default("COMPRADO"),
  location: text("location"), actualCostCents: integer("actual_cost_cents").notNull(), acquiredAt: text("acquired_at").notNull(), soldAt: text("sold_at"), ...timestamps
}, (t) => [index("inventory_user_status_idx").on(t.userId, t.status)]);

export const costs = sqliteTable("costs", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), inventoryItemId: text("inventory_item_id").references(() => inventoryItems.id),
  type: text("type").notNull(), description: text("description").notNull(), amountCents: integer("amount_cents").notNull(), incurredAt: text("incurred_at").notNull(), ...timestamps
});

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(), inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItems.id), source: text("source").notNull(),
  url: text("url"), initialPriceCents: integer("initial_price_cents").notNull(), currentPriceCents: integer("current_price_cents").notNull(),
  status: text("status").notNull().default("ATIVO"), listedAt: text("listed_at").notNull(), ...timestamps
});

export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(), inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItems.id), listingId: text("listing_id").references(() => listings.id),
  buyerAlias: text("buyer_alias"), salePriceCents: integer("sale_price_cents").notNull(), platformFeeCents: integer("platform_fee_cents").notNull().default(0),
  sellerShippingCents: integer("seller_shipping_cents").notNull().default(0), discountCents: integer("discount_cents").notNull().default(0),
  taxesCents: integer("taxes_cents").notNull().default(0), otherSaleCostsCents: integer("other_sale_costs_cents").notNull().default(0),
  receivedCents: integer("received_cents").notNull(), paymentMethod: text("payment_method").notNull(), soldAt: text("sold_at").notNull(), warrantyUntil: text("warranty_until"), notes: text("notes"), ...timestamps
});

export const ledgerEntries = sqliteTable("ledger_entries", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), inventoryItemId: text("inventory_item_id").references(() => inventoryItems.id),
  type: text("type").notNull(), direction: text("direction").notNull(), description: text("description").notNull(), amountCents: integer("amount_cents").notNull(),
  occurredAt: text("occurred_at").notNull(), dueAt: text("due_at"), settledAt: text("settled_at"), originalAmountCents: integer("original_amount_cents").notNull(), ...timestamps
}, (t) => [index("ledger_user_date_idx").on(t.userId, t.occurredAt)]);

export const expenseTemplates = sqliteTable("expense_templates", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), name: text("name").notNull(), type: text("type").notNull(), amountCents: integer("amount_cents"), ...timestamps });
export const inspectionChecklists = sqliteTable("inspection_checklists", { id: text("id").primaryKey(), userId: text("user_id").references(() => users.id), category: text("category").notNull(), name: text("name").notNull(), items: text("items", { mode: "json" }).$type<string[]>().notNull(), ...timestamps });
export const inspectionResults = sqliteTable("inspection_results", { id: text("id").primaryKey(), opportunityId: text("opportunity_id").notNull().references(() => opportunities.id), checklistId: text("checklist_id").notNull().references(() => inspectionChecklists.id), answers: text("answers", { mode: "json" }).$type<Record<string,string>>().notNull(), completedAt: text("completed_at"), ...timestamps });
export const riskFlags = sqliteTable("risk_flags", { id: text("id").primaryKey(), opportunityId: text("opportunity_id").notNull().references(() => opportunities.id), type: text("type").notNull(), severity: text("severity").notNull(), description: text("description").notNull(), resolvedAt: text("resolved_at"), ...timestamps });
export const attachments = sqliteTable("attachments", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), fileName: text("file_name").notNull(), mimeType: text("mime_type").notNull(), sizeBytes: integer("size_bytes").notNull(), storagePath: text("storage_path").notNull(), ...timestamps });
export const dataSources = sqliteTable("data_sources", { id: text("id").primaryKey(), name: text("name").notNull(), officialDocsUrl: text("official_docs_url"), priceTypes: text("price_types", { mode: "json" }).$type<string[]>(), ...timestamps });
export const connectors = sqliteTable("connectors", { id: text("id").primaryKey(), dataSourceId: text("data_source_id").notNull().references(() => dataSources.id), authType: text("auth_type").notNull(), availableData: text("available_data"), limits: text("limits"), status: text("status").notNull(), lastSyncAt: text("last_sync_at"), errorMessage: text("error_message"), ...timestamps });
export const syncLogs = sqliteTable("sync_logs", { id: text("id").primaryKey(), connectorId: text("connector_id").notNull().references(() => connectors.id), status: text("status").notNull(), message: text("message"), startedAt: text("started_at").notNull(), finishedAt: text("finished_at"), ...timestamps });
export const auditLogs = sqliteTable("audit_logs", { id: text("id").primaryKey(), userId: text("user_id").references(() => users.id), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), action: text("action").notNull(), beforeJson: text("before_json"), afterJson: text("after_json"), occurredAt: text("occurred_at").notNull(), ipHash: text("ip_hash") });
export const appSettings = sqliteTable("app_settings", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), key: text("key").notNull(), value: text("value").notNull(), ...timestamps }, (t) => [uniqueIndex("settings_user_key_uq").on(t.userId, t.key)]);
