"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { finalizePaidOrder, releaseOrderReservation } from "@/lib/order-inventory";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const requestedStatus = String(formData.get("status") || "");
  if (!Object.values(OrderStatus).includes(requestedStatus as OrderStatus)) redirect("/admin/orders?error=invalid");

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === "CANCELLED" || (requestedStatus === "CANCELLED" && order.status !== "PENDING_PAYMENT")) redirect("/admin/orders?error=locked");
  const status = requestedStatus as OrderStatus;

  if (status === "CANCELLED") await releaseOrderReservation(order.id, "لغو سفارش توسط مدیر");
  else await prisma.order.update({ where: { id: order.id }, data: { status } });
  revalidatePath("/admin/orders");
  redirect("/admin/orders?updated=1");
}

export async function reviewPaymentReceipt(formData: FormData) {
  await requireAdmin();
  const receiptId = String(formData.get("receiptId") || "");
  const decision = String(formData.get("decision") || "");
  const adminNote = String(formData.get("adminNote") || "").trim();
  if (!receiptId || !["approve", "reject"].includes(decision) || (decision === "reject" && adminNote.length < 3)) redirect("/admin/orders?error=receipt");
  const receipt = await prisma.paymentReceipt.findUnique({ where: { id: receiptId }, include: { order: true } });
  if (!receipt || receipt.status !== "PENDING" || receipt.order.status !== "PENDING_PAYMENT") redirect("/admin/orders?error=locked");
  await prisma.$transaction(async (tx) => {
    await tx.paymentReceipt.update({ where: { id: receipt.id }, data: { status: decision === "approve" ? "APPROVED" : "REJECTED", adminNote: adminNote || null, reviewedAt: new Date() } });
    if (decision === "approve") await finalizePaidOrder(receipt.orderId, tx);
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/payment/${receipt.orderId}`);
  redirect(`/admin/orders?receipt=${decision}`);
}
