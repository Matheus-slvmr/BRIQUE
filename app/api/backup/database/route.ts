import fs from "node:fs";
import { client, dbPath, isRemoteDatabase } from "@/database/client";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return new Response("Não autorizado", { status: 401 });
  if (isRemoteDatabase) return Response.redirect(new URL("/api/export/json", request.url));
  await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(fs.readFileSync(dbPath)), {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename=briquego-${date}.db`,
      "Cache-Control": "no-store",
    },
  });
}
