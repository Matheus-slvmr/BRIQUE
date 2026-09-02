import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Acesso privado ao BriqueGO", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="BriqueGO", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  const configuredUser = process.env.BRIQUEGO_USER;
  const configuredPassword = process.env.BRIQUEGO_PASSWORD;

  if (configuredUser && configuredPassword) {
    const authorization = request.headers.get("authorization");
    const expected = `Basic ${btoa(`${configuredUser}:${configuredPassword}`)}`;
    if (authorization !== expected) return unauthorized();
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|sw.js).*)"] };
