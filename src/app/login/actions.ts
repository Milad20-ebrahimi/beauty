"use server";

import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, hashOtp, verifyOtpHash } from "@/lib/auth";

const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
function normalizePhone(value: FormDataEntryValue | null) {
  const digits = toEnglishDigits(String(value || "")).replace(/\D/g, "");
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98")) return `0${digits.slice(2)}`;
  return digits;
}
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value || "/account");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function requestCustomerOtp(formData: FormData) {
  const phone = normalizePhone(formData.get("phone"));
  const next = safeNext(formData.get("next"));
  if (!/^09\d{9}$/.test(phone)) redirect(`/login?error=phone&next=${encodeURIComponent(next)}`);
  const latest = await prisma.customerOtp.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (latest && Date.now() - latest.createdAt.getTime() < 60_000) redirect(`/login?error=wait&next=${encodeURIComponent(next)}`);
  const code = String(randomInt(100000, 1000000));
  await prisma.customerOtp.create({ data: { phone, codeHash: hashOtp(phone, code), expiresAt: new Date(Date.now() + 5 * 60_000) } });
  const devMode = process.env.CUSTOMER_OTP_DEV_MODE === "true" || process.env.NODE_ENV !== "production";
  if (!devMode) redirect(`/login?error=sms&next=${encodeURIComponent(next)}`);
  redirect(`/login?step=verify&phone=${phone}&next=${encodeURIComponent(next)}&devCode=${code}`);
}

export async function verifyCustomerOtp(formData: FormData) {
  const phone = normalizePhone(formData.get("phone"));
  const code = toEnglishDigits(String(formData.get("code") || "")).replace(/\D/g, "");
  const next = safeNext(formData.get("next"));
  const otp = await prisma.customerOtp.findFirst({ where: { phone, consumedAt: null }, orderBy: { createdAt: "desc" } });
  if (!otp || otp.expiresAt <= new Date()) redirect(`/login?error=expired&phone=${phone}&next=${encodeURIComponent(next)}`);
  if (otp.attempts >= 5) redirect(`/login?error=attempts&phone=${phone}&next=${encodeURIComponent(next)}`);
  if (!verifyOtpHash(phone, code, otp.codeHash)) {
    await prisma.customerOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    redirect(`/login?step=verify&error=code&phone=${phone}&next=${encodeURIComponent(next)}`);
  }
  const user = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone, displayName: "کاربر BeautyOS" } });
  const profileId = (await cookies()).get("beauty_profile_id")?.value;
  if (profileId) await prisma.beautyProfile.updateMany({ where: { id: profileId }, data: { userId: user.id } });
  await prisma.customerOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  await createCustomerSession(user.id);
  redirect(next);
}
