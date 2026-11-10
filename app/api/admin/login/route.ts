import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, passwordMatches, sessionToken } from "@/lib/adminAuth";

export async function POST(request: Request) {
  let password = "";
  try {
    password = String((await request.json()).password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, sessionToken(), adminCookieOptions);
  return response;
}
