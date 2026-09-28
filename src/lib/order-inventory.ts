import "server-only";

import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCustomerNotification } from "@/lib/notifications";

export const ORDER_HOLD_HOURS = 24;

export async function expireStaleOrders() {
  const staleOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      inventoryFinalizedAt: null,
      expiresAt: { lte: new Date() },
      OR: [{ paymentReceipt: null }, { paymentReceipt: { status: "REJECTED" } }]
    },
    select: { id: true }
  });
  for (const order of staleOrders) await releaseOrderReservation(order.id, "انقضای مهلت پرداخت");
  return staleOrders.length;
}

export async function releaseOrderReservation(orderId: string, note: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.inventoryFinalizedAt || order.status !== "PENDING_PAYMENT") return false;
    for (const item of order.items) {
      const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId }, select: { reservedStock: true } });
      const released = Math.min(product.reservedStock, item.quantity);
      await tx.product.update({ where: { id: item.productId }, data: { reservedStock: { decrement: released } } });
      await tx.inventoryMovement.create({ data: { productId: item.productId, orderId, type: "RELEASE", reservedDelta: -released, note } });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED", inventoryFinalizedAt: new Date() } });
    await createCustomerNotification(tx, { userId: order.userId, type: NotificationType.ORDER, title: "سفارش لغو شد", message: note === "انقضای مهلت پرداخت" ? "مهلت ۲۴ ساعته پرداخت تمام شد و موجودی رزروشده آزاد شد." : "سفارش لغو و موجودی رزروشده آزاد شد.", href: "/account", eventKey: `order-status-${order.id}-CANCELLED` });
    return true;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function finalizePaidOrder(orderId: string, tx: Prisma.TransactionClient) {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.inventoryFinalizedAt || order.status !== "PENDING_PAYMENT") throw new Error("ORDER_NOT_PAYABLE");
  for (const item of order.items) {
    const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId }, select: { stock: true, reservedStock: true } });
    if (product.stock < item.quantity || product.reservedStock < item.quantity) throw new Error("INVALID_INVENTORY");
    await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, reservedStock: { decrement: item.quantity } } });
    await tx.inventoryMovement.create({ data: { productId: item.productId, orderId, type: "SALE", stockDelta: -item.quantity, reservedDelta: -item.quantity, note: "قطعی‌شدن فروش پس از تأیید رسید" } });
  }
  await tx.order.update({ where: { id: orderId }, data: { status: "PAID", expiresAt: null, inventoryFinalizedAt: new Date() } });
}
