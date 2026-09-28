"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const text = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
const number = (formData: FormData, name: string) => Math.max(0, Math.round(Number(text(formData, name)) || 0));

function shippingData(formData: FormData) {
  const freeAbove = number(formData, "freeAbove");
  return { title: text(formData, "title"), description: text(formData, "description") || null, price: number(formData, "price"), freeAbove: freeAbove || null, estimatedDays: text(formData, "estimatedDays") || null, active: formData.get("active") === "on", sortOrder: number(formData, "sortOrder") };
}

export async function createShippingMethod(formData: FormData) {
  await requireAdmin();
  const data = shippingData(formData);
  if (data.title.length < 2) redirect("/admin/shipping?error=title");
  await prisma.shippingMethod.create({ data });
  revalidatePath("/admin/shipping");
  redirect("/admin/shipping?success=created");
}

export async function updateShippingMethod(id: string, formData: FormData) {
  await requireAdmin();
  const data = shippingData(formData);
  if (data.title.length < 2) redirect("/admin/shipping?error=title");
  await prisma.shippingMethod.update({ where: { id }, data });
  revalidatePath("/admin/shipping");
  redirect("/admin/shipping?success=updated");
}

export async function deleteShippingMethod(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const method = await prisma.shippingMethod.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!method) redirect("/admin/shipping?error=missing");
  if (method._count.orders > 0) redirect("/admin/shipping?error=used");
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/admin/shipping");
  redirect("/admin/shipping?success=deleted");
}
