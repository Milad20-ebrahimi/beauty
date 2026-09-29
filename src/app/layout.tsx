import type { Metadata } from "next";
import "./globals.css";
import { SiteNavigation } from "./site-navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { getCustomerUser } from "@/lib/auth";
import { getSeoSettings } from "@/lib/seo";
import { getStoreSettings } from "@/lib/store-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return { metadataBase: new URL(seo.siteUrl), title: { default: seo.defaultTitle, template: seo.titleTemplate }, description: seo.defaultDescription, alternates: { canonical: "/" }, verification: seo.googleVerification ? { google: seo.googleVerification } : undefined, robots: { index: seo.allowIndexing, follow: seo.allowIndexing, googleBot: { index: seo.allowIndexing, follow: seo.allowIndexing, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }, openGraph: { type: "website", locale: "fa_IR", siteName: seo.siteName, title: seo.defaultTitle, description: seo.defaultDescription, url: "/" }, twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.defaultDescription } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  const [cart, customer, store] = await Promise.all([sessionId ? prisma.cart.findFirst({ where: { sessionId }, select: { items: { select: { quantity: true } } } }) : null, getCustomerUser(), getStoreSettings()]);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const notificationCount = customer ? await prisma.notification.count({ where: { userId: customer.id, readAt: null } }) : 0;
  return (
    <html lang="fa" dir="rtl">
      <body>
        {store.announcementActive && store.announcementText ? <div className="site-announcement">{store.announcementLink ? <a href={store.announcementLink}>{store.announcementText}<span>مشاهده ←</span></a> : <p>{store.announcementText}</p>}</div> : null}
        <div className="site-header-wrap">
          <header className="site-header">
            <SiteNavigation cartCount={cartCount} notificationCount={notificationCount} />
            <a href="/" className={`brand-mark ${store.logoUrl ? "" : "wordmark-only"}`} aria-label={`${store.storeName} - صفحه اصلی`}>
              {store.logoUrl ? <span className="brand-symbol has-logo"><img src={store.logoUrl} alt={`لوگوی ${store.storeName}`} /></span> : null}
              <span className="brand-copy">
                <strong>{store.storeName}</strong>
                <small>{store.tagline}</small>
              </span>
            </a>
          </header>
        </div>
        {children}
        <footer className="site-footer"><div className="footer-intro"><p>زیبایی قرار نیست تو را پنهان کند.</p><h2>{store.tagline}</h2><a href="/passport">انتخاب شخصی خودت را پیدا کن ←</a></div><div className="site-footer-grid"><section><a href="/" className="footer-brand"><span>{store.logoUrl ? <img src={store.logoUrl} alt="" /> : store.storeName.charAt(0).toUpperCase()}</span><div><strong>{store.storeName}</strong><small>{store.tagline}</small></div></a><p>{store.footerAbout}</p>{store.shippingNotice ? <b>{store.shippingNotice}</b> : null}</section><section><h2>فروشگاه</h2><a href="/products">همه محصولات</a><a href="/needs">خرید براساس نیاز</a><a href="/recommendations">پیشنهادهای من</a><a href="/compare">مقایسه محصولات</a></section><section><h2>BeautyOS</h2><a href="/passport">Beauty Passport</a><a href="/routine">روتین صبح و شب</a><a href="/account/favorites">علاقه‌مندی‌ها</a><a href="/account">پیگیری سفارش</a></section><section><h2>پشتیبانی</h2>{store.supportPhone ? <a href={`tel:${store.supportPhone}`} dir="ltr">{store.supportPhone}</a> : <span>شماره تماس ثبت نشده</span>}{store.supportEmail ? <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> : null}{store.supportHours ? <p>{store.supportHours}</p> : null}{store.address ? <address>{store.address}</address> : null}</section><section><h2>ما را دنبال کن</h2><div className="footer-socials">{store.instagramUrl ? <a href={store.instagramUrl} target="_blank" rel="noreferrer">اینستاگرام</a> : null}{store.telegramUrl ? <a href={store.telegramUrl} target="_blank" rel="noreferrer">تلگرام</a> : null}{store.whatsappUrl ? <a href={store.whatsappUrl} target="_blank" rel="noreferrer">واتساپ</a> : null}{!store.instagramUrl && !store.telegramUrl && !store.whatsappUrl ? <span>لینک شبکه اجتماعی ثبت نشده</span> : null}</div></section></div><div className="footer-wordmark" aria-hidden="true">{store.storeName}</div><div className="site-footer-bottom"><span>© {new Date().getFullYear()} {store.storeName} · تمامی حقوق محفوظ است</span><div><a href="/products">قوانین خرید</a><a href="/account">حریم خصوصی</a></div></div></footer>
      </body>
    </html>
  );
}
