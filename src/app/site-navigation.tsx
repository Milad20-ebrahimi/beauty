"use client";
import { usePathname } from "next/navigation";

const desktopLinks = [
  { href:"/products", label:"فروشگاه" }, { href:"/needs", label:"براساس نیاز" },
  { href:"/recommendations", label:"پیشنهادهای من" }, { href:"/passport", label:"Beauty Passport" },
  { href:"/routine", label:"روتین من" }
];
const mobileLinks = [
  { href:"/", label:"خانه", icon:"⌂" }, { href:"/products", label:"فروشگاه", icon:"□" },
  { href:"/routine", label:"روتین", icon:"☼" }, { href:"/cart", label:"سبد", icon:"▣" },
  { href:"/account", label:"حساب", icon:"●" }
];

export function SiteNavigation({ cartCount=0, notificationCount=0 }: { cartCount?:number; notificationCount?:number }) {
  const pathname = usePathname();
  const active = (href:string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <>
    <nav className="editorial-nav" aria-label="منوی اصلی">{desktopLinks.map((link)=><a key={link.href} href={link.href} className={active(link.href)?"active":""}>{link.label}</a>)}</nav>
    <nav className="editorial-actions" aria-label="ابزارهای حساب"><a href="/products" aria-label="جست‌وجوی محصولات">⌕</a><a href="/compare" aria-label="مقایسه محصولات">⇄</a><a href="/account/notifications" aria-label="اعلان‌ها" className="header-notification">◉{notificationCount ? <b>{new Intl.NumberFormat("fa-IR").format(notificationCount)}</b>:null}</a><a href="/account" aria-label="حساب من">♙</a><a href="/cart" aria-label="سبد خرید" className="header-cart">▢{cartCount ? <b>{new Intl.NumberFormat("fa-IR").format(cartCount)}</b>:null}</a></nav>
    <nav className="mobile-site-nav" aria-label="منوی موبایل">{mobileLinks.map((link)=><a key={link.href} href={link.href} className={active(link.href)?"active":""}><span>{link.icon}</span><small>{link.label}</small>{link.href==="/cart"&&cartCount?<b>{new Intl.NumberFormat("fa-IR").format(cartCount)}</b>:null}{link.href==="/account"&&notificationCount?<b>{new Intl.NumberFormat("fa-IR").format(notificationCount)}</b>:null}</a>)}</nav>
  </>;
}
