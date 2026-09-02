import { NextRequest, NextResponse } from "next/server";
import { HOSTED_ACCESS_COOKIE } from "@/lib/auth/hosted-access";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set({ name: HOSTED_ACCESS_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
