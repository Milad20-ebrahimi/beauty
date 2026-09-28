import type { Metadata } from "next";
import "./globals.css";

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
            <nav className="site-nav" aria-label="ناوبری اصلی">
              <a href="/needs">نیازها</a>
              <a href="/recommendations">پیشنهادهای من</a>
              <a href="/routine">روتین من</a>
              <a href="/passport" className="nav-cta">ساخت پروفایل</a>
            </nav>
          </header>
        </div>
        {children}
      </body>
    </html>
  );
}
