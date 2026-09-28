"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function adjustInventory(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const newStock = Math.max(0, Math.round(Number(formData.get("stock"))));
  const note = String(formData.get("note") || "").trim();
  if (!productId || !Number.isFinite(newStock) || note.length < 3) redirect("/admin/inventory?error=validation");
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true, reservedStock: true } });
  if (!product || newStock < product.reservedStock) redirect("/admin/inventory?error=reserved");
  const delta = newStock - product.stock;
  if (delta !== 0) await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
    prisma.inventoryMovement.create({ data: { productId, type: "ADJUSTMENT", stockDelta: delta, note } })
  ]);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  redirect("/admin/inventory?updated=1");
}
