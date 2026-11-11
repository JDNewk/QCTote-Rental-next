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

function normalizeHost(value: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\.$/, "");
}

function firstForwardedValue(value: string | null) {
  return normalizeHost(value?.split(",")[0] ?? null);
}

function hostOnly(host: string) {
  if (!host) return "";
  try {
    return new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    return host.split(":")[0].toLowerCase();
  }
}

function isAllowedPublicHost(host: string) {
  const hostname = hostOnly(host);
  return (
    hostname === "qctoterentals.com" ||
    hostname === "www.qctoterentals.com" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

export function isSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");

  // Requests without an Origin header are generally server-to-server or same-origin
  // navigations. Keep the behavior used by the existing admin API.
  if (!originHeader) return true;

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return false;
  }

  const originHost = normalizeHost(origin.host);
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const hostHeader = firstForwardedValue(request.headers.get("host"));

  // Prefer the public host forwarded by Netlify, then the regular Host header.
  // This avoids comparing the browser origin to an internal serverless request URL.
  const requestHost = forwardedHost || hostHeader;

  if (requestHost && originHost === requestHost) return true;

  // Explicitly allow the two QC Tote Rental public hostnames and local development.
  return isAllowedPublicHost(originHost) && isAllowedPublicHost(requestHost || originHost);
}
