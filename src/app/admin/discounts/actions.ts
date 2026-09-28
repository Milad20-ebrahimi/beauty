"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeDiscountCode } from "@/lib/discount";

const text = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
const number = (formData: FormData, name: string) => Math.max(0, Math.round(Number(text(formData, name)) || 0));
const optionalNumber = (formData: FormData, name: string) => text(formData, name) ? number(formData, name) : null;
const optionalDate = (formData: FormData, name: string) => text(formData, name) ? new Date(text(formData, name)) : null;

function discountData(formData: FormData) {
  const type = text(formData, "type") === "FIXED" ? DiscountType.FIXED : DiscountType.PERCENT;
  return {
    code: normalizeDiscountCode(text(formData, "code")), title: text(formData, "title"), type,
    value: number(formData, "value"), minimumSubtotal: number(formData, "minimumSubtotal"),
    maximumDiscount: type === DiscountType.PERCENT ? optionalNumber(formData, "maximumDiscount") : null,
    usageLimit: optionalNumber(formData, "usageLimit"), perCustomerLimit: number(formData, "perCustomerLimit") || 1,
    startsAt: optionalDate(formData, "startsAt"), expiresAt: optionalDate(formData, "expiresAt"),
    productId: text(formData, "productId") || null, categoryId: text(formData, "categoryId") || null,
    active: formData.get("active") === "on"
  };
}

function validate(data: ReturnType<typeof discountData>) {
  if (!/^[A-Z0-9_-]{3,30}$/.test(data.code) || data.title.length < 2 || data.value <= 0) return false;
  if (data.type === "PERCENT" && data.value > 100) return false;
  if (data.startsAt && data.expiresAt && data.startsAt >= data.expiresAt) return false;
  if (data.productId && data.categoryId) return false;
  return true;
}

export async function createDiscountCode(formData: FormData) {
  await requireAdmin();
  const data = discountData(formData);
  if (!validate(data)) redirect("/admin/discounts?error=validation");
  const exists = await prisma.discountCode.findUnique({ where: { code: data.code } });
  if (exists) redirect("/admin/discounts?error=duplicate");
  await prisma.discountCode.create({ data });
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?success=created");
}

export async function updateDiscountCode(id: string, formData: FormData) {
  await requireAdmin();
  const data = discountData(formData);
  if (!validate(data)) redirect("/admin/discounts?error=validation");
  const duplicate = await prisma.discountCode.findFirst({ where: { code: data.code, id: { not: id } } });
  if (duplicate) redirect("/admin/discounts?error=duplicate");
  await prisma.discountCode.update({ where: { id }, data });
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?success=updated");
}

export async function deleteDiscountCode(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const item = await prisma.discountCode.findUnique({ where: { id }, include: { _count: { select: { usages: true } } } });
  if (!item) redirect("/admin/discounts?error=missing");
  if (item._count.usages) redirect("/admin/discounts?error=used");
  await prisma.discountCode.delete({ where: { id } });
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?success=deleted");
}
