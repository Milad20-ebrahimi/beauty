"use client";

import { usePathname } from "next/navigation";

type AdminLink = { href: string; exact?: boolean; icon: string; title: string; description: string };

const sections: Array<{ label: string; links: AdminLink[] }> = [
  {
    label: "مرکز مدیریت",
    links: [
      { href: "/admin", exact: true, icon: "⌂", title: "نمای کلی", description: "آمار و مسیر شروع کار" }
    ]
  },
  {
    label: "کاتالوگ فروشگاه",
    links: [
      { href: "/admin/products", icon: "□", title: "محصولات", description: "قیمت، تصویر، موجودی و وضعیت" },
      { href: "/admin/brands", icon: "B", title: "برندها", description: "سازنده و اطلاعات برند" },
      { href: "/admin/categories", icon: "⌘", title: "دسته‌بندی‌ها", description: "ساختار محصولات فروشگاه" },
      { href: "/admin/ingredients", icon: "+", title: "ترکیبات", description: "مواد مؤثره و توضیح کاربرد" }
    ]
  },
  {
    label: "فروش",
    links: [
      { href: "/admin/orders", icon: "#", title: "سفارش‌ها", description: "پرداخت، آماده‌سازی و ارسال" }
    ]
  },
  {
    label: "بررسی خروجی مشتری",
    links: [
      { href: "/recommendations", icon: "✦", title: "پیشنهادهای هوشمند", description: "دیدن رتبه‌بندی محصولات" },
      { href: "/routine", icon: "☼", title: "روتین‌ساز", description: "آزمایش روتین صبح و شب" }
    ]
  }
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="منوی مدیریت">
      {sections.map((section) => (
        <div className="admin-nav-section" key={section.label}>
          <p>{section.label}</p>
          {section.links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <a href={link.href} key={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
                <span className="admin-nav-icon" aria-hidden="true">{link.icon}</span>
                <span className="admin-nav-copy"><strong>{link.title}</strong><small>{link.description}</small></span>
                <span className="admin-nav-arrow">←</span>
              </a>
            );
          })}
        </div>
      ))}
      <div className="admin-roadmap">
        <strong>مراحل بعدی فروشگاه</strong>
        <p>پرداخت، حساب مشتری و نظرات تأییدشده در مراحل بعد اضافه می‌شوند.</p>
      </div>
    </nav>
  );
}
