"use client";

import { usePathname } from "next/navigation";

type AdminLink = { href: string; exact?: boolean; icon: string; title: string; description: string };

const sections: Array<{ label: string; links: AdminLink[] }> = [
  {
    label: "مرکز مدیریت",
    links: [
      { href: "/admin", exact: true, icon: "⌂", title: "نمای کلی", description: "آمار و مسیر شروع کار" },
      { href: "/admin/reports", icon: "↗", title: "گزارش فروش", description: "درآمد، عملکرد و کارهای فوری" }
    ]
  },
  {
    label: "کاتالوگ فروشگاه",
    links: [
      { href: "/admin/products", icon: "□", title: "محصولات", description: "قیمت، تصویر، موجودی و وضعیت" },
      { href: "/admin/inventory", icon: "≡", title: "انبار و موجودی", description: "موجود، رزرو و تاریخچه تغییرات" },
      { href: "/admin/brands", icon: "B", title: "برندها", description: "سازنده و اطلاعات برند" },
      { href: "/admin/categories", icon: "⌘", title: "دسته‌بندی‌ها", description: "ساختار محصولات فروشگاه" },
      { href: "/admin/ingredients", icon: "+", title: "ترکیبات", description: "مواد مؤثره و توضیح کاربرد" }
    ]
  },
  {
    label: "فروش",
    links: [
      { href: "/admin/orders", icon: "#", title: "سفارش‌ها", description: "پرداخت، آماده‌سازی و ارسال" },
      { href: "/admin/customers", icon: "●", title: "مشتریان", description: "خرید، برچسب و وضعیت حساب" },
      { href: "/admin/payment-settings", icon: "$", title: "تنظیمات پرداخت", description: "شماره کارت و راهنمای مشتری" },
      { href: "/admin/shipping", icon: "↗", title: "روش‌های ارسال", description: "هزینه و زمان تحویل" },
      { href: "/admin/discounts", icon: "%", title: "کدهای تخفیف", description: "کمپین، ظرفیت و محدودیت مصرف" },
      { href: "/admin/reviews", icon: "★", title: "نظرات مشتریان", description: "بررسی و انتشار تجربه‌ها" }
    ]
  },
  {
    label: "بررسی خروجی مشتری",
    links: [
      { href: "/admin/homepage", icon: "▤", title: "صفحه اصلی", description: "ویدیو، پوسترها و ویترین محصولات" },
      { href: "/admin/header", icon: "☰", title: "مدیریت نوبار", description: "تبلیغ، لینک‌ها و ترتیب منو" },
      { href: "/admin/media", icon: "◫", title: "کتابخانه رسانه", description: "آپلود تصویر، ویدیو و لوگو" },
      { href: "/admin/store-settings", icon: "⚙", title: "تنظیمات فروشگاه", description: "هدر، فوتر و راه‌های ارتباطی" },
      { href: "/admin/seo", icon: "G", title: "سئو و گوگل", description: "دامنه، عنوان و ایندکس سایت" },
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
        <strong>فروشگاه آماده‌تر شده</strong>
        <p>سفارش، پرداخت، ارسال، حساب مشتری، نظر و تخفیف از همین منو مدیریت می‌شوند.</p>
      </div>
    </nav>
  );
}
