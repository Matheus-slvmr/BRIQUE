export const HOSTED_ACCESS_COOKIE = "briquego_hosted_access";

export function hostedAccessConfigured() {
  return Boolean(process.env.BRIQUEGO_USER && process.env.BRIQUEGO_PASSWORD);
}

export function hostedCredentialsAreValid(username: string, password: string) {
  return (
    hostedAccessConfigured() &&
    username === process.env.BRIQUEGO_USER &&
    password === process.env.BRIQUEGO_PASSWORD
  );
}

export async function hostedAccessToken() {
  const source = `${process.env.BRIQUEGO_USER ?? ""}:${process.env.BRIQUEGO_PASSWORD ?? ""}:briquego-hosted-access`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function safeReturnPath(value: FormDataEntryValue | string | null | undefined) {
  const path = typeof value === "string" ? value : "/";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}
