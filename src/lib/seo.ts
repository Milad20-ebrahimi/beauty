import "server-only";
import { prisma } from "@/lib/prisma";

export const SEO_DEFAULTS = {
  siteName: "BeautyOS",
  defaultTitle: "BeautyOS | انتخاب هوشمند محصولات زیبایی",
  titleTemplate: "%s | BeautyOS",
  defaultDescription: "فروشگاه محصولات آرایشی و مراقبت پوست با پیشنهاد شخصی، مقایسه و تجربه خریداران واقعی.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  organizationName: "BeautyOS",
  logoUrl: null,
  googleVerification: null,
  allowIndexing: false
};

export async function getSeoSettings() {
  return (await prisma.seoSettings.findUnique({ where: { id: "default" } })) || SEO_DEFAULTS;
}

export function absoluteUrl(base: string, path: string) {
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}
