"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") || "");
  const requestedStatus = String(formData.get("status") || "");
  if (!Object.values(OrderStatus).includes(requestedStatus as OrderStatus)) redirect("/admin/orders?error=invalid");

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === "CANCELLED") redirect("/admin/orders?error=locked");
  const status = requestedStatus as OrderStatus;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status } });
    if (status === "CANCELLED") {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { reservedStock: true } });
        await tx.product.update({ where: { id: item.productId }, data: { reservedStock: Math.max(0, (product?.reservedStock || 0) - item.quantity) } });
      }
    }
  });
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
  await prisma.$transaction([
    prisma.paymentReceipt.update({ where: { id: receipt.id }, data: { status: decision === "approve" ? "APPROVED" : "REJECTED", adminNote: adminNote || null, reviewedAt: new Date() } }),
    ...(decision === "approve" ? [prisma.order.update({ where: { id: receipt.orderId }, data: { status: "PAID" } })] : [])
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/payment/${receipt.orderId}`);
  redirect(`/admin/orders?receipt=${decision}`);
}
