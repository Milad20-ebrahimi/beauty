"use server";

import { redirect } from "next/navigation";
import { SkinType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";

const text = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
const integer = (formData: FormData, name: string, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(text(formData, name)) || min)));

export async function createVerifiedReview(formData: FormData) {
  const user = await requireCustomer();
  const orderItemId = text(formData, "orderItemId");
  const item = await prisma.orderItem.findFirst({ where: { id: orderItemId, order: { userId: user.id, status: "DELIVERED" }, review: null }, include: { order: true } });
  if (!item) redirect("/account?reviewError=invalid");
  const title = text(formData, "title");
  const body = text(formData, "body");
  const skinTypeRaw = text(formData, "skinType");
  const skinType = Object.values(SkinType).includes(skinTypeRaw as SkinType) ? skinTypeRaw as SkinType : SkinType.UNKNOWN;
  const rating = integer(formData, "rating", 1, 5);
  const daysUsed = integer(formData, "daysUsed", 1, 3650);
  if (title.length < 3 || body.length < 15 || skinType === "UNKNOWN") redirect(`/account/reviews/new?orderItem=${item.id}&error=validation`);
  await prisma.review.create({ data: { productId: item.productId, userId: user.id, orderItemId: item.id, source: "VERIFIED_PURCHASE", status: "PENDING", rating, title, body, skinTypeAtReview: skinType, wouldRepurchase: formData.get("wouldRepurchase") === "yes", outcome: { create: { satisfaction: rating, irritation: formData.get("irritation") === "yes", helpedConcern: formData.get("helpedConcern") === "yes", daysUsed, outcomeSummary: text(formData, "outcomeSummary") || null } } } });
  redirect("/account?reviewSubmitted=1");
}
