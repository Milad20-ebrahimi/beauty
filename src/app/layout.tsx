import type { Metadata } from "next";
import "./globals.css";
import { SiteNavigation } from "./site-navigation";

export const metadata: Metadata = {
  title: "BeautyOS",
  description: "فروشگاه زیبایی که کمک می‌کند محصول اشتباه نخرید."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
            <SiteNavigation />
          </header>
        </div>
        {children}
      </body>
    </html>
  );
}
