"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") || "");
  const decision = String(formData.get("decision") || "");
  const adminReply = String(formData.get("adminReply") || "").trim();
  if (!reviewId || !["approve", "reject"].includes(decision)) redirect("/admin/reviews?error=invalid");
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { product: true } });
  if (!review) redirect("/admin/reviews?error=missing");
  await prisma.review.update({ where: { id: review.id }, data: { status: decision === "approve" ? "APPROVED" : "REJECTED", adminReply: adminReply || null, reviewedAt: new Date() } });
  revalidatePath("/admin/reviews"); revalidatePath(`/products/${review.product.slug}`); revalidatePath("/recommendations");
  redirect(`/admin/reviews?success=${decision}`);
}
