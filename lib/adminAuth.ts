import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "qc_article_admin";
const SESSION_VALUE = "qc-article-editor-v1";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getPassword() {
  const password = process.env.ARTICLE_ADMIN_PASSWORD;
  if (!password) throw new Error("ARTICLE_ADMIN_PASSWORD is not configured.");
  return password;
}

function digest(value: string) {
  return createHmac("sha256", getPassword()).update(value).digest("hex");
}

export function passwordMatches(candidate: string) {
  const expected = Buffer.from(digest(getPassword()), "hex");
  const actual = Buffer.from(digest(candidate), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function sessionToken() {
  return digest(SESSION_VALUE);
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  const expected = Buffer.from(sessionToken(), "hex");
  const actual = /^[a-f0-9]{64}$/i.test(token) ? Buffer.from(token, "hex") : Buffer.alloc(0);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
