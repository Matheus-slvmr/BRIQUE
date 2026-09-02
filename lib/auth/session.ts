import { db } from "@/database/client";
import { ensureReferenceData } from "@/database/reference-data";
import { users } from "@/database/schema";

const localUser = { userId: "local-user", email: "local@briquego", name: "Matheus" };
const sessionState = globalThis as unknown as { briquegoBootstrap?: Promise<void> };

export async function getSession() {
  sessionState.briquegoBootstrap ??= (async () => {
    await db.insert(users).values({ id: localUser.userId, email: localUser.email, name: localUser.name, passwordHash: "PRIVATE_SINGLE_USER" }).onConflictDoNothing().run();
    await ensureReferenceData();
  })();
  await sessionState.briquegoBootstrap;
  return localUser;
}

export async function requireUser() { return getSession(); }
