import { DiscountCode, OrderStatus, Prisma, PrismaClient } from "@prisma/client";

export const DISCOUNT_COOKIE = "beauty_discount_code";

type DbClient = PrismaClient | Prisma.TransactionClient;
type DiscountLine = { productId: string; categoryId: string; price: number; quantity: number };
type DiscountError = "empty" | "invalid" | "not_started" | "expired" | "minimum" | "scope" | "limit" | "customer_limit";
export type ResolveDiscountResult =
  | { ok: false; error: DiscountError; minimumSubtotal?: number }
  | { ok: true; discountCode: DiscountCode; code: string; amount: number; subtotal: number; eligibleSubtotal: number };

export function normalizeDiscountCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function resolveDiscount(
  db: DbClient,
  rawCode: string,
  lines: DiscountLine[],
  userId?: string | null
) : Promise<ResolveDiscountResult> {
  const code = normalizeDiscountCode(rawCode);
  if (!code) return { ok: false, error: "empty" };

  const discountCode = await db.discountCode.findUnique({ where: { code } });
  if (!discountCode || !discountCode.active) return { ok: false, error: "invalid" };

  const now = new Date();
  if (discountCode.startsAt && discountCode.startsAt > now) return { ok: false, error: "not_started" };
  if (discountCode.expiresAt && discountCode.expiresAt < now) return { ok: false, error: "expired" };

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (subtotal < discountCode.minimumSubtotal) {
    return { ok: false, error: "minimum", minimumSubtotal: discountCode.minimumSubtotal };
  }

  const eligibleSubtotal = lines.reduce((sum, line) => {
    if (discountCode.productId && line.productId !== discountCode.productId) return sum;
    if (discountCode.categoryId && line.categoryId !== discountCode.categoryId) return sum;
    return sum + line.price * line.quantity;
  }, 0);
  if (eligibleSubtotal <= 0) return { ok: false, error: "scope" };

  const activeOrderFilter: Prisma.DiscountUsageWhereInput = { order: { status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } } };
  if (discountCode.usageLimit) {
    const totalUses = await db.discountUsage.count({ where: { discountCodeId: discountCode.id, ...activeOrderFilter } });
    if (totalUses >= discountCode.usageLimit) return { ok: false, error: "limit" };
  }
  if (userId && discountCode.perCustomerLimit > 0) {
    const customerUses = await db.discountUsage.count({ where: { discountCodeId: discountCode.id, userId, ...activeOrderFilter } });
    if (customerUses >= discountCode.perCustomerLimit) return { ok: false, error: "customer_limit" };
  }

  const rawAmount = discountCode.type === "PERCENT"
    ? Math.floor(eligibleSubtotal * Math.min(discountCode.value, 100) / 100)
    : Math.min(discountCode.value, eligibleSubtotal);
  const amount = Math.max(0, Math.min(rawAmount, discountCode.maximumDiscount || rawAmount));
  if (!amount) return { ok: false, error: "invalid" };

  return { ok: true, discountCode, code, amount, subtotal, eligibleSubtotal };
}
