"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { removePaymentReceipt, savePaymentReceipt } from "@/lib/payment-receipt";
import { expireStaleOrders } from "@/lib/order-inventory";

export async function submitPaymentReceipt(orderId: string, formData: FormData) {
  await expireStaleOrders();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { paymentReceipt: true } });
  if (!order || order.status !== "PENDING_PAYMENT" || order.paymentReceipt?.status === "APPROVED") redirect(`/payment/${orderId}?error=locked`);
  const settings = await prisma.manualPaymentSettings.findUnique({ where: { id: "default" } });
  if (!settings?.active) redirect(`/payment/${orderId}?error=disabled`);
  const file = formData.get("receipt");
  if (!(file instanceof File)) redirect(`/payment/${orderId}?error=file`);
  let imageUrl: string;
  try { imageUrl = await savePaymentReceipt(file); }
  catch (error) { redirect(`/payment/${orderId}?error=${encodeURIComponent(error instanceof Error ? error.message : "فایل معتبر نیست.")}`); }
  const oldUrl = order.paymentReceipt?.imageUrl;
  await prisma.paymentReceipt.upsert({
    where: { orderId },
    update: { imageUrl, status: "PENDING", customerNote: String(formData.get("customerNote") || "").trim() || null, adminNote: null, reviewedAt: null },
    create: { orderId, imageUrl, customerNote: String(formData.get("customerNote") || "").trim() || null }
  });
  if (oldUrl && oldUrl !== imageUrl) await removePaymentReceipt(oldUrl);
  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/admin/orders");
  redirect(`/payment/${orderId}?submitted=1`);
}
