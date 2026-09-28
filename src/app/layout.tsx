import type { Metadata } from "next";
import "./globals.css";
import { SiteNavigation } from "./site-navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { getCustomerUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "BeautyOS",
  description: "فروشگاه زیبایی که کمک می‌کند محصول اشتباه نخرید."
};

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
