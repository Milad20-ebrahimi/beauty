export const CART_COOKIE = "beauty_cart_session";

export function normalizeQuantity(value: FormDataEntryValue | null, fallback = 1) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(1, Math.min(20, parsed)) : fallback;
}
