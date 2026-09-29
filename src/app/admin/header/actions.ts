"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const read = (data: FormData, key: string) => String(data.get(key) || "").replace(/\s+/g, " ").trim();
const optional = (data: FormData, key: string) => read(data, key) || null;
const validUrl = (value: string | null) => !value || value.startsWith("/") || /^https?:\/\//i.test(value);
const color = (value: string, fallback: string) => /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;

export async function saveHeaderSettings(formData: FormData) {
  await requireAdmin();
  const storeName = read(formData, "storeName");
  const tagline = read(formData, "tagline");
  const announcementText = read(formData, "announcementText");
  const announcementLink = optional(formData, "announcementLink");
  const logoUrl = optional(formData, "logoUrl");
  const instagramUrl = optional(formData, "instagramUrl");
  const telegramUrl = optional(formData, "telegramUrl");
  const whatsappUrl = optional(formData, "whatsappUrl");
  const navItems = Array.from({ length: 6 }, (_, index) => ({ label: read(formData, `navLabel${index}`), href: read(formData, `navHref${index}`), active: formData.get(`navActive${index}`) === "on" })).filter((item) => item.label && item.href);
  const urls = [announcementLink, logoUrl, instagramUrl, telegramUrl, whatsappUrl, ...navItems.map((item) => item.href)];
  if (storeName.length < 2 || tagline.length < 3 || !announcementText || !navItems.length || urls.some((url) => !validUrl(url))) redirect("/admin/header?error=invalid");

  const announcementActive = formData.get("announcementActive") === "on";
  await prisma.$transaction([
    prisma.headerSettings.upsert({
      where: { id: "default" },
      update: { announcementActive, announcementText, announcementLink, announcementLinkText: optional(formData, "announcementLinkText"), announcementBackground: color(read(formData, "announcementBackground"), "#D8A7B1"), announcementColor: color(read(formData, "announcementColor"), "#4A1729"), navItems },
      create: { id: "default", announcementActive, announcementText, announcementLink, announcementLinkText: optional(formData, "announcementLinkText"), announcementBackground: color(read(formData, "announcementBackground"), "#D8A7B1"), announcementColor: color(read(formData, "announcementColor"), "#4A1729"), navItems }
    }),
    prisma.storeSettings.upsert({
      where: { id: "default" },
      update: { storeName, tagline, logoUrl, supportPhone: optional(formData, "supportPhone"), supportEmail: optional(formData, "supportEmail"), supportHours: optional(formData, "supportHours"), address: optional(formData, "address"), instagramUrl, telegramUrl, whatsappUrl, announcementText, announcementLink, announcementActive, footerAbout: optional(formData, "footerAbout"), shippingNotice: optional(formData, "shippingNotice") },
      create: { id: "default", storeName, tagline, logoUrl, supportPhone: optional(formData, "supportPhone"), supportEmail: optional(formData, "supportEmail"), supportHours: optional(formData, "supportHours"), address: optional(formData, "address"), instagramUrl, telegramUrl, whatsappUrl, announcementText, announcementLink, announcementActive, footerAbout: optional(formData, "footerAbout"), shippingNotice: optional(formData, "shippingNotice") }
    })
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/admin/header");
  revalidatePath("/admin/store-settings");
  redirect("/admin/header?success=saved");
}
