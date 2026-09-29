"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { createCustomerNotification } from "@/lib/notifications";

const text = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
export async function updateCustomer(formData: FormData) {
  await requireAdmin();
  const userId = text(formData, "userId");
  const customerNote = text(formData, "customerNote");
  const customerTags = [...new Set(text(formData, "customerTags").split(/[،,]/).map((item) => item.trim()).filter(Boolean))].slice(0, 10);
  const customer = await prisma.user.findFirst({ where: { id: userId, role: "CUSTOMER" } });
  if (!customer) redirect("/admin/customers?error=missing");
  await prisma.user.update({ where: { id: userId }, data: { customerNote: customerNote || null, customerTags } });
  revalidatePath("/admin/customers");
  redirect("/admin/customers?success=saved");
}

export async function toggleCustomerBlock(formData: FormData) {
  await requireAdmin();
  const userId = text(formData, "userId");
  const customer = await prisma.user.findFirst({ where: { id: userId, role: "CUSTOMER" } });
  if (!customer) redirect("/admin/customers?error=missing");
  const blockedAt = customer.blockedAt ? null : new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { blockedAt } });
    if (!blockedAt) await createCustomerNotification(tx, { userId, type: NotificationType.SYSTEM, title: "حساب شما فعال شد", message: "دسترسی حساب دوباره فعال شده است.", href: "/account" });
  });
  revalidatePath("/admin/customers");
  redirect(`/admin/customers?success=${blockedAt ? "blocked" : "activated"}`);
}
