import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  return { rules: { userAgent: "*", allow: seo.allowIndexing ? "/" : undefined, disallow: seo.allowIndexing ? ["/admin", "/account", "/checkout", "/payment", "/cart"] : "/" }, sitemap: `${seo.siteUrl}/sitemap.xml`, host: seo.siteUrl };
}
