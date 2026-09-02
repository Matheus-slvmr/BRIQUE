import { db } from "@/database/client";
import { ensureReferenceData } from "@/database/reference-data";
import { users } from "@/database/schema";

const localUser = {
  userId: "local-user",
  email: "local@briquego",
  name: "Matheus",
};

export async function getSession() {
  db.insert(users).values({
    id: localUser.userId,
    email: localUser.email,
    name: localUser.name,
    passwordHash: "LOCAL_ONLY",
  }).onConflictDoNothing().run();
  ensureReferenceData();
  return localUser;
}

export async function requireUser() {
  return getSession();
}
