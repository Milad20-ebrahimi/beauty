"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminSession, isConfiguredAdminPhone, verifyAccessCode } from "@/lib/auth";

function normalizePhone(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\s-]/g, "").replace(/^\+98/, "0");
}

export async function loginAdmin(formData: FormData) {
  const phone = normalizePhone(formData.get("phone"));
  const code = typeof formData.get("code") === "string" ? String(formData.get("code")).trim() : "";

  if (!/^09\d{9}$/.test(phone)) redirect("/admin-login?error=شماره موبایل معتبر نیست.");
  if (!isConfiguredAdminPhone(phone) || !verifyAccessCode(code)) {
    redirect("/admin-login?error=شماره موبایل یا کد دسترسی صحیح نیست.");
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: { role: "MANAGER", displayName: "مدیر BeautyOS" },
    create: { phone, role: "MANAGER", displayName: "مدیر BeautyOS" }
  });

  await createAdminSession(user.id);
  redirect("/admin");
}
