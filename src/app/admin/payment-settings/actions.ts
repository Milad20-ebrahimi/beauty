"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const digits = (value: FormDataEntryValue | null) => String(value || "").replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\D/g, "");

export async function savePaymentSettings(formData: FormData) {
  await requireAdmin();
  const cardNumber = digits(formData.get("cardNumber"));
  const holderName = String(formData.get("holderName") || "").trim();
  const ibanDigits = digits(formData.get("iban"));
  if (cardNumber.length !== 16 || holderName.length < 3 || (ibanDigits && ibanDigits.length !== 24)) redirect("/admin/payment-settings?error=validation");
  await prisma.manualPaymentSettings.upsert({ where: { id: "default" }, update: { cardNumber, holderName, iban: ibanDigits ? `IR${ibanDigits}` : null, bankName: String(formData.get("bankName") || "").trim() || null, instructions: String(formData.get("instructions") || "").trim() || null, active: formData.get("active") === "on" }, create: { id: "default", cardNumber, holderName, iban: ibanDigits ? `IR${ibanDigits}` : null, bankName: String(formData.get("bankName") || "").trim() || null, instructions: String(formData.get("instructions") || "").trim() || null, active: formData.get("active") === "on" } });
  revalidatePath("/admin/payment-settings");
  redirect("/admin/payment-settings?saved=1");
}
