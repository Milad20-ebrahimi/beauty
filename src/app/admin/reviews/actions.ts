"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { createCustomerNotification } from "@/lib/notifications";

export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") || "");
  const decision = String(formData.get("decision") || "");
  const adminReply = String(formData.get("adminReply") || "").trim();
  if (!reviewId || !["approve", "reject"].includes(decision)) redirect("/admin/reviews?error=invalid");
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { product: true } });
  if (!review) redirect("/admin/reviews?error=missing");
  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: review.id }, data: { status: decision === "approve" ? "APPROVED" : "REJECTED", adminReply: adminReply || null, reviewedAt: new Date() } });
    await createCustomerNotification(tx, { userId: review.userId, type: NotificationType.REVIEW, title: decision === "approve" ? "نظر شما منتشر شد" : "نظر نیاز به اصلاح دارد", message: decision === "approve" ? `تجربه شما درباره «${review.product.title}» منتشر شد.` : `نظر شما درباره «${review.product.title}» منتشر نشد.${adminReply ? ` پاسخ مدیر: ${adminReply}` : ""}`, href: `/products/${review.product.slug}`, eventKey: `review-moderated-${review.id}-${decision}` });
  });
  revalidatePath("/admin/reviews"); revalidatePath(`/products/${review.product.slug}`); revalidatePath("/recommendations");
  redirect(`/admin/reviews?success=${decision}`);
}
