import { NextRequest, NextResponse } from "next/server";
import {
  HOSTED_ACCESS_COOKIE,
  hostedAccessConfigured,
  hostedAccessToken,
  hostedCredentialsAreValid,
  safeReturnPath,
} from "@/lib/auth/hosted-access";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const returnPath = safeReturnPath(formData.get("next"));

  if (!hostedAccessConfigured()) {
    return NextResponse.redirect(new URL(returnPath, request.url), 303);
  }

  if (!hostedCredentialsAreValid(username, password)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", returnPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(returnPath, request.url), 303);
  response.cookies.set({
    name: HOSTED_ACCESS_COOKIE,
    value: await hostedAccessToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
