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
        <header className="site-header">
          <a href="/" className="brand-mark">
            <span>BeautyOS</span>
            <small>Beauty Passport</small>
          </a>
          <nav className="site-nav" aria-label="ناوبری اصلی">
            <a href="/passport">پروفایل زیبایی</a>
            <a href="/recommendations">پیشنهادها</a>
            <a href="/needs">نیازها</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
