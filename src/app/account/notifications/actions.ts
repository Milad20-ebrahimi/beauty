"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";

export async function openNotification(formData: FormData) {
  const user = await requireCustomer();
  const id = String(formData.get("id") || "");
  const item = await prisma.notification.findFirst({ where: { id, userId: user.id } });
  if (!item) redirect("/account/notifications?error=missing");
  if (!item.readAt) await prisma.notification.update({ where: { id: item.id }, data: { readAt: new Date() } });
  revalidatePath("/account/notifications"); revalidatePath("/account");
  redirect(item.href && item.href.startsWith("/") && !item.href.startsWith("//") ? item.href : "/account/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireCustomer();
  await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/account/notifications"); revalidatePath("/account");
  redirect("/account/notifications?allRead=1");
}
