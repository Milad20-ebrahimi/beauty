import type { Metadata } from "next";
import "./globals.css";
import { SiteNavigation } from "./site-navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { getCustomerUser } from "@/lib/auth";
import { getSeoSettings } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return { metadataBase: new URL(seo.siteUrl), title: { default: seo.defaultTitle, template: seo.titleTemplate }, description: seo.defaultDescription, alternates: { canonical: "/" }, verification: seo.googleVerification ? { google: seo.googleVerification } : undefined, robots: { index: seo.allowIndexing, follow: seo.allowIndexing, googleBot: { index: seo.allowIndexing, follow: seo.allowIndexing, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }, openGraph: { type: "website", locale: "fa_IR", siteName: seo.siteName, title: seo.defaultTitle, description: seo.defaultDescription, url: "/" }, twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.defaultDescription } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  const [cart, customer] = await Promise.all([sessionId ? prisma.cart.findFirst({ where: { sessionId }, select: { items: { select: { quantity: true } } } }) : null, getCustomerUser()]);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const notificationCount = customer ? await prisma.notification.count({ where: { userId: customer.id, readAt: null } }) : 0;
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="site-header-wrap">
          <header className="site-header">
            <a href="/" className="brand-mark" aria-label="BeautyOS - صفحه اصلی">
              <span className="brand-symbol">B</span>
              <span className="brand-copy">
                <strong>BeautyOS</strong>
                <small>انتخاب زیبایی، براساس خودت</small>
              </span>
            </a>
            <SiteNavigation cartCount={cartCount} notificationCount={notificationCount} />
          </header>
        </div>
        {children}
      </body>
    </html>
  );
}
