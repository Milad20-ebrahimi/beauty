"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const value = (formData: FormData, name: string) => String(formData.get(name) || "").replace(/\s+/g, " ").trim();
const optional = (formData: FormData, name: string) => value(formData, name) || null;
function safeUrl(formData: FormData, name: string) {
  const url = optional(formData, name);
  if (!url) return null;
  if (url.startsWith("/") || /^https?:\/\//i.test(url)) return url;
  throw new Error("INVALID_URL");
}

export async function saveStoreSettings(formData: FormData) {
  await requireAdmin();
  const storeName = value(formData, "storeName");
  const tagline = value(formData, "tagline");
  if (storeName.length < 2 || tagline.length < 3) redirect("/admin/store-settings?error=required");
  try {
    await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        storeName,
        tagline,
        logoUrl: safeUrl(formData, "logoUrl"),
        supportPhone: optional(formData, "supportPhone"),
        supportEmail: optional(formData, "supportEmail"),
        supportHours: optional(formData, "supportHours"),
        address: optional(formData, "address"),
        instagramUrl: safeUrl(formData, "instagramUrl"),
        telegramUrl: safeUrl(formData, "telegramUrl"),
        whatsappUrl: safeUrl(formData, "whatsappUrl"),
        announcementText: optional(formData, "announcementText"),
        announcementLink: safeUrl(formData, "announcementLink"),
        announcementActive: formData.get("announcementActive") === "on",
        footerAbout: optional(formData, "footerAbout"),
        shippingNotice: optional(formData, "shippingNotice")
      },
      create: {
        id: "default",
        storeName,
        tagline,
        logoUrl: safeUrl(formData, "logoUrl"),
        supportPhone: optional(formData, "supportPhone"),
        supportEmail: optional(formData, "supportEmail"),
        supportHours: optional(formData, "supportHours"),
        address: optional(formData, "address"),
        instagramUrl: safeUrl(formData, "instagramUrl"),
        telegramUrl: safeUrl(formData, "telegramUrl"),
        whatsappUrl: safeUrl(formData, "whatsappUrl"),
        announcementText: optional(formData, "announcementText"),
        announcementLink: safeUrl(formData, "announcementLink"),
        announcementActive: formData.get("announcementActive") === "on",
        footerAbout: optional(formData, "footerAbout"),
        shippingNotice: optional(formData, "shippingNotice")
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_URL") redirect("/admin/store-settings?error=url");
    throw error;
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/store-settings");
  redirect("/admin/store-settings?success=saved");
}
