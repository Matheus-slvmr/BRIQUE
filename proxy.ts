import { NextRequest, NextResponse } from "next/server";
import { HOSTED_ACCESS_COOKIE, hostedAccessConfigured, hostedAccessToken } from "./lib/auth/hosted-access";

const publicAccessPaths = new Set(["/login", "/api/auth/login", "/api/auth/logout"]);

function addPrivateHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (hostedAccessConfigured() && !publicAccessPaths.has(pathname)) {
    const session = request.cookies.get(HOSTED_ACCESS_COOKIE)?.value;
    const authenticated = session === (await hostedAccessToken());

    if (!authenticated) {
      if (pathname.startsWith("/api/")) {
        return addPrivateHeaders(NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 }));
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return addPrivateHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return addPrivateHeaders(NextResponse.next());
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|sw.js).*)"] };
