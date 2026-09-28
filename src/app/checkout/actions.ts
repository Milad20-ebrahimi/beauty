"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { DISCOUNT_COOKIE, resolveDiscount } from "@/lib/discount";
import { createCustomerNotification } from "@/lib/notifications";

const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
const cleanText = (value: string) => value.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "").replace(/\s+/g, " ").trim();
const read = (formData: FormData, name: string) => cleanText(String(formData.get(name) || ""));
const onlyDigits = (value: string) => toEnglishDigits(value).replace(/[^0-9]/g, "");

function normalizeIranianPhone(value: string) {
  const digits = onlyDigits(value);
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98")) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
}

export async function placeOrder(formData: FormData) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  const discountCode = cookieStore.get(DISCOUNT_COOKIE)?.value;
  if (!sessionId) redirect("/cart");

  const recipientName = read(formData, "recipientName");
  const phone = normalizeIranianPhone(read(formData, "phone"));
  const province = read(formData, "province");
  const city = read(formData, "city");
  const addressLine = read(formData, "addressLine");
  const postalCode = onlyDigits(read(formData, "postalCode"));
  const deliveryNote = read(formData, "deliveryNote");
  const shippingMethodId = read(formData, "shippingMethodId");

  if (recipientName.length < 2) redirect("/checkout?error=name");
  if (!/^09\d{9}$/.test(phone)) redirect("/checkout?error=phone");
  if (province.length < 2) redirect("/checkout?error=province");
  if (city.length < 2) redirect("/checkout?error=city");
  if (addressLine.length < 6) redirect("/checkout?error=address");
  if (postalCode && !/^\d{10}$/.test(postalCode)) redirect("/checkout?error=postal");
  if (!shippingMethodId) redirect("/checkout?error=shipping");

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({ where: { sessionId }, include: { items: true } });
      if (!cart?.items.length) throw new Error("EMPTY_CART");
      const productIds = cart.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds }, status: "ACTIVE" } });
      const productById = new Map(products.map((product) => [product.id, product]));

      for (const item of cart.items) {
        const product = productById.get(item.productId);
        if (!product || product.stock - product.reservedStock < item.quantity) throw new Error("OUT_OF_STOCK");
      }

      const user = await tx.user.upsert({
        where: { phone },
        update: { displayName: recipientName },
        create: { phone, displayName: recipientName }
      });
      const subtotal = cart.items.reduce((sum, item) => sum + (productById.get(item.productId)?.price || 0) * item.quantity, 0);
      const discountResult = discountCode ? await resolveDiscount(tx, discountCode, cart.items.map((item) => {
        const product = productById.get(item.productId)!;
        return { productId: product.id, categoryId: product.categoryId, price: product.price, quantity: item.quantity };
      }), user.id) : null;
      if (discountResult && !discountResult.ok) throw new Error(`DISCOUNT_${discountResult.error.toUpperCase()}`);
      const appliedDiscount = discountResult?.ok ? discountResult : null;
      const discount = appliedDiscount?.amount || 0;
      const shippingMethod = await tx.shippingMethod.findFirst({ where: { id: shippingMethodId, active: true } });
      if (!shippingMethod) throw new Error("INVALID_SHIPPING");
      const shippingFee = shippingMethod.freeAbove && subtotal >= shippingMethod.freeAbove ? 0 : shippingMethod.price;
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING_PAYMENT",
          subtotal,
          discount,
          shippingFee,
          total: Math.max(0, subtotal - discount) + shippingFee,
          discountCodeId: appliedDiscount?.discountCode.id,
          discountCodeText: appliedDiscount?.code,
          shippingMethodId: shippingMethod.id,
          shippingMethodTitle: shippingMethod.title,
          shippingEstimate: shippingMethod.estimatedDays,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          items: { create: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: productById.get(item.productId)!.price })) },
          address: { create: { recipientName, phone, province, city, addressLine, postalCode: postalCode || null, deliveryNote: deliveryNote || null } }
        }
      });
      if (appliedDiscount) {
        await tx.discountUsage.create({ data: { discountCodeId: appliedDiscount.discountCode.id, orderId: createdOrder.id, userId: user.id, amount: discount } });
      }
      for (const item of cart.items) {
        await tx.product.update({ where: { id: item.productId }, data: { reservedStock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, orderId: createdOrder.id, type: "RESERVATION", reservedDelta: item.quantity, note: "رزرو موجودی هنگام ثبت سفارش" } });
      }
      await createCustomerNotification(tx, { userId: user.id, type: NotificationType.ORDER, title: "سفارش ثبت شد", message: `سفارش ${createdOrder.id.slice(-8)} ثبت شد و تا ۲۴ ساعت منتظر پرداخت است.`, href: `/payment/${createdOrder.id}`, eventKey: `order-created-${createdOrder.id}` });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return createdOrder;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    cookieStore.delete(DISCOUNT_COOKIE);
    redirect(`/order-success/${order.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "EMPTY_CART") redirect("/cart");
    if (error instanceof Error && error.message === "OUT_OF_STOCK") redirect("/checkout?error=stock");
    if (error instanceof Error && error.message === "INVALID_SHIPPING") redirect("/checkout?error=shipping");
    if (error instanceof Error && error.message.startsWith("DISCOUNT_")) redirect(`/checkout?error=${error.message.toLowerCase()}`);
    throw error;
  }
}
