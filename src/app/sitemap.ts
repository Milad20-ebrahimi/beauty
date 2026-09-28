import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSeoSettings } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, products] = await Promise.all([getSeoSettings(), prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } })]);
  const pages = ["", "/products", "/needs", "/passport", "/recommendations", "/routine"];
  return [...pages.map((path, index) => ({ url: `${seo.siteUrl}${path}`, lastModified: new Date(), changeFrequency: index < 2 ? "daily" as const : "weekly" as const, priority: index === 0 ? 1 : .8 })), ...products.map((product) => ({ url: `${seo.siteUrl}/products/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: .9 }))];
}
