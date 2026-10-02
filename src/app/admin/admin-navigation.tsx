"use client";

import type { Icon } from "@phosphor-icons/react";
import { ChartLineUp, CirclesFour, CreditCard, Flask, House, ImageSquare, Layout, MagnifyingGlass, Package, Percent, ShoppingBag, Sparkle, Star, Storefront, Sun, Tag, Truck, Users, Warehouse } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

type AdminLink = { href: string; exact?: boolean; icon: Icon; title: string; description: string };
const sections: Array<{ label: string; links: AdminLink[] }> = [
  { label: "مرکز مدیریت", links: [
    { href: "/admin", exact: true, icon: House, title: "نمای کلی", description: "آمار و کارهای امروز" },
    { href: "/admin/reports", icon: ChartLineUp, title: "گزارش فروش", description: "درآمد و عملکرد فروشگاه" }
  ]},
  { label: "کاتالوگ فروشگاه", links: [
    { href: "/admin/products", icon: Package, title: "محصولات", description: "قیمت، تصویر و وضعیت" },
    { href: "/admin/inventory", icon: Warehouse, title: "انبار و موجودی", description: "موجود، رزرو و تغییرات" },
    { href: "/admin/brands", icon: Tag, title: "برندها", description: "سازندگان محصولات" },
    { href: "/admin/categories", icon: CirclesFour, title: "دسته‌بندی‌ها", description: "ساختار فروشگاه" },
    { href: "/admin/ingredients", icon: Flask, title: "ترکیبات", description: "مواد مؤثره و کاربرد" }
  ]},
  { label: "فروش و مشتری", links: [
    { href: "/admin/orders", icon: ShoppingBag, title: "سفارش‌ها", description: "پرداخت تا تحویل" },
    { href: "/admin/customers", icon: Users, title: "مشتریان", description: "خرید و وضعیت حساب" },
    { href: "/admin/payment-settings", icon: CreditCard, title: "تنظیمات پرداخت", description: "اطلاعات پرداخت مشتری" },
    { href: "/admin/shipping", icon: Truck, title: "روش‌های ارسال", description: "هزینه و زمان تحویل" },
    { href: "/admin/discounts", icon: Percent, title: "کدهای تخفیف", description: "کمپین و محدودیت مصرف" },
    { href: "/admin/reviews", icon: Star, title: "نظرات مشتریان", description: "بررسی و انتشار نظر" }
  ]},
  { label: "ویترین و تنظیمات", links: [
    { href: "/admin/homepage", icon: Layout, title: "صفحه اصلی", description: "کمپین‌ها و ویترین" },
    { href: "/admin/header", icon: Storefront, title: "هدر، لوگو و فوتر", description: "منو و هویت سایت" },
    { href: "/admin/media", icon: ImageSquare, title: "کتابخانه رسانه", description: "تصویر، ویدیو و لوگو" },
    { href: "/admin/seo", icon: MagnifyingGlass, title: "سئو و گوگل", description: "عنوان و ایندکس سایت" },
    { href: "/recommendations", icon: Sparkle, title: "پیشنهادهای هوشمند", description: "بررسی خروجی مشتری" },
    { href: "/routine", icon: Sun, title: "روتین‌ساز", description: "روتین صبح و شب" }
  ]}
];

export function AdminNavigation() {
  const pathname = usePathname();
  return <nav className="admin-nav" aria-label="منوی مدیریت">
    {sections.map((section) => <div className="admin-nav-section" key={section.label}>
      <p>{section.label}</p>
      {section.links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const LinkIcon = link.icon;
        return <a href={link.href} key={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
          <span className="admin-nav-icon" aria-hidden="true"><LinkIcon size={18} weight={active ? "fill" : "regular"} /></span>
          <span className="admin-nav-copy"><strong>{link.title}</strong><small>{link.description}</small></span>
        </a>;
      })}
    </div>)}
    <div className="admin-roadmap"><strong>راهنما همیشه همراه شماست</strong><p>بالای هر صفحه، کاربرد آن بخش و سه قدم پیشنهادی برای انجام درست کار نوشته شده است.</p></div>
  </nav>;
}
