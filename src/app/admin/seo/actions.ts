"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const value = (formData: FormData, name: string) => String(formData.get(name) || "").trim();
export async function saveSeoSettings(formData: FormData) {
  await requireAdmin();
  const siteUrl = value(formData, "siteUrl").replace(/\/$/, "");
  const defaultDescription = value(formData, "defaultDescription");
  if (!/^https?:\/\//.test(siteUrl) || defaultDescription.length < 50) redirect("/admin/seo?error=validation");
  const data = { siteName: value(formData, "siteName"), defaultTitle: value(formData, "defaultTitle"), titleTemplate: value(formData, "titleTemplate") || "%s | BeautyOS", defaultDescription, siteUrl, organizationName: value(formData, "organizationName") || null, logoUrl: value(formData, "logoUrl") || null, googleVerification: value(formData, "googleVerification") || null, allowIndexing: formData.get("allowIndexing") === "on" };
  if (data.siteName.length < 2 || data.defaultTitle.length < 10 || !data.titleTemplate.includes("%s")) redirect("/admin/seo?error=validation");
  await prisma.seoSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  revalidatePath("/", "layout");
  redirect("/admin/seo?success=1");
}
