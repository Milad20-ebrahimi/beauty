"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE, normalizeQuantity } from "@/lib/cart";
import { routineSlots } from "@/features/routine/routine-builder";

async function getOrCreateCart() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  }
  const existingCart = await prisma.cart.findFirst({ where: { sessionId }, select: { id: true } });
  return existingCart ? prisma.cart.findUniqueOrThrow({ where: { id: existingCart.id } }) : prisma.cart.create({ data: { sessionId } });
}

async function addProductIds(productIds: string[]) {
  const uniqueIds = [...new Set(productIds)];
  if (!uniqueIds.length) return;
  const products = await prisma.product.findMany({ where: { id: { in: uniqueIds }, status: "ACTIVE" }, select: { id: true, stock: true, reservedStock: true } });
  const available = products.filter((product) => product.stock - product.reservedStock > 0);
  if (!available.length) return;
  const cart = await getOrCreateCart();
  await prisma.$transaction(available.map((product) => prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } }, update: {}, create: { cartId: cart.id, productId: product.id, quantity: 1 }
  })));
}

export async function addToCart(formData: FormData) {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId) redirect("/cart?error=invalid");
  await addProductIds([productId]);
  revalidatePath("/cart");
  redirect("/cart?added=1");
}

export async function addRoutineToCart(formData: FormData) {
  const productIds = routineSlots.flatMap((slot) => {
    const value = formData.get(slot.key);
    return typeof value === "string" && value ? [value] : [];
  });
  await addProductIds(productIds);
  revalidatePath("/cart");
  redirect("/cart?from=routine");
}

export async function updateCartItem(formData: FormData) {
  const itemId = formData.get("itemId");
  const quantity = normalizeQuantity(formData.get("quantity"));
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  if (typeof itemId !== "string" || !sessionId) redirect("/cart");
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { sessionId } }, include: { product: { select: { stock: true, reservedStock: true } } } });
  if (!item) redirect("/cart?error=invalid");
  const availableStock = Math.max(0, item.product.stock - item.product.reservedStock);
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: Math.min(quantity, availableStock || 1) } });
  revalidatePath("/cart");
  redirect(quantity > availableStock ? "/cart?error=stock" : "/cart?updated=1");
}

export async function removeCartItem(formData: FormData) {
  const itemId = formData.get("itemId");
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  if (typeof itemId === "string" && sessionId) await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { sessionId } } });
  revalidatePath("/cart");
  redirect("/cart?removed=1");
}
