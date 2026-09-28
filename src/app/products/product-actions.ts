"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMPARE_COOKIE } from "@/lib/compare";

const text = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
const safePath = (value: string, fallback = "/products") => value.startsWith("/") && !value.startsWith("//") ? value : fallback;
const withMessage = (path: string, key: string, value = "1") => `${path}${path.includes("?") ? "&" : "?"}${key}=${value}`;

export async function toggleFavorite(formData: FormData) {
  const productId = text(formData, "productId");
  const returnTo = safePath(text(formData, "returnTo"));
  const user = await getCustomerUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } });
  if (!product) redirect(withMessage(returnTo, "favoriteError"));
  const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  if (existing) await prisma.favorite.delete({ where: { id: existing.id } });
  else await prisma.favorite.create({ data: { userId: user.id, productId } });
  revalidatePath("/products"); revalidatePath("/account/favorites");
  redirect(withMessage(returnTo, existing ? "favoriteRemoved" : "favoriteAdded"));
}

export async function toggleCompare(formData: FormData) {
  const productId = text(formData, "productId");
  const returnTo = safePath(text(formData, "returnTo"));
  const cookieStore = await cookies();
  const ids = (cookieStore.get(COMPARE_COOKIE)?.value || "").split(",").filter(Boolean);
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  if (!exists && ids.length >= 4) redirect(withMessage(returnTo, "compareError", "limit"));
  cookieStore.set(COMPARE_COOKIE, next.join(","), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  redirect(withMessage(returnTo, exists ? "compareRemoved" : "compareAdded"));
}

export async function clearCompare() {
  (await cookies()).delete(COMPARE_COOKIE);
  redirect("/compare?cleared=1");
}
