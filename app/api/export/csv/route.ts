import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { ledgerEntries, opportunities } from "@/database/schema";
import { getSession } from "@/lib/auth/session";

const safe = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export async function GET() {
  const user = await getSession();
  if (!user) return new Response("Não autorizado", { status: 401 });
  const ops = db.select().from(opportunities).where(eq(opportunities.userId, user.userId)).all();
  const ledger = db.select().from(ledgerEntries).where(eq(ledgerEntries.userId, user.userId)).all();
  const rows: unknown[][] = [
    ["tipo_registro", "id", "data", "titulo_descricao", "status_tipo", "valor_centavos", "tipo_preco"],
    ...ops.map((o) => ["oportunidade", o.id, o.capturedAt, o.title, o.status, o.askingPriceCents, "ANUNCIADO"]),
    ...ledger.map((e) => ["caixa", e.id, e.occurredAt, e.description, e.type, e.originalAmountCents, e.direction])
  ];
  const lines = rows.map((row) => row.map(safe).join(";"));
  return new Response("\uFEFF" + lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="briquego-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
