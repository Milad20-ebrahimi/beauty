import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "beauty_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;
const CUSTOMER_SESSION_COOKIE = "beauty_customer_session";
const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be at least 32 characters.");
    return "beautyos-local-development-secret-only";
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAccessCode(received: string) {
  const expected = process.env.ADMIN_ACCESS_CODE || "";
  return expected.length >= 6 && safeEqual(received, expected);
}

export function isConfiguredAdminPhone(phone: string) {
  return Boolean(process.env.ADMIN_PHONE) && phone === process.env.ADMIN_PHONE;
}

export async function createAdminSession(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${userId}.${expiresAt}`;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function sessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [userId, expiresAtText, signature] = token.split(".");
  const payload = `${userId}.${expiresAtText}`;
  const expiresAt = Number(expiresAtText);
  if (!userId || !signature || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  if (!safeEqual(signature, sign(payload))) return null;
  return userId;
}

export async function getAdminUser() {
  const userId = await sessionUserId();
  if (!userId) return null;
  return prisma.user.findFirst({
    where: { id: userId, role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true, phone: true, displayName: true, role: true }
  });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin-login");
  return user;
}

export async function createCustomerSession(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + CUSTOMER_SESSION_MAX_AGE;
  const payload = `customer.${userId}.${expiresAt}`;
  (await cookies()).set(CUSTOMER_SESSION_COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: CUSTOMER_SESSION_MAX_AGE, path: "/" });
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCustomerUser() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [scope, userId, expiresAtText, signature] = token.split(".");
  const payload = `${scope}.${userId}.${expiresAtText}`;
  const expiresAt = Number(expiresAtText);
  if (scope !== "customer" || !userId || !signature || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !safeEqual(signature, sign(payload))) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, phone: true, displayName: true, role: true } });
}

export async function requireCustomer() {
  const user = await getCustomerUser();
  if (!user) redirect("/login?next=/account");
  return user;
}

export function hashOtp(phone: string, code: string) {
  return createHmac("sha256", authSecret()).update(`otp.${phone}.${code}`).digest("base64url");
}

export function verifyOtpHash(phone: string, code: string, expectedHash: string) {
  return safeEqual(hashOtp(phone, code), expectedHash);
}
