"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { DISCOUNT_COOKIE, normalizeDiscountCode, resolveDiscount } from "@/lib/discount";

export async function applyDiscountCode(formData: FormData) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  const code = normalizeDiscountCode(String(formData.get("code") || ""));
  if (!sessionId || !code) redirect("/cart?discountError=empty");

  const cart = await prisma.cart.findFirst({
    where: { sessionId },
    include: { items: { include: { product: { select: { id: true, categoryId: true, price: true } } } } }
  });
  if (!cart?.items.length) redirect("/cart");

  const result = await resolveDiscount(prisma, code, cart.items.map((item) => ({
    productId: item.product.id,
    categoryId: item.product.categoryId,
    price: item.product.price,
    quantity: item.quantity
  })));
  if (!result.ok) redirect(`/cart?discountError=${result.error}`);

  cookieStore.set(DISCOUNT_COOKIE, result.code, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  redirect("/cart?discountApplied=1");
}

export async function removeDiscountCode() {
  (await cookies()).delete(DISCOUNT_COOKIE);
  redirect("/cart?discountRemoved=1");
}
