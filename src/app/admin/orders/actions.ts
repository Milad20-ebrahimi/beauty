"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NotificationType, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { finalizePaidOrder, releaseOrderReservation } from "@/lib/order-inventory";
import { createCustomerNotification } from "@/lib/notifications";

const statusMessages: Partial<Record<OrderStatus, { title: string; message: string; type: NotificationType }>> = {
  PROCESSING: { title: "سفارش در حال آماده‌سازی است", message: "پردازش سفارش شما شروع شده و محصولات در حال بسته‌بندی هستند.", type: NotificationType.ORDER },
  SHIPPED: { title: "سفارش ارسال شد", message: "بسته شما تحویل شرکت حمل شده و در مسیر رسیدن به شماست.", type: NotificationType.SHIPPING },
  DELIVERED: { title: "سفارش تحویل شد", message: "سفارش تحویل‌شده ثبت شد. حالا می‌توانید تجربه محصولات را بنویسید.", type: NotificationType.SHIPPING },
  CANCELLED: { title: "سفارش لغو شد", message: "سفارش لغو و موجودی رزروشده آزاد شد.", type: NotificationType.ORDER }
};

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
  const notification = statusMessages[status];
  if (notification && status !== order.status) await createCustomerNotification(prisma, { userId: order.userId, ...notification, href: "/account", eventKey: `order-status-${order.id}-${status}` });
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
    await createCustomerNotification(tx, { userId: receipt.order.userId, type: NotificationType.PAYMENT, title: decision === "approve" ? "پرداخت تأیید شد" : "رسید پرداخت رد شد", message: decision === "approve" ? "پرداخت سفارش تأیید شد و سفارش وارد مرحله آماده‌سازی می‌شود." : `رسید نیاز به اصلاح دارد: ${adminNote}`, href: `/payment/${receipt.orderId}`, eventKey: `receipt-review-${receipt.id}-${decision}-${receipt.updatedAt.getTime()}` });
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/payment/${receipt.orderId}`);
  redirect(`/admin/orders?receipt=${decision}`);
}
