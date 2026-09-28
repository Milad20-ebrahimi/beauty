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
